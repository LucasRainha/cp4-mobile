# Agenda — Expo + Firebase (Tasks, Auth, i18n, Notifications)

Aplicativo **Expo/React Native** com autenticação (Google + E‑mail/senha), **login persistente**, **tarefas por usuário** no **Firestore** com **sincronização em tempo real**, **tema claro/escuro** com persistência, **i18n (PT/EN)** com troca dinâmica, **notificações locais** com agendamento por data/hora e **TanStack Query** consumindo uma API externa (frases motivacionais).

## ✅ Entregas
- ✅ Código hospedado no GitHub
- ✅ APK gerado (EAS Build)
- ✅ Vídeo curto (≤ 5 min) demonstrando as funcionalidades
- ✅ Documentação curta (este README)

---

## ✨ Funcionalidades
1. **Autenticação**: Google (OAuth) e E‑mail/senha via Firebase Auth
2. **Login persistente** com `initializeAuth` + AsyncStorage
3. **Tarefas por usuário** em `users/{uid}/tasks` (Firestore)
4. **Lista de tarefas em tempo real** com `onSnapshot`
5. **Tema claro/escuro** com persistência (AsyncStorage)
6. **i18n PT/EN** com troca dinâmica (ex.: `react-i18next` ou `i18n-js`)
7. **Notificações locais** com agendamento por **data/hora** (`expo-notifications`)
8. **TanStack Query** consumindo API externa (frases motivacionais de `zenquotes.io`)

---

## 🧱 Stack & libs
- **Expo** (React Native)
- **Firebase Web SDK**: Auth + Firestore
- **@tanstack/react-query** (cache/revalidação de dados remotos)
- **expo-notifications** (notificações locais)
- **expo-auth-session** + **expo-web-browser** (Google OAuth)
- **@react-native-community/datetimepicker** (seletor de data/hora)
- **@react-navigation/native** (+ Drawer/Stack) e **react-native-gesture-handler**
- **@react-native-async-storage/async-storage**
- (UI) qualquer — o projeto usa estilos próprios; pode integrar com `react-native-paper`

---

## 📁 Estrutura de pastas (resumo)
```
src/
  contexts/
    ThemeContext.js           # Tema claro/escuro (persistido)
    // I18nContext.js (se usar um wrapper p/ i18n)
  screens/
    LoginScreen.js            # Login: email/senha + Google
    RegisterScreen.js         # Registro por e‑mail
    DashboardScreen.js        # Tarefas em tempo real + agendamento
  services/
    firebaseConfig.js         # initializeApp, Auth (persist), Firestore (long‑poll)
    notifications.js          # ensurePermissions, scheduleAtDate
    // i18n/                   # recursos PT/EN se usar react-i18next
App.js                        # Navegação + QueryClientProvider
```

---

## 🔧 Pré‑requisitos
- Node LTS e **Expo CLI**
- Projeto Firebase criado (Auth + Firestore habilitados)
- Provedor **Google** habilitado em *Authentication → Sign-in method*

---

## 🚀 Setup & Execução

### 1) Instalar dependências
```bash
# dentro do projeto
npm i firebase @tanstack/react-query @react-native-async-storage/async-storage
npx expo install expo-notifications expo-auth-session expo-web-browser
npx expo install @react-native-community/datetimepicker
npx expo install react-native-gesture-handler react-native-reanimated
npm i @react-navigation/native @react-navigation/drawer @react-navigation/stack
```

> Se usar `react-i18next`:  
> `npm i react-i18next i18next` (ou `i18n-js`)

### 2) Configurar Firebase
`src/services/firebaseConfig.js` (trecho principal):
```js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = { /* suas chaves */ };

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// RN/Expo: força long-polling p/ evitar erros de transporte
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
```

