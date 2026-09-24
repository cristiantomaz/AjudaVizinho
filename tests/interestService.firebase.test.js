import { beforeEach, describe, expect, it, vi } from 'vitest'

const setDoc = vi.fn()
const doc = vi.fn(() => ({ path: 'interests/item-1_interessado' }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc,
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => 'timestamp'),
  setDoc,
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}))

vi.mock('../src/services/firebase.js', () => ({
  db: { name: 'default' },
  isFirebaseConfigured: true,
}))

const { createInterest } = await import('../src/services/interestService.js')

describe('interesses no Firebase', () => {
  beforeEach(() => {
    setDoc.mockReset()
    doc.mockClear()
  })

  it('cria o documento diretamente sem consultar um interesse inexistente', async () => {
    setDoc.mockResolvedValue()

    const result = await createInterest(
      { id: 'item-1', title: 'Cadeira', ownerId: 'doador', status: 'available' },
      { id: 'interessado', name: 'Vizinho' },
    )

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'interests', 'item-1_interessado')
    expect(setDoc).toHaveBeenCalledOnce()
    expect(result).toMatchObject({ id: 'item-1_interessado', status: 'pending', ownerSeen: false })
    expect(setDoc.mock.calls[0][1]).toMatchObject({ ownerSeen: false })
  })

  it('traduz uma recusa das regras para uma orientação compreensível', async () => {
    setDoc.mockRejectedValue({ code: 'permission-denied' })

    await expect(createInterest(
      { id: 'item-1', title: 'Cadeira', ownerId: 'doador', status: 'available' },
      { id: 'interessado', name: 'Vizinho' },
    )).rejects.toThrow('já ter solicitado')
  })
})
