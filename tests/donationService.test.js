import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './testStorage.js'

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
}))

vi.mock('../src/services/firebase.js', () => ({
  db: null,
  isFirebaseConfigured: false,
}))

const { changeDonationStatus, createDonation, deleteDonation, listDonations, updateDonation } = await import('../src/services/donationService.js')

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
      { title: 'Cesta básica', category: 'Alimentos', imageData: 'data:image/jpeg;base64,YQ==' },
      { id: 'usuario-1', name: 'Cristian' },
    )

    expect(donation).toMatchObject({
      title: 'Cesta básica',
      ownerId: 'usuario-1',
      ownerName: 'Cristian',
      status: 'available',
      imageData: 'data:image/jpeg;base64,YQ==',
    })
    await expect(listDonations()).resolves.toEqual([donation])
  })

  it('recupera-se de dados locais inválidos', async () => {
    localStorage.setItem('ajudavizinho:demo-donations', 'conteúdo inválido')
    const fallback = [{ id: 'seguro', title: 'Item seguro' }]

    await expect(listDonations(fallback)).resolves.toEqual(fallback)
  })

  it('permite ao proprietário editar, alterar status e excluir', async () => {
    const user = { id: 'usuario-1', name: 'Cristian' }
    const donation = await createDonation({ title: 'Livro', category: 'Livros' }, user)
    const edited = await updateDonation(donation, { title: 'Livro atualizado', category: 'Livros', neighborhood: 'Centro', description: 'Bom estado', icon: '📚' }, user)
    const reserved = await changeDonationStatus(edited, 'reserved', user)
    expect(reserved).toMatchObject({ title: 'Livro atualizado', status: 'reserved' })
    await deleteDonation(reserved, user)
    await expect(listDonations()).resolves.toEqual([])
  })

  it('impede alterações por outro usuário', async () => {
    const donation = await createDonation({ title: 'Livro', category: 'Livros' }, { id: 'doador', name: 'Doador' })
    await expect(deleteDonation(donation, { id: 'outro' })).rejects.toThrow('Somente o doador')
  })
})
