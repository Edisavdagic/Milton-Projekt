# Versionsstyring med Git

Dette dokument er en omfattende gennemgang af versionsstyring med Git i forbindelse med Milton-projektet. Det dækker både teori, praksis og refleksion, og er skrevet med henblik på både daglig brug og eksamensforberedelse.

---

## Indholdsfortegnelse

1. [Hvad er versionsstyring?](#1-hvad-er-versionsstyring)
2. [Hvorfor bruge versionsstyring?](#2-hvorfor-bruge-versionsstyring)
3. [Typer af versionsstyringssystemer](#3-typer-af-versionsstyringssystemer)
4. [Hvorfor valgte vi Git?](#4-hvorfor-valgte-vi-git)
5. [Gits arkitektur og nøglekoncepter](#5-gits-arkitektur-og-nøglekoncepter)
6. [Grundlæggende Git-kommandoer](#6-grundlæggende-git-kommandoer)
7. [Commit-beskeder – god praksis](#7-commit-beskeder--god-praksis)
8. [Branching i Git](#8-branching-i-git)
9. [Branch-strategier](#9-branch-strategier)
10. [Remote repositories](#10-remote-repositories)
11. [Konflikthåndtering](#11-konflikthåndtering)
12. [Praktisk Git-workflow i Milton-projektet](#12-praktisk-git-workflow-i-milton-projektet)
13. [Eksamensoverblik](#13-eksamensoverblik)

---

## 1. Hvad er versionsstyring?

**Versionsstyring** (engelsk: *Version Control System* – VCS) er et system, der registrerer ændringer i filer over tid, så man senere kan:

- Se hvad der er ændret, hvornår og af hvem.
- Vende tilbage til en tidligere version (rollback).
- Sammenligne versioner med hinanden (diff).
- Arbejde flere på den samme kodebase uden at overskrive hinandens arbejde.
- Eksperimentere med nye idéer uden at ødelægge den fungerende kode.

Versionsstyring kan på et abstrakt niveau betragtes som en *tidsmaskine for kildekode*. Hver ændring bliver gemt som en "snapshot" af projektet, og man kan til enhver tid bevæge sig tilbage og frem mellem snapshots.

I Milton-projektet anvendes Git som versionsstyringssystem sammen med GitHub som remote-platform.

---

## 2. Hvorfor bruge versionsstyring?

Versionsstyring løser en række konkrete problemer i softwareudvikling:

| Problem uden versionsstyring | Løsning med Git |
|------------------------------|-----------------|
| To udviklere overskriver hinandens kode i en delt mappe | Distribueret historik – hver udvikler arbejder lokalt og samles via merges |
| Filer som `index_final_v2_RIGTIG_FINAL.html` | Én fil, en historik af versioner via commits |
| Svært at finde ud af, hvornår en bug blev introduceret | `git log`, `git blame` og `git bisect` |
| Et eksperiment ødelægger den fungerende kode | Lokal commit kan altid rulles tilbage |
| Ingen backup hvis harddisken dør | Remote repository på GitHub fungerer som distribueret backup |
| Manuel deployment med risiko for fejl | CI/CD reagerer automatisk på `push`-events |

I Milton-projektet er versionsstyring kernen i hele udviklingsflowet:

- Vi arbejder primært trunk-based mod `main`, så integration sker hyppigt.
- GitHub Actions kører lint, unit tests og e2e-tests automatisk på hver push og pull request.
- `main`-branchen deployes til Firebase Hosting via en CI/CD-pipeline.

Versionsstyring er altså ikke kun "et sted hvor koden ligger" – det er fundamentet for samarbejde, kvalitetssikring og automatisering.

---

## 3. Typer af versionsstyringssystemer

Versionsstyringssystemer har udviklet sig gennem flere generationer.

### 3.1 Local VCS

Den simpleste form. Hele historikken ligger lokalt på én maskine.

- Eksempel: **RCS** (Revision Control System).
- Hver fil har sin egen historik gemt i en lokal database.
- **Ulemper:** Ingen samarbejde, ingen backup hvis disken dør, ingen distribuering.

### 3.2 Centraliseret VCS (CVCS)

Én central server holder den autoritative kopi, og klienter henter den seneste version.

- Eksempler: **SVN** (Subversion), **CVS**.
- Alle ændringer skal igennem den centrale server.
- **Fordele:** Simpel mental model, lettere adgangsstyring.
- **Ulemper:**
  - Hvis serveren går ned, kan man hverken committe eller hente historik.
  - Begrænset offline-arbejde – man har ikke historikken lokalt.
  - Single point of failure.

### 3.3 Distribueret VCS (DVCS)

Hver klient har en **fuld kopi** af hele repositoriet inkl. historik.

- Eksempler: **Git**, **Mercurial**.
- Man kan committe, branche, merge og se historik **offline**.
- Synkronisering med andre sker via `push`/`pull` mod et remote.
- **Fordele:**
  - Robusthed – serveren er ikke et single point of failure.
  - Hurtighed – operationer sker lokalt.
  - Fleksibilitet – mange workflows muliggøres (fx pull requests, fork-baserede flows).

> **Eksamenstip:** Forklar at Git ikke kræver netforbindelse for at virke, fordi hele historikken ligger lokalt. Det er en *fundamental* forskel fra SVN.

---

## 4. Hvorfor valgte vi Git?

I Milton-projektet bruges Git af følgende grunde:

1. **De-facto standard** i moderne webudvikling – alle gruppemedlemmer kender det.
2. **Distribueret arkitektur** giver robusthed og offline-arbejde.
3. **Hurtig branching og merging** muliggør den trunk-based model, vi arbejder i.
4. **GitHub-integration** giver gratis hosting af remote repository, pull requests, code review og issues.
5. **GitHub Actions** kører CI/CD direkte oven på Git-events (push, pull_request).
6. **Værktøjsstøtte** i VS Code, IntelliJ og kommandolinje gør hverdagen lettere.

---

## 5. Gits arkitektur og nøglekoncepter

### 5.1 De tre faser

Git arbejder med tre logiske områder. En fil bevæger sig mellem dem afhængigt af hvilken kommando man kører:

```
┌──────────────────┐   git add    ┌──────────────┐   git commit   ┌──────────────┐
│ Working          │ ───────────► │ Staging      │ ─────────────► │ Repository   │
│ Directory        │              │ Area (Index) │                │ (.git)       │
│ (dine filer)     │ ◄─────────── │              │ ◄───────────── │              │
└──────────────────┘ git restore  └──────────────┘  git reset     └──────────────┘
```

- **Working Directory:** Dine filer som de ser ud lige nu på disken. Her redigerer du i editoren.
- **Staging Area (Index):** En "kladde" af det næste commit. Her vælger du *præcis* hvilke ændringer der skal med.
- **Repository (.git-mappen):** Selve historikken – alle commits, branches, tags m.m.

**Hvorfor en staging area?** Den giver dig mulighed for at lave commits, der hver især har ét logisk formål, selvom dit working directory indeholder mange forskellige ændringer. Du kan fx tilføje rettelser til to forskellige områder og committe dem hver for sig.

### 5.2 Commits som snapshots

Hver commit i Git er et **snapshot** af hele projektet på det tidspunkt, *ikke* en liste af diffs. Internt optimerer Git ved at genbruge uændrede filer (via SHA-1 indholdsadressering), men den mentale model er:

> En commit = "Sådan så projektet ud, dengang."

Hver commit indeholder:

- Et **snapshot** af alle filer (referencer til indhold via hashes).
- En **forfatter** og **committer** (med navn, email og tidsstempel).
- En **besked** der forklarer hvorfor ændringen blev lavet.
- En reference til **parent-commit(s)** – normalt én, men to ved en merge-commit.

### 5.3 Hashes som unikke identifikatorer

Hver commit har en **SHA-1 hash**, et 40-tegns hex-streng (fx `3182816a...`), der unikt identificerer commit'et. Hashen er deterministisk – samme indhold giver samme hash – og den ændrer sig hvis *noget* i commit'et ændres (indhold, besked, forfatter, parent).

Det betyder også at Gits historik er **immutable**: man kan ikke ændre en gammel commit uden at det skaber en ny hash (og dermed en ny commit-kæde).

I praksis bruger man oftest de første 7 tegn (`3182816`), som er nok til entydigt at identificere et commit i de fleste projekter.

### 5.4 HEAD, branches og refs

- **HEAD** er en pointer til den commit, du *p.t. har tjekket ud*. Normalt peger HEAD på en branch, som så peger på en commit.
- En **branch** er teknisk set bare en pointer (et navn) der peger på en specifik commit. Når du committer, flytter branchen sig frem til det nye commit.
- **Tags** er navngivne pegere der ikke flytter sig (fx `v1.0.0`).

```
  main ─────► c3 ◄── HEAD
              │
              ▼
              c2
              │
              ▼
              c1
```

---

## 6. Grundlæggende Git-kommandoer

### 6.1 Initialisering og kloning

```sh
git init                 # Opretter et nyt repo i den aktuelle mappe
git clone <url>          # Henter et eksisterende remote repo lokalt
```

I Milton-projektet kloner nye gruppemedlemmer ned med:

```sh
git clone https://github.com/Edisavdagic/Milton-Projekt.git
```

### 6.2 Status og inspektion

```sh
git status               # Hvilke filer er ændret, staged, untracked?
git log                  # Vis commit-historikken
git log --oneline        # Kort form, ét commit pr. linje
git log --graph --all    # Visuelt branch-træ
git diff                 # Vis ændringer i working directory (ikke staged)
git diff --staged        # Vis ændringer der er staged til næste commit
git show <hash>          # Vis indholdet af et specifikt commit
git blame <fil>          # Hvem ændrede hvilken linje hvornår?
```

### 6.3 Staging og commit

```sh
git add <fil>            # Stage en specifik fil
git add .                # Stage alle ændringer i nuværende mappe
git restore <fil>        # Fortryd uændrede ændringer i working directory
git restore --staged <fil>  # Tag en fil ud af staging area igen
git commit -m "besked"   # Lav commit med besked
git commit               # Åbner editor til længere besked
git commit --amend       # Ret seneste commit (fx tilføj glemt fil eller fix besked)
```

> **NB:** `--amend` ændrer commit-hashen og må *ikke* bruges på commits, der allerede er pushet til en delt branch.

### 6.4 Bevægelse i historikken

```sh
git checkout <hash>      # Skift HEAD til et specifikt commit (detached HEAD)
git switch <branch>      # Skift til en eksisterende branch (moderne kommando)
git switch -c <ny>       # Opret og skift til en ny branch
```

### 6.5 Synkronisering med remote

```sh
git push                 # Send lokale commits til remote
git pull                 # Hent og merge remote-ændringer
git fetch                # Hent remote-ændringer uden at merge
```

> **Eksamenstip – "bag kulisserne":** Når du kører `git commit`, sker der følgende:
> 1. Git tager indholdet fra staging area.
> 2. Det skrives som et `tree`-objekt (mappestruktur) og en eller flere `blob`-objekter (filindhold), identificeret ved deres SHA-1.
> 3. Der oprettes et `commit`-objekt, der peger på tree'et, parent-commit og indeholder forfatter + besked.
> 4. Branchens pointer (fx `main`) flyttes frem til det nye commit-objekt.

---

## 7. Commit-beskeder – god praksis

En god commit-besked gør det muligt at forstå *hvorfor* en ændring blev lavet, selv flere måneder senere. Det er især vigtigt i en trunk-based model, hvor commits er den primære enhed af integration – ikke pull requests med lange beskrivelser.

### 7.1 Konvention

```
<kort emnelinje – maks 50 tegn, imperativ, ingen punktum>

<valgfri længere brødtekst, wrap ved 72 tegn,
forklarer hvorfor og hvilken kontekst>

<valgfri footer, fx "Closes #42">
```

### 7.2 Tommelfingerregler

- **Imperativ form**: "Add login form", ikke "Added login form" eller "Adds login form". Læseregel: "Hvis dette commit anvendes, vil det ___."
- **Hvorfor frem for hvad**: Diff'en viser allerede *hvad*. Brug beskeden til at forklare *hvorfor*.
- **Vær specifik**: Undgå "Fix bug" eller "Update files".
- **Adskil logiske ændringer**: Hellere to små commits end ét uoverskueligt – især vigtigt når man committer direkte til main.

### 7.3 Eksempler

**God:**

```
Add error handling for file uploads and display error messages
```

```
Refactor calendar into components and utils

Pull date-rendering and actor-lookup helpers out of the monolithic
CalendarView so the calendar grid, day cells and event chips can be
tested in isolation.
```

**Dårlig:**

```
fix
update
fixed bug
asdf
WIP
final commit
```

### 7.4 Hvorfor er det vigtigt?

- Code review bliver hurtigere og mere fokuseret.
- `git log` bliver til reel dokumentation.
- `git bisect` (binær søgning efter en regression) er kun nyttig, hvis commits er små og selvbeskrivende.
- Onboarding af nye udviklere bliver lettere – historikken fortæller projektets udvikling.

---

## 8. Branching i Git

### 8.1 Hvad er en branch?

En **branch** er en uafhængig udviklingslinje. Teknisk er den blot en navngivet pointer til en commit, men konceptuelt giver det dig en *parallel virkelighed* hvor du kan arbejde uden at påvirke `main`.

Git er ekstremt billigt at branche i, fordi en branch kun er en lille tekstfil under `.git/refs/heads/`. Det er en af grundene til Gits succes sammenlignet med ældre systemer, hvor branching var en tung og dyr operation.

### 8.2 Hvorfor (og hvornår) branche?

Selvom Milton-projektet primært arbejder trunk-based mod `main`, bruges branches stadig i bestemte situationer:

- **Større refaktorering** der ikke kan klares i én lille commit – fx kalender-refaktoreringen, der lå på `kalenderRef`, før den blev merged ind.
- **Risikable eksperimenter** der kunne brække `main`.
- **Pull request-baseret code review**, når gruppen ønsker et grundigt review før integration.
- **Deployment-branches** som `gh-pages`, der bruges af GitHub Pages-deployment.

For "almindelige" små ændringer (en bugfix, en lille feature, en CSS-justering) committer vi som regel direkte til `main` efter at have kørt lokale tests – det er kernen i trunk-based.

### 8.3 Branch-kommandoer

```sh
git branch                       # List lokale branches
git branch -a                    # List alle (lokale + remote)
git switch -c kort-feature       # Opret og skift til ny branch
git switch main                  # Skift tilbage til main
git branch -d kort-feature       # Slet en merged branch
git branch -D kort-feature       # Tvangssletning (ikke merged) – brug med omtanke
git merge kort-feature           # Merge branchen ind i nuværende branch
```

### 8.4 Merge vs. rebase

Når du vil samle to udviklingslinjer, har du to muligheder:

**Merge** bevarer historikken som den var og laver en *merge-commit*:

```
A---B---C---M  (main)
     \     /
      D---E    (kort-feature)
```

**Rebase** flytter dine commits til toppen af mål-branchen og giver lineær historik:

```
A---B---C---D'---E'  (main efter rebase + fast-forward)
```

| | Merge | Rebase |
|---|-------|--------|
| Historik | Forgrenet, viser virkeligheden | Lineær, ren |
| Sikkerhed på delte branches | Sikker | Farlig – ændrer hashes |
| Konflikter | Løses én gang i merge-commit | Kan opstå pr. flyttet commit |
| Egnet til | Færdige features → main | Egen lokal branch, før push |

**Tommelfingerregel**: Rebase egne lokale branches; merge ind i delte branches. I trunk-based er rebase ekstra værdifuldt, fordi det holder `main`s historik lineær og letlæselig.

### 8.5 Visualisering – et eksempel fra Milton

I commit-historikken kan man se et af de få tilfælde, hvor vi brød ud i en branch:

```
*   Merge branch 'kalenderRef'
|\
| * refactor(calendar): rename components and update styles
| * Refactor calendar into components and utils
|/
* refactor(ci): cleanup CI and update e2e test command
* Add screenshots to Cypress e2e tests
```

Kalender-refaktoreringen var stor nok til at fortjene sin egen branch, men resten af historikken viser typiske trunk-based commits direkte på `main`.

---

## 9. Branch-strategier

Selvom Milton-projektet er trunk-based, er det vigtigt at kende de gængse strategier for at kunne diskutere fordele og ulemper.

### 9.1 Trunk-Based Development *(vores valg)*

Alle udviklere committer (næsten) direkte til `main` flere gange om dagen. Branches lever kun timer – eller springes helt over for små ændringer. Ufærdige features kan skjules bag **feature flags**, indtil de er færdige.

**Fordele:**

- Maksimal integration → minimal merge-smerte.
- Hurtigste feedback fra CI/CD og fra andre udviklere.
- `main` er altid kilden til sandheden; ingen langtlevende branches der driver ud i ingenting.
- Tvinger små, fokuserede commits frem.

**Ulemper / forudsætninger:**

- Kræver høj tillid mellem udviklere – man committer "live" til delt kode.
- Kræver stærk automatiseret test (lint, unit, e2e) som sikkerhedsnet.
- Risiko for at brække `main`, hvis disciplinen glipper.

**Hvorfor det passer til Milton-projektet:**

- Lille gruppe → kort kommunikationsvej.
- Vi har GitHub Actions, der kører unit tests (Vitest) og e2e (Cypress) på hver push.
- Vi deployer kontinuerligt til Firebase Hosting fra `main` – det giver mening at `main` altid er release-bar.
- Korte projektperioder (eksamen) → ingen behov for tunge versionerede releases.

### 9.2 Feature Branching

For hver ny feature oprettes en branch fra `main`, der arbejdes og merges når featuren er færdig.

**Fordele:** Simpel, isolerede ændringer, fungerer godt med code review.
**Ulemper:** Langtlevende feature-branches kan blive svære at merge (drift fra `main`), og man får senere feedback fra CI.

### 9.3 Git Flow

En struktureret model med flere typer langtlevende branches:

- `main` – produktion.
- `develop` – integration af færdige features.
- `feature/*` – nye features (forgrenet fra `develop`).
- `release/*` – forberedelse af release.
- `hotfix/*` – akutte rettelser direkte fra `main`.

**Fordele:** Velegnet til projekter med versionerede releases (fx desktop-software, installerbare apps).
**Ulemper:** Overkill for de fleste webprojekter med kontinuerlig deployment. Mange branches at vedligeholde.

### 9.4 GitHub Flow

En letvægtsmodel skabt til kontinuerlig deployment:

- `main` er altid produktionsklar.
- Alt arbejde sker i kortvarige feature-branches.
- Pull request → review → merge → deploy.

**Fordele:** Simpel, hurtig, passer godt til CI/CD og SaaS.
**Ulemper:** Kræver god testdækning, da `main` skal være altid-deployable. Branches kan stadig leve længere end nødvendigt.

GitHub Flow ligger tæt på trunk-based – forskellen er primært, om man som standard arbejder *i en branch* eller *direkte på main*.

### 9.5 GitLab Flow

Som GitHub Flow, men med **environment branches** (`pre-production`, `production`) for at håndtere staging og produktion separat.

### 9.6 Sammenligning

| Strategi | Branch-levetid | Egnet til |
|----------|---------------|-----------|
| **Trunk-Based** *(vores)* | Minutter–timer | Modne teams med stærk automatisering, kontinuerlig deployment |
| Feature Branching | Dage–uger | Små teams, gradvis udvikling |
| Git Flow | Uger–måneder | Versionerede produkter, planlagte releases |
| GitHub Flow | Timer–dage | SaaS, CI/CD, web |
| GitLab Flow | Timer–dage | SaaS med flere miljøer |

> **Eksamenstip:** Vælg strategi ud fra **release-kadence** og **teamets modenhed**. Et ugentligt SaaS-release passer dårligt med Git Flow; en embedded device-firmware passer dårligt med Trunk-Based. I Milton-projektet matcher Trunk-Based projektets størrelse, vores CI/CD og hyppigheden af deployment.

---

## 10. Remote repositories

### 10.1 Hvad er et remote?

Et **remote** er en version af projektet, der ligger et andet sted – typisk på en server som GitHub, GitLab eller Bitbucket. Det fungerer som:

- **Samarbejdspunkt** – det "neutrale sted" alle synkroniserer mod.
- **Backup** – fuld kopi af historikken uden for din maskine.
- **Trigger for automatisering** – CI/CD lytter på events på remote.

Et lokalt repo kan have flere remotes. Den primære hedder konventionelt `origin`.

### 10.2 Remote-kommandoer

```sh
git remote                            # List remotes
git remote -v                         # Vis remote URL'er
git remote add origin <url>           # Tilføj en remote
git remote set-url origin <url>       # Skift URL
git remote remove origin              # Fjern
```

### 10.3 Synkroniseringsoperationer

```sh
git clone <url>          # Hent repo + hele historikken første gang
git fetch                # Hent remote-ændringer (men merge ikke)
git pull                 # fetch + merge i ét trin
git pull --rebase        # fetch + rebase (lineær historik – passer godt til trunk-based)
git push                 # Send lokale commits til remote
git push -u origin <br>  # Sæt upstream-tracking ved første push
git push --force-with-lease  # "Sikker" force push, fejler hvis remote er ændret
```

**Forskel på `fetch` og `pull`:**

- `fetch` opdaterer kun dine *remote-tracking branches* (`origin/main`). Din lokale `main` ændres ikke.
- `pull` er `fetch` + `merge` (eller rebase). Det ændrer din lokale branch.

I trunk-based er det en god vane at køre `git pull --rebase` flere gange dagligt, så din lokale `main` altid afspejler den nyeste delte state, før du pusher.

### 10.4 Tracking branches

Når du laver `git push -u origin <branch>`, sætter du en **upstream**-relation. Bagefter kan du nøjes med `git pull` og `git push` uden flere argumenter, og `git status` vil fortælle dig om du er "ahead" eller "behind" remote.

### 10.5 Lokal vs. remote – hvad gør hvad?

| Handling | Sker lokalt | Sker på remote |
|----------|-------------|----------------|
| `git add`, `git commit` | ✓ | – |
| `git branch`, `git switch` | ✓ | – |
| `git log` | ✓ | – |
| `git fetch` | ✓ (opdaterer refs) | – |
| `git pull` | ✓ | – |
| `git push` | – | ✓ |

Pointen: Næsten alt arbejde foregår lokalt. Først ved `push` deler du noget med andre – og det er det øjeblik, hvor CI/CD reagerer og de andre i gruppen kan se din kode.

---

## 11. Konflikthåndtering

En **merge-konflikt** opstår, når Git ikke automatisk kan kombinere to ændringer – fx hvis to udviklere har ændret samme linje i samme fil. I trunk-based ses konflikter typisk når man `git pull --rebase`'er før push.

### 11.1 Eksempel på konflikt-markører

Når Git støder på en konflikt, skriver den begge versioner ind i filen:

```js
function getStatus() {
<<<<<<< HEAD
  return "active";
=======
  return "in_progress";
>>>>>>> origin/main
}
```

- Mellem `<<<<<<< HEAD` og `=======` står *din* version.
- Mellem `=======` og `>>>>>>> origin/main` står *den indkommende* version.

### 11.2 Trin for at løse konflikten

1. Åbn filen i editoren.
2. Vælg den korrekte version (eller en kombination).
3. Slet konflikt-markørerne (`<<<<<<<`, `=======`, `>>>>>>>`).
4. `git add <fil>` for at markere konflikten som løst.
5. `git commit` (ved merge) eller `git rebase --continue` (ved rebase).

Hvis konflikten viser sig at være for kompliceret, kan man altid afbryde:

```sh
git merge --abort        # Afbryd igangværende merge
git rebase --abort       # Afbryd igangværende rebase
```

### 11.3 Sådan undgår man konflikter

- **Pull ofte** så din lokale `main` ikke når at drive langt fra origin – især vigtigt i trunk-based.
- **Hold commits små** – jo mindre overflade, jo mindre risiko for overlap.
- **Kommuniker** med gruppen om hvem der arbejder hvor.
- **Modularisering** – hvis hvert modul har sin egen fil, rammer to udviklere sjældent samme linje.

---

## 12. Praktisk Git-workflow i Milton-projektet

Et typisk arbejdsforløb i Milton-projektet ser sådan ud – trunk-based, med direkte arbejde på `main` for små ændringer.

### 12.1 Synkroniser før du starter

```sh
git switch main
git pull --rebase
```

Dette sikrer at din lokale `main` er identisk med origin, så du ikke arbejder oven på forældet kode.

### 12.2 Arbejd og commit i små trin

```sh
# Lav en lille fokuseret ændring i editoren
git status
git diff
git add src/views/DocumentsView.vue
git commit -m "Add document upload form to DocumentsView"

# Næste lille ændring
git add src/components/DocumentList.vue
git commit -m "Render uploaded documents in DocumentList"
```

I trunk-based er disciplinen omkring **små commits** ekstra vigtig. Hver commit bør være:

- Lille (få filer, få linjer).
- Selvstændig (kunne stå alene logisk).
- Grøn (lokale tests og lint passerer).

### 12.3 Kør lokale checks før push

```sh
npm run lint
npm run test:unit
```

Det er din egen private "CI", inden den rigtige CI tager over. I trunk-based skal du være ekstra sikker, fordi din commit lander direkte på den delte hovedlinje.

### 12.4 Sync igen og push

Lige før du pusher, synkroniser igen for at undgå at skubbe på forældet base:

```sh
git pull --rebase
git push
```

### 12.5 CI/CD reagerer automatisk

GitHub Actions (konfigureret i `.github/workflows/`) kører på hver push til `main`:

- Linting med ESLint.
- Unit tests med Vitest.
- E2E tests med Cypress.
- Bygger appen og deployer til Firebase Hosting hvis alt er grønt.

Det er denne automatisering, der gør trunk-based forsvarligt. Uden en grundig CI ville direkte commits til `main` være for risikabelt.

### 12.6 Hvornår vi *alligevel* bruger en branch

Selvom udgangspunktet er trunk-based, opretter vi en kortvarig branch når:

- Ændringen er **stor og risikabel** (større refaktorering, ny modul-struktur).
- Vi vil have **eksplicit code review** før integration.
- En **WIP** strækker sig over flere dage og ikke kan skjules bag et feature flag.

Eksempel fra historikken – kalender-refaktoreringen:

```sh
git switch -c kalenderRef
# ... flere commits af refaktorering ...
git push -u origin kalenderRef
# Pull request, review, godkendt
git switch main
git pull --rebase
git merge kalenderRef
git push
git branch -d kalenderRef
git push origin --delete kalenderRef
```

### 12.7 Hotfix-eksempel

I trunk-based er hotfixes næsten samme flow som almindelige commits, fordi `main` allerede er produktionsbranchen:

```sh
git switch main
git pull --rebase
# Ret fejlen direkte
git commit -am "fix e2e failed login test to contain corrected message"
git push
# CI/CD bygger og deployer rettelsen
```

Den korte iterationstid er kun mulig, fordi `main` altid er deployable og CI/CD er på plads.

---

## 13. Eksamensoverblik

### 13.1 Centrale begreber (kunne forklares mundtligt)

- **VCS-typer**: Local, Centralized, Distributed.
- **De tre faser**: Working Directory → Staging → Repository.
- **Snapshot vs. diff**: Git gemmer snapshots, ikke patches.
- **Hash**: SHA-1 identifikator, gør historikken uforanderlig.
- **Branch**: Bare en pointer; billig at oprette og slette.
- **Merge vs. rebase**: Bevar historik vs. lineariser historik.
- **Konflikt**: Når Git ikke kan auto-merge – løses manuelt.
- **Trunk-based**: Kort levetid på branches, hyppig integration, CI/CD som sikkerhedsnet.

### 13.2 Kommandoer du bør kunne forklare

| Kommando | Hvad gør den? |
|----------|---------------|
| `git init` | Opretter et nyt repo |
| `git clone` | Henter et remote repo lokalt |
| `git status` | Viser tilstanden af working dir og staging |
| `git add` | Flytter ændringer til staging |
| `git restore` | Fortryd ændringer / un-stage |
| `git commit` | Opretter et snapshot i repository |
| `git log` | Viser historikken |
| `git diff` | Viser ændringer |
| `git branch` / `git switch` | Håndter branches |
| `git merge` | Slår to branches sammen |
| `git pull --rebase` | Hent og rebase – holder historik lineær |
| `git push` | Send commits til remote |
| `git fetch` | Hent uden at merge |

### 13.3 Eksempel-spørgsmål og hvordan man kan svare

**"Hvad sker der teknisk når du laver et commit?"**
→ Forklar staging area, blob/tree/commit-objekter, SHA-1, og at branchens pointer flyttes frem.

**"Hvorfor er Git distribueret?"**
→ Hver klient har en fuld kopi → offline-arbejde, robusthed, ingen single point of failure. Modsætningen er CVCS som SVN.

**"Hvilken branch-strategi bruger I, og hvorfor?"**
→ Trunk-based development. Vi committer primært direkte til `main`, holder commits små og fokuserede, og lader GitHub Actions køre lint + unit + e2e som sikkerhedsnet. Større refaktoreringer (fx kalender-refaktoreringen på `kalenderRef`-branchen) får dog en kort branch for at muliggøre eksplicit code review. Strategien passer fordi gruppen er lille, deployment er kontinuerlig til Firebase Hosting, og vi har stærk testautomatisering.

**"Hvorfor er gode commit-beskeder vigtige?"**
→ De er dokumentation for fremtidige udviklere, gør code review og `git bisect` brugbar, og hjælper med onboarding. I trunk-based er commit-beskeder ekstra vigtige, fordi commits er den primære integrationsenhed – ikke pull requests med lange beskrivelser.

**"Hvordan løser I konflikter?"**
→ Konflikt-markører i filen → manuelt redigere → `git add` → `git commit` / `git rebase --continue`. Forebyggelse: `git pull --rebase` ofte, små commits, modulær kode.

**"Hvad er forskellen på merge og rebase?"**
→ Merge bevarer historikken som en graf med en merge-commit. Rebase flytter commits og giver en lineær historik. Rebase må ikke bruges på commits, der allerede er delt med andre, fordi det ændrer hashes.

### 13.4 Tips til eksamensafholdelse

- **Tegn modellen** – HEAD, branches, commits som et træ er meget lettere at forklare visuelt end verbalt.
- **Brug konkrete eksempler** – fx `kalenderRef`-branchen og de daglige direct-to-main commits fra Milton-projektet.
- **Vær ærlig om trade-offs** – ingen branch-strategi er "rigtig"; det handler om kontekst. Forklar hvorfor trunk-based passer til *vores* situation, men ikke nødvendigvis til et stort enterprise-projekt.
- **Kobl Git til CI/CD** – det viser at du forstår hvorfor versionsstyring er fundamentet for moderne udvikling, ikke en isoleret disciplin. Trunk-based er kun forsvarligt på grund af automatiseret test.

---

*Næste dokument i serien dækker kodekvalitet og refaktorering.*
