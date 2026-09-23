import {
  collection,
  doc,
  getDoc,
  getDocs,
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
  }

  if (isFirebaseConfigured) {
    const reference = doc(db, 'interests', id)
    if ((await getDoc(reference)).exists()) throw new Error('Você já demonstrou interesse neste item.')
    await setDoc(reference, { ...interest, createdAt: serverTimestamp() })
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
  const merged = new Map()
  ;[...received.docs, ...sent.docs].forEach((item) => merged.set(item.id, { id: item.id, ...item.data() }))
  return [...merged.values()]
}

export async function decideInterest(interest, decision, user) {
  if (interest.ownerId !== user.id) throw new Error('Somente o doador pode responder à solicitação.')
  if (!['accepted', 'rejected'].includes(decision)) throw new Error('Decisão inválida.')

  if (isFirebaseConfigured) {
    if (decision === 'accepted') {
      const batch = writeBatch(db)
      batch.update(doc(db, 'interests', interest.id), { status: decision, updatedAt: serverTimestamp() })
      batch.update(doc(db, 'donations', interest.donationId), { status: 'reserved', updatedAt: serverTimestamp() })
      await batch.commit()
    } else {
      await updateDoc(doc(db, 'interests', interest.id), { status: decision, updatedAt: serverTimestamp() })
    }
  } else {
    const current = readLocalInterests()
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(current.map((item) => item.id === interest.id ? { ...item, status: decision } : item)))
    if (decision === 'accepted') {
      const donations = JSON.parse(localStorage.getItem('ajudavizinho:demo-donations') || '[]')
      localStorage.setItem('ajudavizinho:demo-donations', JSON.stringify(donations.map((item) => item.id === interest.donationId ? { ...item, status: 'reserved' } : item)))
    }
  }
  return { ...interest, status: decision }
}
