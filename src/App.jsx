import { useEffect, useMemo, useState } from 'react'
import { login, logout, observeAuth, register } from './services/authService.js'
import { createDonation as persistDonation, listDonations } from './services/donationService.js'
import { persistenceMode } from './services/firebase.js'

const categories = ['Todos', 'Roupas', 'Móveis', 'Livros', 'Brinquedos', 'Eletrônicos']

const initialDonations = [
  {
    id: 1,
    title: 'Cadeira para escritório',
    category: 'Móveis',
    neighborhood: 'Vila Assunção',
    description: 'Cadeira em bom estado, com pequenos sinais de uso.',
    icon: '🪑',
    posted: 'Hoje',
  },
  {
    id: 2,
    title: 'Coleção de livros infantis',
    category: 'Livros',
    neighborhood: 'Centro',
    description: 'Seis livros ilustrados indicados para crianças de 6 a 9 anos.',
    icon: '📚',
    posted: 'Ontem',
  },
  {
    id: 3,
    title: 'Casaco de inverno',
    category: 'Roupas',
    neighborhood: 'Jardim Bela Vista',
    description: 'Casaco tamanho M, higienizado e pronto para uso.',
    icon: '🧥',
    posted: 'Há 2 dias',
  },
  {
    id: 4,
    title: 'Carrinho de brinquedo',
    category: 'Brinquedos',
    neighborhood: 'Campestre',
    description: 'Brinquedo resistente, sem peças soltas e em bom estado.',
    icon: '🚗',
    posted: 'Há 3 dias',
  },
]

function Header({ currentUser, onAuth, onDonate, onLogout }) {
  return (
    <header className="header">
      <a className="brand" href="#inicio" aria-label="AjudaVizinho — início">
        <span className="brand-mark" aria-hidden="true">AV</span>
        <span>AjudaVizinho</span>
      </a>
      <nav className="nav" aria-label="Navegação principal">
        <a href="#doacoes">Doações</a>
        <a href="#como-funciona">Como funciona</a>
        {currentUser ? (
          <div className="user-menu">
            <span>Olá, {currentUser.name.split(' ')[0]}</span>
            <button className="link-button" type="button" onClick={onLogout}>Sair</button>
          </div>
        ) : (
          <button className="link-button" type="button" onClick={onAuth}>Entrar</button>
        )}
        <button className="button button-small" type="button" onClick={onDonate}>Doar item</button>
      </nav>
    </header>
  )
}

function DonationCard({ donation, onSelect }) {
  return (
    <article className="donation-card">
      <div className={`card-visual visual-${donation.id % 4}`} aria-hidden="true">
        <span>{donation.icon}</span>
        <span className="status">Disponível</span>
      </div>
      <div className="card-content">
        <p className="eyebrow">{donation.category}</p>
        <h3>{donation.title}</h3>
        <p className="location">● {donation.neighborhood} · {donation.posted}</p>
        <p>{donation.description}</p>
        <button className="text-button" type="button" onClick={() => onSelect(donation)}>
          Ver detalhes <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}

function DonationModal({ donation, onClose }) {
  if (!donation) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Fechar detalhes">×</button>
        <div className="modal-icon" aria-hidden="true">{donation.icon}</div>
        <p className="eyebrow">{donation.category} · Disponível</p>
        <h2 id="detail-title">{donation.title}</h2>
        <p className="location">● {donation.neighborhood} · {donation.posted}</p>
        <p>{donation.description}</p>
        <button className="button button-full" type="button">Tenho interesse</button>
        <small>O contato será liberado somente após a aprovação do doador.</small>
      </section>
    </div>
  )
}

function DonateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', category: 'Roupas', neighborhood: '', description: '' })

  function handleSubmit(event) {
    event.preventDefault()
    onCreate(form)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal modal-form" role="dialog" aria-modal="true" aria-labelledby="donate-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Fechar formulário">×</button>
        <p className="eyebrow">Nova publicação</p>
        <h2 id="donate-title">Doe algo que já cumpriu seu papel na sua casa.</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome do item<input required maxLength="60" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <div className="form-row">
            <label>Categoria<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Bairro<input required maxLength="40" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></label>
          </div>
          <label>Descrição<textarea required maxLength="240" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="button button-full" type="submit">Publicar doação</button>
        </form>
        <small>Nesta primeira interface, os dados permanecem apenas durante a sessão.</small>
      </section>
    </div>
  )
}

function AuthModal({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', neighborhood: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = mode === 'register' ? await register(form) : await login(form)
      onAuthenticated(user)
    } catch (caughtError) {
      setError(caughtError.message || 'Não foi possível concluir a autenticação.')
    } finally {
      setLoading(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal modal-form" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Fechar autenticação">×</button>
        <p className="eyebrow">Sua conta</p>
        <h2 id="auth-title">{mode === 'login' ? 'Entre para continuar' : 'Faça parte da comunidade'}</h2>
        <div className="auth-tabs" role="tablist" aria-label="Tipo de acesso">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => changeMode('login')}>Entrar</button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => changeMode('register')}>Criar conta</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label>Nome<input required maxLength="80" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Bairro<input required maxLength="40" autoComplete="address-level3" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></label>
            </>
          )}
          <label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Senha<input required type="password" minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-full" type="submit" disabled={loading}>{loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        {persistenceMode === 'demo-local' && <small>Modo demonstração: a conta fica somente neste navegador até o Firebase ser configurado.</small>}
      </section>
    </div>
  )
}

