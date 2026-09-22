import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './testStorage.js'

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
}))

vi.mock('../src/services/firebase.js', () => ({
  db: null,
  isFirebaseConfigured: false,
}))

const { createDonation, listDonations } = await import('../src/services/donationService.js')

describe('doações no modo demonstração', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage()
  })

  it('inicializa a lista com os dados de demonstração', async () => {
    const fallback = [{ id: 'inicial', title: 'Livro' }]

    await expect(listDonations(fallback)).resolves.toEqual(fallback)
  })

  it('cria uma doação associada ao usuário autenticado', async () => {
    const donation = await createDonation(
      { title: 'Cesta básica', category: 'Alimentos' },
      { id: 'usuario-1', name: 'Cristian' },
    )

    expect(donation).toMatchObject({
      title: 'Cesta básica',
      ownerId: 'usuario-1',
      ownerName: 'Cristian',
      status: 'available',
    })
    await expect(listDonations()).resolves.toEqual([donation])
  })

  it('recupera-se de dados locais inválidos', async () => {
    localStorage.setItem('ajudavizinho:demo-donations', 'conteúdo inválido')
    const fallback = [{ id: 'seguro', title: 'Item seguro' }]

    await expect(listDonations(fallback)).resolves.toEqual(fallback)
  })
})
