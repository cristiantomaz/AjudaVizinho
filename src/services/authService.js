import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase.js'

const ACCOUNTS_KEY = 'ajudavizinho:demo-accounts'
const SESSION_KEY = 'ajudavizinho:demo-session'

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function publicUser(account) {
  const { passwordHash: _passwordHash, ...user } = account
  return user
}

export function observeAuth(callback) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, (user) => callback(user ? {
      id: user.uid,
      name: user.displayName || 'Usuário',
      email: user.email,
      mode: 'firebase',
    } : null))
  }

  callback(readJson(SESSION_KEY, null))
  const syncSession = () => callback(readJson(SESSION_KEY, null))
  window.addEventListener('storage', syncSession)
  return () => window.removeEventListener('storage', syncSession)
}

export async function register({ name, email, password, neighborhood }) {
  const normalizedEmail = email.trim().toLowerCase()

  if (isFirebaseConfigured) {
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
    await updateProfile(credential.user, { displayName: name.trim() })
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: name.trim(),
      email: normalizedEmail,
      neighborhood: neighborhood.trim(),
      createdAt: serverTimestamp(),
    })
    return { id: credential.user.uid, name: name.trim(), email: normalizedEmail, neighborhood, mode: 'firebase' }
  }

  const accounts = readJson(ACCOUNTS_KEY, [])
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('Já existe uma conta de demonstração com este e-mail.')
  }

  const account = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    neighborhood: neighborhood.trim(),
    passwordHash: await hashPassword(password),
    mode: 'demo-local',
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  const user = publicUser(account)
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()

  if (isFirebaseConfigured) {
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
    return {
      id: credential.user.uid,
      name: credential.user.displayName || 'Usuário',
      email: credential.user.email,
      mode: 'firebase',
    }
  }

  const passwordHash = await hashPassword(password)
  const account = readJson(ACCOUNTS_KEY, []).find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash)
  if (!account) throw new Error('E-mail ou senha inválidos no modo demonstração.')
  const user = publicUser(account)
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export async function logout() {
  if (isFirebaseConfigured) await firebaseSignOut(auth)
  else localStorage.removeItem(SESSION_KEY)
}
