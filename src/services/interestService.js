import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const INTERESTS_KEY = 'ajudavizinho:demo-interests'

function readLocalInterests() {
  try {
    const saved = JSON.parse(localStorage.getItem(INTERESTS_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function mergeSnapshots(received = [], sent = []) {
  const merged = new Map()
  ;[...received, ...sent].forEach((item) => merged.set(item.id, item))
  return [...merged.values()]
}

export async function createInterest(donation, user) {
  if (!user) throw new Error('Entre para demonstrar interesse.')
  if (donation.ownerId === user.id) throw new Error('Você não pode solicitar a própria doação.')
  if (donation.status !== 'available') throw new Error('Esta doação não está mais disponível.')

  const id = `${donation.id}_${user.id}`
  const interest = {
    id,
    donationId: donation.id,
    donationTitle: donation.title,
    ownerId: donation.ownerId,
    interestedUserId: user.id,
    interestedUserName: user.name,
    status: 'pending',
    ownerSeen: false,
  }

  if (isFirebaseConfigured) {
    const reference = doc(db, 'interests', id)
    try {
      await setDoc(reference, { ...interest, createdAt: serverTimestamp() })
    } catch (error) {
      if (error?.code === 'permission-denied') {
        throw new Error('Não foi possível enviar o interesse. Você pode já ter solicitado este item ou ele não está mais disponível.')
      }
      throw error
    }
    return interest
  }

  const current = readLocalInterests()
  if (current.some((item) => item.id === id)) throw new Error('Você já demonstrou interesse neste item.')
  localStorage.setItem(INTERESTS_KEY, JSON.stringify([{ ...interest, createdAt: new Date().toISOString() }, ...current]))
  return interest
}

export async function listInterests(user) {
  if (!user) return []
  if (!isFirebaseConfigured) {
    return readLocalInterests().filter((item) => item.ownerId === user.id || item.interestedUserId === user.id)
  }

  const reference = collection(db, 'interests')
  const [received, sent] = await Promise.all([
    getDocs(query(reference, where('ownerId', '==', user.id))),
    getDocs(query(reference, where('interestedUserId', '==', user.id))),
  ])
  return mergeSnapshots(
    received.docs.map((item) => ({ id: item.id, ...item.data() })),
    sent.docs.map((item) => ({ id: item.id, ...item.data() })),
  )
}

export function observeInterests(user, onChange, onError = () => {}) {
  if (!user) return () => {}
  if (!isFirebaseConfigured) {
    listInterests(user).then(onChange).catch(onError)
    return () => {}
  }

  const reference = collection(db, 'interests')
  const state = { received: [], sent: [], receivedReady: false, sentReady: false }
  const emit = () => {
    if (state.receivedReady && state.sentReady) onChange(mergeSnapshots(state.received, state.sent))
  }
  const readSnapshot = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

  const unsubscribeReceived = onSnapshot(
    query(reference, where('ownerId', '==', user.id)),
    (snapshot) => {
      state.received = readSnapshot(snapshot)
      state.receivedReady = true
      emit()
    },
    onError,
  )
  const unsubscribeSent = onSnapshot(
    query(reference, where('interestedUserId', '==', user.id)),
    (snapshot) => {
      state.sent = readSnapshot(snapshot)
      state.sentReady = true
      emit()
    },
    onError,
  )

  return () => {
    unsubscribeReceived()
    unsubscribeSent()
  }
}

export async function markOwnerInterestsSeen(interests, user) {
  const unread = interests.filter((item) => item.ownerId === user?.id && item.ownerSeen !== true)
  if (!unread.length) return interests

  if (isFirebaseConfigured) {
    const batch = writeBatch(db)
    unread.forEach((item) => batch.update(doc(db, 'interests', item.id), { ownerSeen: true, updatedAt: serverTimestamp() }))
    await batch.commit()
  } else {
    const unreadIds = new Set(unread.map((item) => item.id))
    const current = readLocalInterests()
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(current.map((item) => unreadIds.has(item.id) ? { ...item, ownerSeen: true } : item)))
  }

  return interests.map((item) => unread.some((unreadItem) => unreadItem.id === item.id) ? { ...item, ownerSeen: true } : item)
}

export async function decideInterest(interest, decision, user) {
  if (interest.ownerId !== user.id) throw new Error('Somente o doador pode responder à solicitação.')
  if (!['accepted', 'rejected'].includes(decision)) throw new Error('Decisão inválida.')

  if (isFirebaseConfigured) {
    if (decision === 'accepted') {
      const batch = writeBatch(db)
      batch.update(doc(db, 'interests', interest.id), { status: decision, ownerSeen: true, updatedAt: serverTimestamp() })
      batch.update(doc(db, 'donations', interest.donationId), { status: 'reserved', updatedAt: serverTimestamp() })
      await batch.commit()
    } else {
      await updateDoc(doc(db, 'interests', interest.id), { status: decision, ownerSeen: true, updatedAt: serverTimestamp() })
    }
  } else {
    const current = readLocalInterests()
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(current.map((item) => item.id === interest.id ? { ...item, status: decision, ownerSeen: true } : item)))
    if (decision === 'accepted') {
      const donations = JSON.parse(localStorage.getItem('ajudavizinho:demo-donations') || '[]')
      localStorage.setItem('ajudavizinho:demo-donations', JSON.stringify(donations.map((item) => item.id === interest.donationId ? { ...item, status: 'reserved' } : item)))
    }
  }
  return { ...interest, status: decision, ownerSeen: true }
}
