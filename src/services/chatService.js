import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const MESSAGES_KEY = 'ajudavizinho:demo-messages'
const MAX_MESSAGE_LENGTH = 500

function readLocalMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(MESSAGES_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function timestampValue(value) {
  if (value?.toMillis) return value.toMillis()
  const parsed = new Date(value || 0).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt))
}

function mergeSnapshots(received = [], sent = []) {
  const merged = new Map()
  ;[...received, ...sent].forEach((message) => merged.set(message.id, message))
  return sortMessages([...merged.values()])
}

function validateParticipant(interest, user) {
  if (!user || ![interest.ownerId, interest.interestedUserId].includes(user.id)) {
    throw new Error('Somente as pessoas envolvidas podem acessar esta conversa.')
  }
}

export function validateMessageText(text) {
  const normalized = String(text || '').trim()
  if (!normalized) throw new Error('Digite uma mensagem.')
  if (normalized.length > MAX_MESSAGE_LENGTH) throw new Error('A mensagem deve ter no máximo 500 caracteres.')
  return normalized
}

export function observeUserMessages(user, onChange, onError = () => {}) {
  if (!user) return () => {}
  if (!isFirebaseConfigured) {
    onChange(readLocalMessages().filter((message) => message.ownerId === user.id || message.interestedUserId === user.id))
    return () => {}
  }

  const reference = collection(db, 'messages')
  const state = { owner: [], interested: [], ownerReady: false, interestedReady: false }
  const readSnapshot = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  const emit = () => {
    if (state.ownerReady && state.interestedReady) onChange(mergeSnapshots(state.owner, state.interested))
  }

  const unsubscribeOwner = onSnapshot(
    query(reference, where('ownerId', '==', user.id)),
    (snapshot) => {
      state.owner = readSnapshot(snapshot)
      state.ownerReady = true
      emit()
    },
    onError,
  )
  const unsubscribeInterested = onSnapshot(
    query(reference, where('interestedUserId', '==', user.id)),
    (snapshot) => {
      state.interested = readSnapshot(snapshot)
      state.interestedReady = true
      emit()
    },
    onError,
  )

  return () => {
    unsubscribeOwner()
    unsubscribeInterested()
  }
}

export async function sendMessage(interest, user, text, donationStatus = 'reserved') {
  validateParticipant(interest, user)
  if (interest.status !== 'accepted') throw new Error('O chat só é liberado depois que o interesse é aceito.')
  if (donationStatus !== 'reserved') throw new Error('Esta conversa está encerrada porque a doação não está reservada.')

  const message = {
    interestId: interest.id,
    donationId: interest.donationId,
    donationTitle: interest.donationTitle,
    ownerId: interest.ownerId,
    interestedUserId: interest.interestedUserId,
    senderId: user.id,
    senderName: user.name,
    text: validateMessageText(text),
    seenByRecipient: false,
  }

  if (isFirebaseConfigured) {
    const saved = await addDoc(collection(db, 'messages'), { ...message, createdAt: serverTimestamp() })
    return { id: saved.id, ...message }
  }

  const saved = { id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`, ...message, createdAt: new Date().toISOString() }
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([...readLocalMessages(), saved]))
  return saved
}

export async function listMessages(interest, user) {
  validateParticipant(interest, user)
  if (!isFirebaseConfigured) {
    return sortMessages(readLocalMessages().filter((message) => message.interestId === interest.id))
  }

  const field = interest.ownerId === user.id ? 'ownerId' : 'interestedUserId'
  const snapshot = await getDocs(query(collection(db, 'messages'), where(field, '==', user.id)))
  return sortMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((message) => message.interestId === interest.id))
}

export async function markMessagesSeen(messages, user) {
  const unread = messages.filter((message) => message.senderId !== user?.id && message.seenByRecipient !== true)
  if (!unread.length) return messages

  if (isFirebaseConfigured) {
    const batch = writeBatch(db)
    unread.forEach((message) => batch.update(doc(db, 'messages', message.id), { seenByRecipient: true }))
    await batch.commit()
  } else {
    const unreadIds = new Set(unread.map((message) => message.id))
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(readLocalMessages().map((message) => unreadIds.has(message.id) ? { ...message, seenByRecipient: true } : message)))
  }

  return messages.map((message) => unread.some((unreadMessage) => unreadMessage.id === message.id) ? { ...message, seenByRecipient: true } : message)
}