export default function App() {
  const [donations, setDonations] = useState(initialDonations)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [donateOpen, setDonateOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingDonations, setLoadingDonations] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => observeAuth(setCurrentUser), [])

  useEffect(() => {
    let active = true
    listDonations(initialDonations)
      .then((items) => { if (active) setDonations(items) })
      .catch(() => { if (active) setNotice('Não foi possível carregar as doações. Exibindo dados demonstrativos.') })
      .finally(() => { if (active) setLoadingDonations(false) })
    return () => { active = false }
  }, [])

  const filteredDonations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    return donations.filter((donation) => {
      const matchesCategory = category === 'Todos' || donation.category === category
      const searchable = `${donation.title} ${donation.description} ${donation.neighborhood}`.toLocaleLowerCase('pt-BR')
      return matchesCategory && searchable.includes(normalizedQuery)
    })
  }, [category, donations, query])

  function openDonationForm() {
    if (!currentUser) {
      setNotice('Entre ou crie uma conta antes de publicar uma doação.')
      setAuthOpen(true)
      return
    }
    setDonateOpen(true)
  }

  async function createDonation(form) {
    const iconByCategory = { Roupas: '👕', Móveis: '🪑', Livros: '📚', Brinquedos: '🧸', Eletrônicos: '🔌' }
    try {
      const donation = await persistDonation({ ...form, icon: iconByCategory[form.category] }, currentUser)
      setDonations((current) => [donation, ...current.filter((item) => item.id !== donation.id)])
      setDonateOpen(false)
      setNotice(persistenceMode === 'firebase' ? 'Doação publicada no Firebase.' : 'Doação salva neste navegador no modo demonstração.')
    } catch {
      setNotice('Não foi possível publicar a doação. Verifique os dados e tente novamente.')
    }
  }

  async function handleLogout() {
    await logout()
    setCurrentUser(null)
    setNotice('Sessão encerrada.')
  }

  return (
    <>
      <Header currentUser={currentUser} onAuth={() => setAuthOpen(true)} onDonate={openDonationForm} onLogout={handleLogout} />
      <main>
        <div className={`mode-banner ${persistenceMode === 'firebase' ? 'connected' : ''}`} role="status">
          <strong>{persistenceMode === 'firebase' ? 'Firebase conectado' : 'Modo demonstração local'}</strong>
          <span>{persistenceMode === 'firebase' ? 'Contas e doações são persistidas na nuvem.' : 'Configure o Firebase para compartilhar dados entre dispositivos.'}</span>
        </div>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow">Solidariedade começa perto</p>
            <h1>O que não serve mais para você pode transformar o dia de alguém.</h1>
            <p>Doe itens em bom estado, encontre o que precisa e fortaleça sua comunidade de um jeito simples e seguro.</p>
            <div className="hero-actions">
              <a className="button" href="#doacoes">Encontrar doações</a>
              <button className="button button-secondary" type="button" onClick={openDonationForm}>Quero doar</button>
            </div>
            <div className="trust-row" aria-label="Diferenciais">
              <span>✓ Gratuito</span><span>✓ Local</span><span>✓ Sem venda</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Ilustração de uma caixa de doações">
            <div className="sun"></div>
            <div className="box"><span>♥</span></div>
            <span className="floating-item item-one">📘</span>
            <span className="floating-item item-two">🧸</span>
            <span className="floating-item item-three">👕</span>
          </div>
        </section>

        <section className="search-panel" aria-label="Buscar doações">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Pesquisar doações</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="O que você está procurando?" />
          </label>
          <label className="category-field">
            <span className="sr-only">Filtrar por categoria</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item === 'Todos' ? 'Todas as categorias' : item}</option>)}
            </select>
          </label>
        </section>

        {notice && <div className="notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}

        <section className="donations-section" id="doacoes">
          <div className="section-heading">
            <div><p className="eyebrow">Perto de você</p><h2>Doações disponíveis</h2></div>
            <p>{filteredDonations.length} {filteredDonations.length === 1 ? 'item encontrado' : 'itens encontrados'}</p>
          </div>
          {loadingDonations ? (
            <div className="empty-state" role="status"><span aria-hidden="true">◌</span><h3>Carregando doações</h3><p>Aguarde um instante.</p></div>
          ) : filteredDonations.length > 0 ? (
            <div className="donation-grid">{filteredDonations.map((donation) => <DonationCard key={donation.id} donation={donation} onSelect={setSelected} />)}</div>
          ) : (
            <div className="empty-state"><span aria-hidden="true">⌕</span><h3>Nenhuma doação encontrada</h3><p>Tente buscar outro termo ou selecionar uma categoria diferente.</p></div>
          )}
        </section>

        <section className="how-section" id="como-funciona">
          <div><p className="eyebrow">Simples do início ao fim</p><h2>Como funciona</h2></div>
          <ol className="steps">
            <li><span>01</span><h3>Publique</h3><p>Cadastre um item em bom estado com as informações essenciais.</p></li>
            <li><span>02</span><h3>Conecte</h3><p>Uma pessoa da comunidade demonstra interesse na doação.</p></li>
            <li><span>03</span><h3>Combine</h3><p>Você aprova a solicitação e combina a entrega com segurança.</p></li>
          </ol>
        </section>
      </main>
      <footer><strong>AjudaVizinho</strong><span>Projeto acadêmico · Ciência da Computação</span></footer>
      <DonationModal donation={selected} onClose={() => setSelected(null)} />
      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} onCreate={createDonation} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={(user) => { setCurrentUser(user); setAuthOpen(false); setNotice(`Bem-vindo, ${user.name.split(' ')[0]}!`) }} />}
    </>
  )
}
