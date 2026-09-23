# AjudaVizinho

> Plataforma web para conectar pessoas que desejam doar itens a moradores da mesma comunidade que precisam deles.

## Problema e solução

Itens em boas condições são descartados enquanto pessoas próximas podem precisar deles. O AjudaVizinho organiza publicações, buscas, solicitações e decisões de doação em um fluxo simples, gratuito e local.

## MVP entregue

- cadastro, login e logout;
- criação, edição e exclusão de doações;
- busca por texto e filtro por categoria;
- estados disponível, reservado e doado;
- solicitação de interesse sem duplicidade;
- aceite ou recusa pelo doador;
- reserva automática após o aceite;
- painel com doações e solicitações do usuário;
- interface responsiva e acessível;
- testes e integração contínua no GitHub Actions.

## Tecnologias

- React e Vite;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Hosting;
- Vitest;
- GitHub Issues, branches, Pull Requests e Actions.

## Executar localmente

Pré-requisitos: Node.js 20 ou superior e npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha o `.env` com a configuração pública do aplicativo Web no Firebase. Esse arquivo é ignorado pelo Git e não deve ser enviado ao repositório.

Sem essas variáveis, o sistema inicia automaticamente no modo de demonstração local.

## Testes e build

```bash
npm test
npm run build
npm run preview
```

O GitHub Actions executa testes e build automaticamente em Pull Requests e atualizações das branches principais.

## Firebase

O projeto usa o banco Firestore nomeado `default`. As regras de segurança estão em `firestore.rules`.

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,hosting
```

Consulte [Configuração do Firebase](docs/configuracao-firebase.md) e [Publicação](docs/publicacao.md).

## Documentação

- [Proposta](docs/proposta.md)
- [Arquitetura](docs/arquitetura.md)
- [Modelo de dados](docs/modelo-dados.md)
- [Manual do usuário](docs/manual-usuario.md)
- [Roteiro de demonstração](docs/roteiro-demonstracao.md)
- [Configuração do Firebase](docs/configuracao-firebase.md)
- [Publicação](docs/publicacao.md)

## Equipe

| Integrante | GitHub | Papel |
|---|---|---|
| Cristian Tomaz | [@cristiantomaz](https://github.com/cristiantomaz) | Full Stack e documentação |

## Status

MVP funcional. Autenticação e persistência foram validadas no Firebase; os fluxos críticos possuem testes automatizados.

## Diretrizes acadêmicas

Projeto desenvolvido conforme o [Guia Rápido da disciplina](https://github.com/luiscarlosjunior/aulas-graduacao/blob/master/05-engenharia-software/disciplina-projetos/guia-rapido.md), com commits incrementais, Issues, Pull Requests, testes e documentação contínua.

## Licença

Projeto acadêmico para fins educacionais.
