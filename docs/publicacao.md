# Publicação

## Preparação

1. Instale as dependências com `npm install`.
2. Preencha `.env` usando `.env.example`.
3. Execute `npm test` e `npm run build`.

## Firebase CLI

```bash
npx firebase-tools login
npx firebase-tools use ajudavizinho
npx firebase-tools deploy --only firestore:rules,hosting
```

O deploy publica as regras no banco `default` e o conteúdo compilado da pasta `dist` no Firebase Hosting.

## Variáveis necessárias

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Nunca envie o arquivo `.env` ao GitHub.

## Checklist

- [ ] regras atualizadas publicadas;
- [ ] site acessível pelo endereço do Hosting;
- [ ] cadastro e login testados no site publicado;
- [ ] fluxo com duas contas validado;
- [ ] URL adicionada ao README e à descrição do repositório;
- [ ] release `v1.0.0` criada.
