import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './testStorage.js'

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(), collection: vi.fn(), doc: vi.fn(), getDocs: vi.fn(), onSnapshot: vi.fn(),
  query: vi.fn(), serverTimestamp: vi.fn(), where: vi.fn(), writeBatch: vi.fn(),
}))
vi.mock('../src/services/firebase.js', () => ({ db: null, isFirebaseConfigured: false }))

const { listMessages, markMessagesSeen, sendMessage } = await import('../src/services/chatService.js')

const interest = {
  id: 'interest-1',
  donationId: 'donation-1',
  donationTitle: 'Cadeira',
  ownerId: 'doador',
  interestedUserId: 'interessado',
  status: 'accepted',
}
const owner = { id: 'doador', name: 'Doador' }
const interested = { id: 'interessado', name: 'Vizinho' }

describe('chat de uma solicitação aceita no modo demonstração', () => {
  beforeEach(() => { globalThis.localStorage = createStorage() })

  it('permite a conversa privada e mantém as mensagens em ordem cronológica', async () => {
    const first = await sendMessage(interest, owner, '  Olá!  ')
    const second = await sendMessage(interest, interested, 'Posso retirar amanhã?')
    const messages = await listMessages(interest, owner)

    expect(first).toMatchObject({ senderId: 'doador', text: 'Olá!', seenByRecipient: false })
    expect(second.senderId).toBe('interessado')
    expect(messages.map((message) => message.id)).toEqual([first.id, second.id])
  })

  it('bloqueia mensagens antes do aceite, de terceiros e após o fim da reserva', async () => {
    await expect(sendMessage({ ...interest, status: 'pending' }, owner, 'Olá')).rejects.toThrow('depois que o interesse é aceito')
    await expect(sendMessage(interest, { id: 'terceiro', name: 'Terceiro' }, 'Olá')).rejects.toThrow('pessoas envolvidas')
    await expect(sendMessage(interest, owner, 'Olá', 'donated')).rejects.toThrow('conversa está encerrada')
    await expect(sendMessage(interest, owner, '   ')).rejects.toThrow('Digite uma mensagem')
  })

  it('marca apenas as mensagens recebidas como lidas sem duplicá-las', async () => {
    const sent = await sendMessage(interest, owner, 'Mensagem enviada')
    const received = await sendMessage(interest, interested, 'Mensagem recebida')
    const viewed = await markMessagesSeen([sent, received], owner)
    const stored = await listMessages(interest, owner)

    expect(viewed[0].seenByRecipient).toBe(false)
    expect(viewed[1].seenByRecipient).toBe(true)
    expect(stored).toHaveLength(2)
    expect(stored[1].seenByRecipient).toBe(true)
  })
})
