import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './testStorage.js'

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock('../src/services/firebase.js', () => ({
  auth: null,
  db: null,
  isFirebaseConfigured: false,
}))

const { login, logout, register } = await import('../src/services/authService.js')

describe('autenticação no modo demonstração', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage()
  })

  it('cadastra e autentica uma conta normalizando o e-mail', async () => {
    const registered = await register({
      name: 'Cristian Tomaz',
      email: '  CRISTIAN@EXAMPLE.COM ',
      password: 'senha-segura',
      neighborhood: 'Vila Prudente',
    })

    expect(registered.email).toBe('cristian@example.com')
    expect(registered).not.toHaveProperty('passwordHash')

    const authenticated = await login({
      email: 'cristian@example.com',
      password: 'senha-segura',
    })
    expect(authenticated.id).toBe(registered.id)
  })

  it('impede cadastro duplicado', async () => {
    const account = { name: 'Vizinho', email: 'vizinho@example.com', password: '123456', neighborhood: 'Centro' }
    await register(account)

    await expect(register(account)).rejects.toThrow('Já existe uma conta')
  })

  it('rejeita senha incorreta e remove a sessão ao sair', async () => {
    await register({ name: 'Vizinho', email: 'vizinho@example.com', password: '123456', neighborhood: 'Centro' })

    await expect(login({ email: 'vizinho@example.com', password: 'errada' })).rejects.toThrow('E-mail ou senha inválidos')
    await logout()
    expect(localStorage.getItem('ajudavizinho:demo-session')).toBeNull()
  })
})
