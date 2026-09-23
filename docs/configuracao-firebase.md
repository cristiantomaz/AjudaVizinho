# Configuração do Firebase

O AjudaVizinho possui dois modos de execução:

- **Firebase:** autenticação, doações e interesses são persistidos no Firebase Authentication e Cloud Firestore.
- **Demonstração local:** usado automaticamente quando as variáveis do Firebase não estão preenchidas. Os dados ficam apenas no navegador e não representam autenticação de produção.

## 1. Criar o projeto

1. Acesse o Firebase Console e crie um projeto chamado `AjudaVizinho`.
2. Adicione um aplicativo Web.
3. Em **Authentication**, habilite o provedor **E-mail/senha**.
4. Crie um banco **Cloud Firestore** com o identificador `default`.

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores fornecidos pelo Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

O arquivo `.env` não deve ser enviado ao GitHub.

## 3. Regras de segurança

Publique o conteúdo de `firestore.rules` no banco `default`. As regras permitem leitura pública das doações, restringem o gerenciamento ao proprietário e protegem as solicitações de interesse.

Pelo terminal, após autenticar o Firebase CLI:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

## 4. Validação

Após configurar, execute:

```bash
npm install
npm test
npm run dev
```

O aviso no topo deve indicar **Firebase conectado**. Sem as variáveis, a aplicação informa que está em **modo demonstração local**.
