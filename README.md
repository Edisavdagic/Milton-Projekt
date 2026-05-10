# Milton Projekt

Milton Projekt er en Vue 3-applikation til projektstyring i bygge-/renoveringsforløb. Appen samler projektoverblik, dashboard, milepæle, opgaver, kalender, dokumenter, billedgalleri og chat i én Firebase-backed løsning.

## Funktioner

- Login med Firebase Authentication og rollebaseret adgang for `admin` og `user`.
- Admin-overblik over alle projekter med søgning, statusfilter og sortering.
- Projektdashboard med status, seneste billeder, milepæle og opgaver.
- Admin-redigering af milepæle, opgavestatus, datoer, aktører og projektbilleder.
- Dokumentbibliotek med upload, søgning og filtrering på PDF/billeder.
- Kalender med uge-, måneds- og årsvisning baseret på projektets opgaver.
- Projektchat mellem medlemmer med realtidsdata fra Firestore.
- Statiske visninger til historik og notifikationer, klar til senere dynamisk data.

## Tech stack

- Vue 3, Vite og Vue Router
- Pinia til state management
- Firebase Authentication, Firestore, Storage og Hosting
- SCSS til styling
- Vitest og Vue Test Utils til unit tests
- Cypress til end-to-end tests
- JSDoc med Docdash-template til dokumentation

## Krav

- Node.js `^20.19.0` eller `>=22.12.0`
- npm
- Et Firebase-projekt med Authentication, Firestore og Storage aktiveret

## Kom godt i gang

Installer dependencies:

```sh
npm install
```

Opret en lokal miljøfil:

```powershell
Copy-Item .env.example .env
```

På macOS/Linux:

```sh
cp .env.example .env
```

Udfyld Firebase-værdierne i `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Start udviklingsserveren:

```sh
npm run dev
```

## Scripts

```sh
npm run dev          # Starter Vite dev-server
npm run build        # Bygger appen til dist/
npm run preview      # Serverer production build lokalt
npm run lint         # Kører ESLint med autofix og cache
npm run test:unit    # Kører Vitest unit tests
npm run test:e2e:dev # Åbner Cypress mod Vite dev-server
npm run test:e2e     # Bygger, starter preview og kører Cypress headless
npm run docs         # Genererer JSDoc i docs/
```

## Firebase

Firebase-klienten initialiseres i `src/services/firebase.js`. Appen forventer følgende produkter:

- Authentication med Email/Password-login.
- Firestore til brugere, projekter, milepæle, dokumentmetadata, chat og billedmetadata.
- Storage til dokumenter og projektbilleder.
- Hosting med SPA-rewrite til `dist/index.html`.

Regler ligger i:

- `firestore.rules`
- `storage.rules`
- `database.rules.json`
- `firestore.indexes.json`

Projektet er sat op til Firebase Hosting i `firebase.json`, og standardprojektet i `.firebaserc` er `milton-projekt`.

## Firestore-struktur

De vigtigste collections og subcollections:

- `Users/{uid}`: brugerprofil og rolle.
- `projects/{projectId}`: projektdata og `memberUid`.
- `projects/{projectId}/milestoneGroups/{groupId}/milestones/{milestoneId}`: milepæle og opgaver.
- `projects/{projectId}/images/{imageId}`: billedmetadata til dashboardgalleri.
- `projects/{projectId}/chats/{chatId}/messages/{messageId}`: projektrelateret chat.
- `documents/{docId}`: dokumentmetadata for uploadede filer.

Storage paths:

- `projects/{projectId}/images/{imageId}/{fileName}` til projektbilleder.
- `documents/{fileName}` til dokumenter.

## Ruter

- `/`: login.
- `/projektoversigt`: admin-overblik over projekter.
- `/notifikationer`: notifikationsside.
- `/historik`: historikside.
- `/project/:projectId/dashboard`: projektdashboard.
- `/project/:projectId/dokumenter`: dokumenter.
- `/project/:projectId/kalender`: kalender.

Alle projektrelaterede ruter kræver login. Når en almindelig bruger logger ind, hentes brugerens projekt via `memberUid`; admins sendes til projektoversigten.

## Projektstruktur

```text
src/
  assets/        SCSS, billeder og ikoner
  components/    Genbrugelige UI-komponenter
  composables/   Firebase- og domænelogik til chat, dokumenter, billeder og kalender
  router/        Vue Router-konfiguration og auth guards
  services/      Firebase-initialisering
  stores/        Pinia stores til auth, projekter og milepæle
  utils/         Hjælpefunktioner og unit tests
  views/         Sider/ruteviews
cypress/         End-to-end tests
docs/            Genereret JSDoc-output
scripts/         Hjælpescripts til dokumentation
```

## Tests og kvalitet

Kør unit tests:

```sh
npm run test:unit
```

Kør end-to-end tests mod production build:

```sh
npm run test:e2e
```

Kør lint:

```sh
npm run lint
```

## Dokumentation

Generer JSDoc:

```sh
npm run docs
```

Output lander i `docs/`.

## Deployment

Byg appen:

```sh
npm run build
```

Deploy til Firebase Hosting med Firebase CLI:

```sh
firebase deploy
```
