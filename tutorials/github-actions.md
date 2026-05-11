# GitHub Actions

## Indholdsfortegnelse

1. [Hvad er GitHub Actions?](#hvad-er-github-actions)
2. [Komponenter i GitHub Actions](#komponenter)
3. [Projektets workflows](#projektets-workflows)
4. [`ci.yml` — Tests](#ci-yml)
5. [`docs.yml` — Publicer dokumentation](#docs-yml)
6. [`firebase-hosting-merge.yml` — Deploy til produktion](#merge-yml)
7. [`firebase-hosting-pull-request.yml` — Preview ved pull request](#pr-yml)
8. [Den samlede pipeline](#den-samlede-pipeline)
9. [Secrets](#secrets)

---

<a name="hvad-er-github-actions"></a>

## Hvad er GitHub Actions?

GitHub Actions er en **built-in CI/CD-platform** i GitHub, der gør det muligt at automatisere opgaver som en reaktion på hændelser i et repository. I stedet for at køre tests manuelt eller deploye ved hjælp af separate værktøjer, sker det hele automatisk — hver gang der pushes kode eller åbnes et pull request.

### Hvorfor bruge det?

- Automatiserer gentagende opgaver (tests, build, deploy)
- Sikrer kodekvalitet ved at kræve grønne tests før merge
- Strømliner deployments uden manuel indgriben
- Giver hurtig feedback til udviklere om fejl

---

<a name="komponenter"></a>

## Komponenter i GitHub Actions

Et workflow er sammensat af flere lag:

| Komponent | Beskrivelse |
| --- | --- |
| **Workflow** | En YAML-fil i `.github/workflows/` — definerer hele automatiseringsprocessen |
| **Event** | Det der starter workflowet, f.eks. `push` eller `pull_request` |
| **Runner** | En virtuel maskine (VM) der udfører jobs — typisk `ubuntu-latest` |
| **Job** | En samling af steps der kører på samme runner |
| **Step** | En individuel opgave — enten en shell-kommando (`run`) eller en Action (`uses`) |
| **Action** | En genanvendelig workflow-komponent fra GitHub Marketplace eller et repository |

---

<a name="projektets-workflows"></a>

## Projektets workflows

Projektet har fire workflow-filer i `.github/workflows/`. Tilsammen udgør de en komplet CI/CD-pipeline:

```text
.github/workflows/
├── ci.yml                            ← Kør tests ved push og PR
├── docs.yml                          ← Publicer JSDoc-dokumentation
├── firebase-hosting-merge.yml        ← Deploy til produktion efter tests
└── firebase-hosting-pull-request.yml ← Deploy til preview-kanal ved PR
```

---

<a name="ci-yml"></a>

## `ci.yml` — Tests

Dette er projektets centrale kvalitetsport. Den kører både unit tests og E2E tests automatisk ved hvert push til `main` og ved alle pull requests.

```yaml
name: tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
      VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
      VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
      VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
      VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
      VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - run: npm ci

      - run: npm run test:unit

      - name: E2E tests
        uses: cypress-io/github-action@v6
        with:
          install: false
          build: npm run build
          start: npm run preview
          wait-on: "http://localhost:4173"
          command: npx cypress run --e2e
```

### Gennemgang trin for trin

**`on`** — hvornår workflowet kører:

- `push` på `main`: hver gang kode pushes direkte til main-branchen
- `pull_request` mod `main`: hver gang et PR åbnes eller opdateres

**`env`** — miljøvariabler til Firebase:

Applikationen bruger Firebase, og Vite kræver disse variabler på build-tidspunktet. De gemmes som **Secrets** i GitHub (under Settings → Secrets and variables → Actions) og injiceres sikkert — de vises aldrig i loggen.

**Steps:**

1. `actions/checkout@v4` — henter koden fra repositoryet ned på runneren
2. `actions/setup-node@v4` — installerer Node.js 22 og aktiverer npm-cache for hurtigere builds
3. `npm ci` — installerer afhængigheder fra `package-lock.json` (deterministisk, ingen overraskelser)
4. `npm run test:unit` — kører Vitest unit tests for `src/utils/`
5. `cypress-io/github-action@v6` — kører E2E tests: bygger appen, starter preview-serveren og venter på at den er klar, inden Cypress tager over

---

<a name="docs-yml"></a>

## `docs.yml` — Publicer dokumentation

Denne workflow bygger JSDoc-dokumentationen og publicerer den til GitHub Pages hver gang der merges til `main`.

```yaml
name: Publish Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - run: npm run docs

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### Hvad sker der

1. `npm run docs` — kører JSDoc og genererer HTML-dokumentation i `./docs/`
2. `peaceiris/actions-gh-pages@v3` — pusher indholdet af `./docs/` til GitHub Pages-branchen

`GITHUB_TOKEN` er et automatisk genereret token som GitHub stiller til rådighed — der er ikke behov for at oprette det manuelt.

---

<a name="merge-yml"></a>

## `firebase-hosting-merge.yml` — Deploy til produktion

Denne workflow deployer applikationen til Firebase Hosting, men kun efter at `tests`-workflowet er gennemført med succes. Det sikrer at ødelagt kode aldrig når produktion.

```yaml
name: Deploy to Firebase Hosting on merge

on:
  workflow_run:
    workflows: ["tests"]
    types:
      - completed
    branches:
      - main

jobs:
  build_and_deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_MILTON_PROJEKT }}
          channelId: live
          projectId: milton-projekt
```

### Det vigtige her: afhængighed mellem workflows

`workflow_run` — workflowet starter **ikke** ved et push direkte, men lytter i stedet på hvornår `tests`-workflowet afslutter. Linjen:

```yaml
if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

...sikrer at deploy-jobbet kun kører hvis tests bestod. Fejler tests, sker der ingen deploy.

`channelId: live` specificerer at det er den levende produktionskanal der deployes til — ikke en preview.

---

<a name="pr-yml"></a>

## `firebase-hosting-pull-request.yml` — Preview ved pull request

Denne workflow deployer en midlertidig **preview-version** af applikationen direkte til et pull request. Det gør det muligt at se og teste ændringer i et rigtigt miljø, inden de merges.

```yaml
name: Deploy to Firebase Hosting on PR

on: pull_request

permissions:
  checks: write
  contents: read
  pull-requests: write

jobs:
  build_and_preview:
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_MILTON_PROJEKT }}
          projectId: milton-projekt
```

### Det vigtige her

`permissions` — workflowet har brug for rettigheder til at skrive en kommentar i pull requestet med preview-linket:

- `checks: write` — må oprette check-resultater
- `pull-requests: write` — må kommentere på PR'et med preview-URL'en

`if`-betingelsen sikrer at workflowet kun kører for PRs fra selve repositoryet — ikke fra forks, da forks ikke har adgang til secrets.

Da `channelId` ikke er sat (i modsætning til merge-workflowet), deployes der til en automatisk genereret preview-kanal i stedet for `live`.

---

<a name="den-samlede-pipeline"></a>

## Den samlede pipeline

Sammenhængen mellem de fire workflows ser sådan ud for et typisk pull request:

```text
PR åbnes
    │
    ├─► ci.yml kører tests (unit + E2E)
    │
    └─► firebase-hosting-pull-request.yml bygger preview
            └─► GitHub kommenterer PR med preview-link

PR merges til main
    │
    ├─► ci.yml kører tests igen
    │       │
    │       └─► firebase-hosting-merge.yml lytter på ci.yml
    │               └─► Kun ved success: deploy til produktion
    │
    └─► docs.yml bygger og publicerer JSDoc
```

Tests er dermed en **obligatorisk port** foran produktion — det er ikke muligt at deploye uden at passere igennem dem.

---

<a name="secrets"></a>

## Secrets

Projektet bruger GitHub Secrets til at håndtere følsomme nøgler. De defineres under repository-indstillinger og refereres i YAML med `${{ secrets.NAVN }}`. Secrets vises aldrig i logs og er krypteret.

| Secret | Bruges til |
| --- | --- |
| `VITE_FIREBASE_*` | Firebase-konfiguration til build og test |
| `FIREBASE_SERVICE_ACCOUNT_MILTON_PROJEKT` | Authenticering til Firebase Hosting deploy |
| `GITHUB_TOKEN` | Automatisk genereret — bruges til GitHub Pages og PR-kommentarer |
