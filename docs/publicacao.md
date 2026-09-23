# Publicação

## Preparação

1. Confirme que Node.js 20 ou superior e npm estão disponíveis com `node -v` e `npm -v`.
2. Instale as dependências com `npm ci`.
3. Preencha `.env` usando `.env.example`.
4. Execute a validação completa com `npm run validate`.

O comando de validação executa os testes automatizados e o build de produção. O deploy só deve continuar se ambos terminarem sem erros.

## Primeiro acesso à Firebase CLI

```bash
npx firebase-tools login
```

Faça o login no mesmo computador em que o deploy será realizado. Senhas, códigos de autorização e tokens não devem ser copiados para Issues, Pull Requests ou arquivos do repositório.

Se o terminal não reconhecer `npx`, instale uma versão LTS do Node.js, feche as janelas do terminal e abra uma nova sessão.

## Publicação

Depois que o login for confirmado pela CLI:

```bash
npx firebase-tools use ajudavizinho
npm run validate
npx firebase-tools deploy --only hosting
```

As regras do Firestore são publicadas separadamente, apenas quando houver mudanças revisadas em `firestore.rules`:

```bash
npx firebase-tools deploy --only firestore:rules
```

O Hosting publica o conteúdo compilado da pasta `dist`. A separação dos comandos evita republicar regras de segurança sem necessidade.

## Variáveis necessárias

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Nunca envie o arquivo `.env` ao GitHub.

## Checklist

- [x] regras atualizadas publicadas;
- [ ] `npm run validate` executado imediatamente antes do deploy;
- [ ] site acessível pelo endereço do Hosting;
- [ ] cadastro e login testados no site publicado;
- [ ] fluxo com duas contas validado;
- [ ] URL adicionada ao README e à descrição do repositório;
- [ ] release `v1.0.0` criada.
