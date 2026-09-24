# 📝 Proposta de Projeto — AjudaVizinho

> Documento elaborado com base no template oficial da disciplina Desenvolvimento de Software para a Sociedade.

## 📋 Informações Básicas

### Nome do Projeto

**AjudaVizinho — Plataforma de Doações Comunitárias**

### Equipe

| Nome | GitHub | Papel Principal |
|---|---|---|
| Cristian Tomaz | [@cristiantomaz](https://github.com/cristiantomaz) | Full Stack / documentação |

### Link do Repositório

https://github.com/cristiantomaz/AjudaVizinho

---

## 🎯 Identificação do Problema

### 1. Descrição do Problema

Pessoas descartam ou guardam roupas, livros, móveis, brinquedos, utensílios e outros objetos ainda utilizáveis, enquanto moradores da mesma região podem precisar desses itens e não ter condições de comprá-los.

O problema ocorre quando não existe um canal simples e organizado para aproximar doadores e interessados. Grupos em redes sociais e aplicativos de mensagens misturam anúncios, dificultam pesquisas e não oferecem um fluxo claro para acompanhar a disponibilidade do item.

Isso provoca desperdício, descarte desnecessário e perda de oportunidades de ajuda dentro da própria comunidade.

**Questão do projeto:** Como uma plataforma web simples pode conectar pessoas que possuem itens para doar a moradores próximos que precisam desses itens?

### 2. Pesquisa de Soluções Existentes

| Solução existente | Limitações para este problema | Como o AjudaVizinho é diferente |
|---|---|---|
| Grupos de WhatsApp | Mensagens se perdem e a busca é limitada | Catálogo organizado com busca, categoria e status |
| Facebook Marketplace | Mistura venda e doação e possui alcance amplo | Foco exclusivo em doações comunitárias |
| OLX | Orientada principalmente à compra e venda | Fluxo gratuito de interesse e destinação do item |
| Campanhas pontuais | Dependem de datas e organizações específicas | Doações disponíveis continuamente entre moradores |

A validação com 2–3 potenciais usuários será registrada em `docs/validacao.md`, preservando dados pessoais.

### 3. Público-Alvo

- **Idade:** pessoas a partir de 18 anos;
- **Perfil:** moradores que desejam doar ou receber itens em sua comunidade;
- **Necessidades:** publicar com facilidade, localizar itens, filtrar resultados, acompanhar solicitações e saber se o item está disponível;
- **Conhecimento tecnológico:** iniciante a intermediário.

---

## 💡 Solução Proposta

### 1. Descrição da Solução

O AjudaVizinho será uma aplicação web responsiva para organizar doações locais. Após criar uma conta, o usuário poderá publicar um item com título, descrição, categoria e bairro. Outros usuários poderão consultar o catálogo, pesquisar itens e demonstrar interesse.

O doador visualizará as solicitações e poderá aceitar ou recusar uma delas. O item terá estados definidos — disponível, reservado e doado — para evitar solicitações sobre itens que já foram destinados.

A proposta prioriza simplicidade, impacto social e um MVP demonstrável. Chat interno, avaliações e geolocalização avançada ficarão fora da primeira versão.

### 2. Funcionalidades Principais (MVP)

- [x] **Autenticação de usuários**
  - Descrição: cadastro, login e logout.
  - Valor: identifica os participantes e protege ações de gerenciamento.

- [x] **Gerenciamento de doações**
  - Descrição: criar, visualizar, editar e excluir publicações próprias.
  - Valor: permite ao doador manter os dados e a disponibilidade corretos.

- [x] **Catálogo com busca e filtros**
  - Descrição: listar itens disponíveis e pesquisar por título ou categoria.
  - Valor: reduz o esforço para encontrar uma doação útil.

- [x] **Manifestação de interesse**
  - Descrição: solicitar um item e permitir que o doador aceite ou recuse.
  - Valor: estabelece o fluxo entre publicação e destinação.

- [x] **Acompanhamento de status**
  - Descrição: marcar itens como disponível, reservado ou doado.
  - Valor: torna o andamento da doação claro para todos.

### 3. Funcionalidades Futuras (Pós-MVP)

- [ ] Chat interno;
- [ ] Avaliações e reputação;
- [ ] Notificações;
- [ ] Mapa e geolocalização;
- [ ] Denúncia de conteúdo;
- [ ] Integração com organizações sociais;
- [ ] Aplicativo móvel.

---

## 🛠️ Especificações Técnicas

### 1. Arquitetura do Sistema

```text
┌─────────────────────────┐
│ FRONTEND                │
│ React + Vite + CSS      │
└───────────┬─────────────┘
            │ Firebase SDK
┌───────────▼─────────────┐
│ SERVIÇOS FIREBASE       │
│ Auth + regras de acesso │
└───────────┬─────────────┘
            │ NoSQL
┌───────────▼─────────────┐
│ CLOUD FIRESTORE         │
│ usuários/doações/pedidos│
└─────────────────────────┘
```

### 2. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | React + Vite | Componentização, rapidez de desenvolvimento e ampla documentação |
| Estilização | CSS responsivo | Baixa complexidade e controle visual direto |
| Backend | Firebase Authentication e SDK | Reduz infraestrutura sem eliminar autenticação e regras de negócio |
| Banco de dados | Cloud Firestore | Banco NoSQL adequado ao MVP e integrado ao Firebase |
| Hospedagem | Firebase Hosting | Publicação estática integrada ao projeto Firebase |
| Gestão | GitHub | Código, Issues, branches, Pull Requests e documentação |

### 3. Requisitos Não Funcionais

- **Performance:** carregar a página inicial em até 3 segundos em conexão estável;
- **Segurança:** autenticação, regras do Firestore, validação de entrada e HTTPS;
- **Usabilidade:** fluxo principal compreensível sem treinamento;
- **Acessibilidade:** HTML semântico, contraste adequado, navegação por teclado e textos alternativos;
- **Responsividade:** funcionamento a partir de 320 px de largura;
- **Manutenibilidade:** componentes organizados e responsabilidades separadas.

---

## 📅 Planejamento

### Cronograma acadêmico de 3 meses

#### Mês 1: Fundação

- [x] Definir problema, solução e MVP;
- [x] Criar repositório e documentação inicial;
- [ ] Validar a ideia com 2–3 potenciais usuários;
- [ ] Criar wireframes e modelo de dados;
- [x] Configurar React e Firebase.

#### Mês 2: Desenvolvimento

- [x] Implementar autenticação;
- [x] Implementar CRUD de doações;
- [x] Implementar catálogo, busca e filtros;
- [x] Implementar manifestação de interesse;
- [x] Criar testes básicos e tratar erros.

#### Mês 3: Finalização

- [x] Refinar interface e acessibilidade;
- [ ] Testar com usuários e registrar feedback;
- [x] Corrigir bugs críticos conhecidos;
- [x] Completar documentação e manual;
- [ ] Realizar deploy e preparar apresentação.

### Sprint inicial acelerada

| Data | Resultado esperado |
|---|---|
| 21/09/2026 | Setup, proposta, README, Issues e organização |
| 22/09/2026 | Interface e fluxos principais |
| 23/09/2026 | Firebase, CRUD, busca e interesses |
| 24/09/2026 até 16h | Testes, documentação, deploy e apresentação |

### Divisão de Responsabilidades

| Membro | Responsabilidade principal | Responsabilidade secundária |
|---|---|---|
| Cristian Tomaz | Integração Full Stack | Documentação |

O projeto é desenvolvido individualmente, conforme a possibilidade de grupos de 1 a 8 participantes prevista no guia da disciplina.

---

## 📊 Métricas de Sucesso

- [x] Todas as cinco funcionalidades do MVP funcionando;
- [x] Fluxo publicação → interesse → aceitação → conclusão demonstrável;
- [ ] Pelo menos três pessoas realizando teste de usabilidade;
- [ ] Página principal carregando em até 3 segundos em conexão estável;
- [x] Ausência de bugs críticos conhecidos;
- [x] README suficiente para outro desenvolvedor executar o projeto;
- [x] Issues, branches, Pull Requests e commits descritivos;
- [ ] Pelo menos 20 commits reais e focados ao longo do desenvolvimento.

### Metas quantitativas de demonstração

- 3 usuários de teste;
- 10 doações de demonstração;
- 3 categorias diferentes;
- 3 fluxos de interesse concluídos;
- satisfação média de pelo menos 4 em uma escala de 1 a 5.

---

## 🎨 Design e Experiência do Usuário

### 1. Fluxo Principal

1. O usuário cria uma conta ou entra no sistema;
2. Publica um item ou consulta o catálogo;
3. Outro usuário pesquisa e demonstra interesse;
4. O doador aceita ou recusa a solicitação;
5. O item é marcado como reservado e depois como doado.

### 2. Wireframes e Protótipos

Serão armazenados em `docs/wireframes/`.

### 3. Princípios de Design

- **Simplicidade:** uma ação principal por tela;
- **Acessibilidade:** rótulos claros, foco visível, contraste e HTML semântico;
- **Responsividade:** layout adaptável a celular, tablet e computador;
- **Feedback visual:** mensagens de sucesso, erro, carregamento e estados vazios.

---

## 🔒 Considerações de Segurança

- [x] Autenticação gerenciada pelo Firebase;
- [x] Senhas não armazenadas pela aplicação;
- [x] Regras do Firestore por usuário e propriedade do documento;
- [x] Validação e limitação dos campos;
- [x] Proteção contra conteúdo HTML não confiável;
- [x] HTTPS na hospedagem;
- [x] Variáveis de ambiente fora do controle de versão;
- [x] Nenhum dado de contato sensível exibido publicamente.

---

## 🌍 Impacto Social Esperado

### 1. Benefícios Diretos

- **Solidariedade local:** aproxima doadores e pessoas interessadas;
- **Redução do desperdício:** prolonga a vida útil de objetos;
- **Acesso:** facilita a obtenção gratuita de itens;
- **Organização:** substitui mensagens dispersas por um catálogo pesquisável.

### 2. Potencial de Escala

O projeto pode começar em um bairro ou comunidade universitária e crescer por região. Futuramente, organizações sociais e cooperativas poderão participar, com recursos de mapa, moderação e notificações.

### 3. Sustentabilidade

- [x] Código aberto;
- [ ] Comunidade de contribuidores;
- [ ] Parcerias com instituições;
- [ ] Moderação comunitária;
- [x] Hospedagem de baixo custo preparada.

---

## 📚 Referências

### Pesquisa do Problema

1. Entrevistas com potenciais usuários — planejadas e documentadas sem dados pessoais;
2. Observação de grupos comunitários de doação;
3. Pesquisa comparativa de plataformas existentes.

### Referências Técnicas

1. [Documentação do React](https://react.dev/);
2. [Documentação do Firebase](https://firebase.google.com/docs);
3. [Documentação do Vite](https://vite.dev/guide/);
4. [Guia da disciplina](https://github.com/luiscarlosjunior/aulas-graduacao/blob/master/05-engenharia-software/disciplina-projetos/guia-rapido.md).

### Literatura Acadêmica

1. SOMMERVILLE, Ian. **Engenharia de Software**. 10ª ed. Pearson, 2018.
2. MARTIN, Robert C. **Código Limpo**. Alta Books, 2009.
3. RIES, Eric. **A Startup Enxuta**. Leya, 2012.

---

## ✅ Aprovação

### Checklist de Validação da Proposta

- [x] Problema claramente definido e justificado;
- [x] Solução viável tecnicamente;
- [x] Público-alvo identificado;
- [x] Funcionalidades do MVP definidas;
- [x] Stack escolhida e justificada;
- [x] Cronograma definido;
- [x] Dados do responsável e divisão final confirmados;
- [x] Repositório criado;
- [x] Impacto social claro;
- [x] Referências iniciais incluídas;
- [ ] Validação com potenciais usuários concluída.

### Revisão do Professor

- [ ] Proposta aprovada;
- [ ] Proposta aprovada com ressalvas;
- [ ] Proposta necessita revisão.

**Comentários do professor:**

```text
Aguardando avaliação.
```

---

## 📝 Notas e Observações

O MVP foi publicado em https://ajudavizinho.web.app, com os fluxos essenciais, fotos opcionais e 17 testes automatizados aprovados. Notificações, chat e uma área de pedidos permanecem registradas como melhorias pós-MVP nas Issues #18, #19 e #20.
