import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

export async function updateDonation(donation, changes, user) {
  if (donation.ownerId !== user.id) throw new Error('Somente o doador pode editar esta publicação.')
  const allowedChanges = {
    title: changes.title.trim(),
    category: changes.category,
    neighborhood: changes.neighborhood.trim(),
    description: changes.description.trim(),
    icon: changes.icon,
  }

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, 'donations', donation.id), { ...allowedChanges, updatedAt: serverTimestamp() })
    return { ...donation, ...allowedChanges }
  }

  const current = readLocalDonations([])
  const updated = { ...donation, ...allowedChanges, updatedAt: new Date().toISOString() }
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(current.map((item) => item.id === donation.id ? updated : item)))
  return updated
}

export async function changeDonationStatus(donation, status, user) {
  if (donation.ownerId !== user.id) throw new Error('Somente o doador pode alterar o status.')
  if (!['available', 'reserved', 'donated'].includes(status)) throw new Error('Status inválido.')

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, 'donations', donation.id), { status, updatedAt: serverTimestamp() })
  } else {
    const current = readLocalDonations([])
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(current.map((item) => item.id === donation.id ? { ...item, status } : item)))
  }
  return { ...donation, status }
}

export async function deleteDonation(donation, user) {
  if (donation.ownerId !== user.id) throw new Error('Somente o doador pode excluir esta publicação.')

  if (isFirebaseConfigured) await deleteDoc(doc(db, 'donations', donation.id))
  else {
    const current = readLocalDonations([])
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(current.filter((item) => item.id !== donation.id)))
  }
}
