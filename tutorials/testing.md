# Test

## Indholdsfortegnelse

1. [Hvad er unit testing?](#hvad-er-unit-testing)
2. [Unit testing-principper](#unit-testing-principper)
3. [Unit tests i projektet](#unit-tests-i-projektet)
4. [Test-Driven Development (TDD)](#tdd)
5. [End-to-End (E2E) testing](#e2e-testing)
6. [Unit tests vs. E2E tests](#unit-vs-e2e)
7. [Kørsel af tests](#koersel-af-tests)

---

<a name="hvad-er-unit-testing"></a>

## Hvad er unit testing?

Unit testing er test af **individuelle funktioner eller komponenter i isolation** — adskilt fra resten af systemet. Målet er at verificere at én enhed opfører sig præcis som forventet for et givet input.

### Hvorfor skrive unit tests?

- **Fang fejl tidligt** — problemer opdages med det samme, ikke efter deploy
- **Muliggør refaktorering** — tests er sikkerhedsnettet der bekræfter at adfærden er uændret
- **Dokumenterer kode** — en test viser præcis hvad en funktion er forventet at gøre
- **Forbedrer design** — kode der er svær at teste er som regel dårligt struktureret

---

<a name="unit-testing-principper"></a>

## Unit testing-principper

| Princip | Beskrivelse |
| --- | --- |
| **Isolation** | Test én ting ad gangen — ingen afhængigheder til andre moduler |
| **Deterministisk** | Samme input giver altid samme output |
| **Automatiseret** | Kører uden menneskelig indgriben |
| **Hurtig** | Tests skal udføres hurtigt — sekunders feedback, ikke minutters |
| **Uafhængig** | Tests afhænger ikke af hinanden og kan køres i vilkårlig rækkefølge |

---

<a name="unit-tests-i-projektet"></a>

## Unit tests i projektet

Projektet bruger **Vitest** som test-framework. Testfilerne ligger i `src/utils/__tests__/` og `src/views/__tests__/`.

### Test af en ren funktion — `formatDate`

Den simpleste form for unit test: et fast input giver et forudsigeligt output.

```js
// src/utils/__tests__/date.spec.js
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate', () => {
  it('formats a Date in da-DK short month form', () => {
    expect(formatDate(new Date('2024-03-15T12:00:00Z'))).toMatch(/15\.\s*mar\.\s*2024/);
  });

  it('accepts a value the Date constructor can parse', () => {
    expect(formatDate('2024-03-15T12:00:00Z')).toMatch(/15\.\s*mar\.\s*2024/);
  });

  it('returns "Ukendt dato" for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('Ukendt dato');
    expect(formatDate(undefined)).toBe('Ukendt dato');
  });
});
```

Testen dækker tre scenarier: normalt input som `Date`-objekt, normalt input som streng, og ugyldigt input. Funktionen testes i isolation — ingen Firebase, ingen Vue.

### Test af kanttilfælde — `getFileExtension`

```js
// src/utils/__tests__/file.spec.js
describe('getFileExtension', () => {
  it('returns the lowercased extension', () => {
    expect(getFileExtension('Report.PDF')).toBe('pdf');
  });

  it('returns the trailing segment for multi-dot file names', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('README')).toBe('');
  });

  it('returns an empty string for empty or nullish input', () => {
    expect(getFileExtension('')).toBe('');
    expect(getFileExtension(null)).toBe('');
    expect(getFileExtension(undefined)).toBe('');
  });
});
```

Bemærk at hvert `it`-kald tester præcis ét scenarie. Det gør fejlbeskeder præcise — hvis testen fejler ved `null`-input, er det tydeligt hvad der er galt.

### Test af en Vue-komponent med mocks — `LoginView`

Komponenter har afhængigheder til stores og router. I stedet for at bruge de rigtige implementationer bruges **mocks** — kontrollerede stand-ins der simulerer adfærd.

```js
// src/views/__tests__/LoginView.spec.js
const authStore = {
  signIn: vi.fn(),
  isAdmin: false,
  user: { uid: 'test-user-id' },
  loading: false,
  error: '',
};

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStore,
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));
```

`vi.mock` erstatter hele modulet med en kontrolleret version. Det betyder at testen ikke kræver en Firebase-forbindelse eller en kørende router.

```js
it('logs in admin and redirects to projectoverview', async () => {
  authStore.isAdmin = true;
  authStore.signIn.mockResolvedValueOnce();

  const wrapper = mount(LoginView);
  await wrapper.find('input[type="email"]').setValue('testadmin@test.dk');
  await wrapper.find('input[type="password"]').setValue('test 1234');
  await wrapper.find('form').trigger('submit.prevent');
  await flushPromises();

  expect(authStore.signIn).toHaveBeenCalledWith('testadmin@test.dk', 'test 1234');
  expect(push).toHaveBeenCalledWith({ name: 'projectoverview' });
});
```

`flushPromises()` venter på at alle asynkrone operationer er færdige, inden assertions tjekkes.

---

<a name="tdd"></a>

## Test-Driven Development (TDD)

TDD er en udviklingsmetode hvor tests skrives **før** koden. Cyklussen er:

```text
1. Red    — Skriv en test der fejler (funktionen eksisterer ikke endnu)
2. Green  — Skriv den mindste kode der får testen til at bestå
3. Refactor — Ryd op i koden uden at ændre adfærden
4. Gentag
```

### Fordele ved TDD

- Garanteret høj testdækning — du kan ikke skrive kode uden en test
- Forhindrer over-engineering — du skriver kun det der skal til for at testen er grøn
- Forbedrer design — svær-at-teste kode er et signal om dårlig struktur
- Dokumenterer adfærd — testen beskriver hvad koden skal gøre

### Sammenhæng til refaktorering

Da `actorList` og `statusLabel` blev udtrukket fra komponenterne til `src/utils/calendar.js`, var testene i `calendar.spec.js` allerede på plads. De bekræftede at adfærden var uændret efter flytningen — det er TDD's refactor-trin i praksis.

---

<a name="e2e-testing"></a>

## End-to-End (E2E) testing

E2E tests tester **hele applikationsflowet** fra brugerens perspektiv — fra klik i browseren til den endelige tilstand på skærmen. Projektet bruger **Cypress** til E2E tests.

### Hvornår bruges E2E tests?

- Kritiske brugerflows som login, upload og navigation
- Workflows der krydser flere sider eller komponenter
- Scenarier der kræver en reel browser og netværkskald

### E2E tests i projektet

#### Login-flow — bruger

```js
// cypress/e2e/usertest.cy.js
describe('Login som bruger', () => {
  it('logger ind og redirecter til dashboard', () => {
    cy.visit('/');

    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').type('test1234');

    cy.contains('Log ind').click();

    cy.url().should('include', '/dashboard');
  });
});
```

Testen åbner den rigtige applikation i en rigtig browser, udfylder formularen og verificerer at URL'en indeholder `/dashboard` efter login.

#### Login-flow — admin

```js
// cypress/e2e/admintest.cy.js
describe('Login som admin', () => {
  it('logger ind og går til projektoversigt', () => {
    cy.visit('/');

    cy.get('input[type="email"]').type('testadmin@test.dk');
    cy.get('input[type="password"]').type('test1234');

    cy.contains('Log ind').click();

    cy.url().should('include', '/projektoversigt');
  });
});
```

Admin og bruger har forskellig redirect-logik — to separate tests verificerer begge.

#### Fejlscenarie — forkert login

```js
// cypress/e2e/loginfail.cy.js
describe('Login fejl', () => {
  it('viser fejlbesked ved forkert login', () => {
    cy.visit('/');

    cy.get('input[type="email"]').type('forkert@test.dk');
    cy.get('input[type="password"]').type('forkertkode');

    cy.contains('Log ind').click();

    cy.get('.login__error')
      .should('be.visible')
      .and('contain', 'Ugyldig e-mail eller adgangskode.');
  });
});
```

Et kritisk edge case: hvad sker der når login fejler? Testen verificerer at fejlbeskeden faktisk vises for brugeren.

---

<a name="unit-vs-e2e"></a>

## Unit tests vs. E2E tests

| | Unit tests | E2E tests |
| --- | --- | --- |
| **Hvad testes** | Én isoleret funktion eller komponent | Hele brugerflowet i en rigtig browser |
| **Hastighed** | Millisekunder | Sekunder til minutter |
| **Afhængigheder** | Mocks erstatter eksterne systemer | Rigtige Firebase-kald, rigtig router |
| **Fejlfinding** | Præcis — peger direkte på funktionen | Bredere — noget i flowet fejler |
| **Egnet til** | Logik, beregninger, komponent-adfærd | Login, navigation, kritiske brugerflows |
| **Framework** | Vitest + Vue Test Utils | Cypress |

Tommelfingerregel: skriv mange unit tests til logik og komponenter, og færre E2E tests til de vigtigste brugerflows. E2E tests er dyre at køre og vedligeholde, men uerstattelige til at verificere at alt spiller sammen.

---

<a name="koersel-af-tests"></a>

## Kørsel af tests

```sh
# Unit tests
npm run test:unit

# E2E tests (bygger appen og kører Cypress headless)
npm run test:e2e

# E2E tests med grafisk Cypress-UI (til lokal udvikling)
npm run test:e2e:dev
```

I CI/CD-pipelinen (`ci.yml`) kører begge testtyper automatisk ved hvert push og pull request — unit tests først, derefter E2E. Deployment til Firebase sker kun hvis begge er grønne.
