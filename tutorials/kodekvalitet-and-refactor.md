# Kodekvalitet og Refaktorering

## Indholdsfortegnelse

1. [Hvad er refaktorering?](#hvad-er-refaktorering)
2. [Code Smells](#code-smells)
3. [Refaktorering — Best Practices](#best-practices)
4. [Clean Code-principper](#clean-code)
5. [Selvdokumenterende kode](#selvdokumenterende-kode)
6. [Sammenhæng: Refaktorering og tests](#refaktorering-og-tests)

---

<a name="hvad-er-refaktorering"></a>

## Hvad er refaktorering?

Refaktorering er processen med at forbedre eksisterende kode **uden at ændre dens eksterne adfærd**. Tænk på det som at renovere et hus uden at ændre grundplanen — strukturen bliver bedre, men funktionaliteten forbliver den samme.

### Hvorfor refaktorere?

- Gør koden lettere at læse og forstå
- Nemmere at vedligeholde over tid
- Reducerer risikoen for fejl
- Gør koden mere fleksibel og genanvendelig

---

<a name="code-smells"></a>

## Code Smells

"Code smells" er tegn i koden på, at noget sandsynligvis bør refaktoreres. De er ikke fejl i sig selv, men indikatorer på dårligt design.

### Duplikeret kode

Bryder **DRY-princippet** (Don't Repeat Yourself). Hvis den samme logik optræder flere steder, er det svært at vedligeholde — en ændring skal foretages alle steder.

Et konkret eksempel fra projektet: funktionen til at normalisere en aktørliste fandtes tidligere både i `src/stores/milestones.js` og i `src/components/DashboardTaskList.vue`:

```js
// Fandtes i milestones.js som toActorList(value)...
function toActorList(value) {
  if (Array.isArray(value)) {
    return value.map((actor) => String(actor).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((actor) => actor.trim()).filter(Boolean);
  }
  return [];
}

// ...og igen i DashboardTaskList.vue som actorList(task)
const actorList = (task) => {
  if (Array.isArray(task.actors)) {
    return task.actors.map((actor) => String(actor).trim()).filter(Boolean);
  }
  if (typeof task.actors === 'string') {
    return task.actors.split(',').map((actor) => actor.trim()).filter(Boolean);
  }
  return [];
};
```

Løsningen var at udtrække logikken til ét sted — `src/utils/calendar.js` — og importere den begge steder:

```js
// src/utils/calendar.js
export function actorList(value) {
  if (Array.isArray(value)) {
    return value.map((actor) => String(actor).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((actor) => actor.trim()).filter(Boolean);
  }
  return [];
}
```

Nu importeres `actorList` i stedet for at gentages — og en fremtidig ændring skal kun ske ét sted.

### Lange funktioner og store klasser

En funktion eller klasse der gør for mange ting er svær at forstå og teste. Pinia stores i Options API-stilen havde tidligere `state`, `getters` og `actions` samlet i ét stort objekt. Refaktoreringen til Setup API opdeler det i mindre, selvstændige stykker:

```js
// Før — Options API med alt samlet
export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
  }),
  getters: {
    currentProjectId: (state) => state.currentProject?.id ?? null,
  },
  actions: {
    async fetchProjects() {
      this.loading = true;
      // ...
    },
  },
});

// Efter — Setup API, samme mønster som composables
export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);

  const currentProjectId = computed(() => currentProject.value?.id ?? null);

  async function fetchProjects() {
    loading.value = true;
    // ...
  }

  return { projects, currentProject, currentProjectId, loading, fetchProjects };
});
```

---

<a name="best-practices"></a>

## Refaktorering — Best Practices

### Boy Scout-reglen

> "Efterlad koden bedre end du fandt den."

Hver gang du arbejder i en del af kodebasen, lav små forbedringer undervejs. Udtrækket af `actorList` til `utils/calendar.js` skete f.eks. i forbindelse med anden kalenderrelateret arbejde.

### Tag små skridt

Refaktorer gradvist og **test efter hver ændring**. Udtrækket af hjælpefunktioner og omdannelsen af stores til Setup API skete i separate commits — ikke på én gang.

### Brug IDE-værktøjer

Moderne IDE'er (VS Code) understøtter:

- **Rename symbol** — omdøber en funktion eller variabel alle steder den bruges
- **Extract function** — udtrækker markeret kode til en ny funktion

Disse er mere pålidelige end manuel søg-og-erstat, fordi de forstår kodestrukturen.

### Hav tests på plads

Tests er dit sikkerhedsnet under refaktorering. Da `actorList` og de andre kalenderhjælpere blev udtrukket til `src/utils/calendar.js`, dækker testene i `src/utils/__tests__/calendar.spec.js` at adfærden er uændret:

```js
it('normalizes actors from arrays and comma-separated strings', () => {
  expect(actorList([' Anne ', '', 'Bo'])).toEqual(['Anne', 'Bo']);
  expect(actorList('Anne, Bo,')).toEqual(['Anne', 'Bo']);
  expect(actorList(null)).toEqual([]);
});
```

Testen kørte grønt både før og efter refaktoreringen — det er beviset på at adfærden ikke ændrede sig.

---

<a name="clean-code"></a>

## Clean Code-principper

### SRP — Single Responsibility Principle

Én funktion skal have ét og kun ét ansvar. I projektet håndterer `src/utils/date.js` kun datoformatering, `src/utils/file.js` kun filtyper, og `src/utils/calendar.js` kun kalenderlogik. Ingen af dem blander ansvar.

```js
// src/utils/file.js — kun ansvarlig for filtype-logik
export function getFileExtension(fileName) {
  const segments = String(fileName ?? '').split('.');
  if (segments.length < 2) return '';
  return segments.pop().toLowerCase();
}

export function getTypeDetails(fileName) {
  const extension = getFileExtension(fileName);
  if (extension === 'pdf') return { key: 'pdf', label: 'pdf' };
  if (imageExtensions.has(extension)) return { key: 'image', label: extension };
  return { key: 'file', label: extension || 'ukendt' };
}
```

### DRY — Don't Repeat Yourself

Som vist ovenfor: `actorList` fandtes to steder og blev samlet til ét. Det samme gælder `statusLabel` og `toDateString` — logik der bruges flere steder bor ét sted.

### KISS — Keep It Simple, Stupid

Hold løsningen så enkel som muligt. `formatDate` i `src/utils/date.js` gør præcist én ting og intet mere:

```js
export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Ukendt dato';

  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
```

### YAGNI — You Aren't Gonna Need It

Byg kun det, du faktisk har brug for nu. `useProjectMilestones` i `src/composables/` løser kun det konkrete behov — at hente milestones når et projekt-id ændrer sig — og indeholder ingen spekulativ funktionalitet:

```js
export function useProjectMilestones(projectId) {
  const milestoneStore = useMilestoneStore();

  async function fetchProjectMilestones(id) {
    if (!id) return;
    if (milestoneStore.projectId !== id || milestoneStore.milestones.length === 0) {
      await milestoneStore.fetchMilestones(id);
    }
  }

  watch(projectId, fetchProjectMilestones, { immediate: true });

  return { milestoneStore, fetchProjectMilestones };
}
```

---

<a name="selvdokumenterende-kode"></a>

## Selvdokumenterende kode

God kode læses og forstås uden forklarende kommentarer. Det opnås ved velvalgte navne.

### Klare konstanter i stedet for magiske tal

```js
// src/utils/calendar.js
const WORK_WEEK_DAY_COUNT = 5;
const MIN_WEEK_ROW_COUNT = 8;
```

Et tal som `5` midt i koden fortæller intet. `WORK_WEEK_DAY_COUNT` fortæller præcis hvad det repræsenterer.

### Eksplicitte funktionsnavne

Funktionerne i `src/utils/calendar.js` er navngivet så de beskriver hvad de returnerer:

```js
createTaskEvent(task)               // → ét kalender-event fra en opgave
createTaskEvents(tasks)             // → sorteret liste af events
createEventsByDate(events)          // → Map fra dato-streng til events
createWeekDays(weekStart)           // → dage til uge-visning
createWeekEvents(events, weekStart) // → events klippet til den synlige uge
```

### Forklarende variabler

I stedet for at putte kompleks logik direkte i et udtryk, bruges en mellemliggende variabel med et sigende navn:

```js
// src/utils/calendar.js — i createTaskEvent()
const startsBeforeEnd = firstDate.isBefore(secondDate) || firstDate.isSame(secondDate, 'day');
const start = startsBeforeEnd ? firstDate : secondDate;
const end = startsBeforeEnd ? secondDate : firstDate;
```

### Hvornår skal man kommentere?

Kommentarer bør forklare **hvorfor**, ikke **hvad** — koden selv viser hvad der sker. Brug kommentarer til skjulte begrænsninger, workarounds eller ikke-åbenlyse algoritmiske valg.

---

<a name="refaktorering-og-tests"></a>

## Sammenhæng: Refaktorering og tests

Refaktorering uden tests er risikabelt — du ved ikke om du har brudt noget. I dette projekt er det præcist det mønster der bruges:

1. Funktioner som `actorList`, `statusLabel` og `createTaskEvent` bor i `src/utils/`
2. Hver util-fil har en tilsvarende testfil i `src/utils/__tests__/`
3. Refaktoreringer bekræftes af testene — ikke af manuel inspektion

Dette er kernen i **Test-Driven Development (TDD)**: Red → Green → Refactor. Tests giver friheden til at flytte og omstrukturere kode uden at frygte ukendte sideeffekter.