### 3) Regras do Firestore (segurança por usuário)
Em **Firestore → Rules**:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4) Google OAuth (Expo)
- Em **Google Cloud Console → Credentials**, crie um **OAuth 2.0 Client ID (Web)**.
- No Firebase Console, habilite o provedor **Google**.
- Crie `.env` na raiz:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=SEU_CLIENT_ID.apps.googleusercontent.com
```
- Reinicie o Expo.

No `LoginScreen`, o fluxo usa `expo-auth-session` com `useProxy: true` (funciona no **Expo Go**). Para builds EAS sem proxy, configure `scheme`/clients nativos.

### 5) Notificações locais
- `app.json` (plugin):
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#3b82f6" }]
    ],
    "android": { "useNextNotificationsApi": true }
  }
}
```
- Serviço: `src/services/notifications.js`
```js
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

export async function ensurePermissions() {
  const cur = await Notifications.getPermissionsAsync();
  let status = cur.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === "granted";
}

export async function scheduleAtDate(title, body, date) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date },
  });
}
```

### 6) TanStack Query
No `App.js`:
```js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {/* NavigationContainer, etc. */}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

### 7) Rodar
```bash
npx expo start --lan
```
> Dica: prefira **LAN** em vez de *Tunnel* para reduzir problemas de rede.

---

## 🧭 Uso (fluxo principal)
1. **Criar conta** (E‑mail/senha) ou **Entrar com Google** na tela de Login.
2. A Dashboard lista tarefas do usuário (coleção `users/{uid}/tasks`).
3. Adicione uma tarefa, **opcionalmente selecione data/hora**; ao salvar:
   - grava `dueAt` no Firestore,
   - agenda **notificação local** para essa data.
4. Marque como concluída/pendente, ou exclua.
5. Tema claro/escuro pode ser alternado no Drawer e fica salvo.
6. Troca de idioma (PT/EN) dinamicamente (configure seu provider de i18n).

---

## 🧩 Build com EAS (APK)
Instale EAS e faça login:
```bash
npm i -g eas-cli
eas login
```

Crie `eas.json` com um perfil **apk** de preview:
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    }
  }
}
```
Build:
```bash
eas build -p android --profile preview
```
O link do APK aparecerá no final do build.

---

## 🧪 Testes rápidos
- **Auth**: Email/senha e Google (via proxy do Expo)
- **Realtime**: criar/alternar/excluir tarefas reflete na hora
- **Notificação**: agendar em 1–2 min e bloquear/fechar o app → deve disparar
- **Tema**: alternar e reabrir o app → mantém escolha
- **i18n**: mudar idioma e verificar textos

---

## 🛠️ Troubleshooting
- **auth/network-request-failed**: geralmente rede/DNS/VPN. Teste 4G, cheque data/hora do device, use `expo start --lan`.
- **Firestore WebChannel transport errored**: use `initializeFirestore` com `experimentalForceLongPolling: true` e `useFetchStreams: false` (já aplicado).
- **permission-denied** no `onSnapshot`: publique as **regras** acima e confirme o caminho `users/{uid}/tasks`.
- **Google OAuth cancelado**: verifique `EXPO_PUBLIC_GOOGLE_CLIENT_ID` e reinicie o Expo.
- **Android DateTimePicker “dismiss undefined”**: no Android usamos fluxo **date → time**; no iOS, modal com picker `inline`.

---

## 📹 Vídeo de demonstração (dica de roteiro ≤ 5min)
1. Login por e‑mail/senha → sair → entrar com Google
2. Criar tarefa com data/hora (mostrar notificação chegando)
3. Concluir/excluir tarefa (realtime)
4. Alternar tema e trocar idioma
5. (Opcional) Mostrar APK rodando em aparelho físico

---

## 📜 Licença
Uso educacional/demonstrativo. Adapte conforme sua necessidade.


---

## 👥 Participantes

| Nome               | RM      |
|--------------------|---------|
| Kleber da Silva    | 557887  |
| Nicolas Barutti    | 554944  |
| Lucas Rainha       | 558471  |

---
