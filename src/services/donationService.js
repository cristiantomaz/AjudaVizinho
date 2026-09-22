import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const DONATIONS_KEY = 'ajudavizinho:demo-donations'

function readLocalDonations(fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(DONATIONS_KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    // Um valor local inválido é substituído pelos dados de demonstração.
  }
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(fallback))
  return fallback
}

export async function listDonations(fallback = []) {
  if (!isFirebaseConfigured) return readLocalDonations(fallback)

  const snapshot = await getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export async function createDonation(data, user) {
  const donation = {
    ...data,
    ownerId: user.id,
    ownerName: user.name,
    status: 'available',
    posted: 'Agora',
  }

  if (isFirebaseConfigured) {
    const reference = await addDoc(collection(db, 'donations'), {
      ...donation,
      createdAt: serverTimestamp(),
    })
    return { id: reference.id, ...donation }
  }

  const current = readLocalDonations([])
  const localDonation = { id: crypto.randomUUID(), ...donation, createdAt: new Date().toISOString() }
  localStorage.setItem(DONATIONS_KEY, JSON.stringify([localDonation, ...current]))
  return localDonation
}
