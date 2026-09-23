import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './testStorage.js'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(), doc: vi.fn(), getDocs: vi.fn(), query: vi.fn(),
  serverTimestamp: vi.fn(), setDoc: vi.fn(), updateDoc: vi.fn(), where: vi.fn(), writeBatch: vi.fn(),
}))
vi.mock('../src/services/firebase.js', () => ({ db: null, isFirebaseConfigured: false }))

const { createInterest, decideInterest, listInterests } = await import('../src/services/interestService.js')

describe('fluxo de interesses no modo demonstração', () => {
  beforeEach(() => { globalThis.localStorage = createStorage() })

  it('cria uma solicitação e impede duplicidade', async () => {
    const donation = { id: 'item-1', title: 'Cadeira', ownerId: 'doador', status: 'available' }
    const user = { id: 'interessado', name: 'Vizinho' }
    const interest = await createInterest(donation, user)
    expect(interest).toMatchObject({ status: 'pending', interestedUserId: 'interessado' })
    await expect(createInterest(donation, user)).rejects.toThrow('já demonstrou interesse')
  })

  it('impede solicitar a própria doação ou item indisponível', async () => {
    const user = { id: 'doador', name: 'Doador' }
    await expect(createInterest({ id: '1', ownerId: 'doador', status: 'available' }, user)).rejects.toThrow('própria doação')
    await expect(createInterest({ id: '2', ownerId: 'outro', status: 'reserved' }, user)).rejects.toThrow('não está mais disponível')
  })

  it('permite ao doador aceitar e reservar a doação', async () => {
    localStorage.setItem('ajudavizinho:demo-donations', JSON.stringify([{ id: 'item-1', status: 'available' }]))
    const interest = await createInterest({ id: 'item-1', title: 'Cadeira', ownerId: 'doador', status: 'available' }, { id: 'interessado', name: 'Vizinho' })
    const accepted = await decideInterest(interest, 'accepted', { id: 'doador' })
    expect(accepted.status).toBe('accepted')
    expect(JSON.parse(localStorage.getItem('ajudavizinho:demo-donations'))[0].status).toBe('reserved')
    await expect(listInterests({ id: 'doador' })).resolves.toHaveLength(1)
  })
})
