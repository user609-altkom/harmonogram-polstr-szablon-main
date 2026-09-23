# Tasks: Harmonogram kredytu na POLSTR

**Input**: Design documents from `specs/001-harmonogram-polstr/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Potwierdzenie przygotowania repo i zdefiniowanie podstaw spec-kit

- [x] T001 Sprawdzenie środowiska Node.js i zależności w repozytorium
- [x] T002 Weryfikacja `npm test`, `npm run typecheck` i `npm run build` przed pracą nad feature
- [x] T003 Utworzenie gałęzi roboczej `spec-mvp`
- [x] T004 Wypełnienie konstitucji projektu w `.specify/memory/constitution.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ostateczne uformowanie spec, planu i listy zadań zgodnie z MVP

- [x] T005 Utworzenie specyfikacji funkcjonalnej w `specs/001-harmonogram-polstr/spec.md`
- [x] T006 Utworzenie planu implementacji w `specs/001-harmonogram-polstr/plan.md`
- [x] T007 Utworzenie listy zadań w `specs/001-harmonogram-polstr/tasks.md`
- [x] T008 Sprawdzenie zgodności z wymaganiami `BRIEF.md` i `PLANREALIZACJI.md`

**Checkpoint**: Foundation ready - można rozpocząć implementację user stories

---

## Phase 3: User Story 1 - Rata równa przy stałej stopie (Priority: P1) 🎯 MVP

**Goal**: Zaimplementować główny scenariusz finansowy zgodnie z numerem kontrolnym.

**Independent Test**: Test domenowy dla kwoty 400 000 zł, 300 rat i stałej stopy 3,55% + marża 2,11 pp.

### Tests for User Story 1

- [x] T010 [P] [US1] Test dla raty równej przy stałej stopie w `tests/`
- [x] T011 [P] [US1] Test dla ostatniej raty wyrównującej i sumy kapitału

### Implementation for User Story 1

- [x] T012 [P] [US1] Ustalenie algorytmu obliczania raty równej w `src/domena/harmonogram.ts`
- [x] T013 [P] [US1] Ustalenie algorytmu zaokrąglania i wyrównania końcowej raty
- [x] T014 [US1] Zaimplementowanie funkcji kalkulacji harmonogramu w domenie

**Checkpoint**: User Story 1 funkcjonalna i testowalna niezależnie

---

## Phase 4: User Story 2 - Raty malejące i zmienna stopa (Priority: P1)

**Goal**: Rozszerzenie logiki o raty malejące i zmiany wskaźników w trakcie spłaty.

**Independent Test**: Test dla harmonogramu z ratami malejącymi i test dla zmiany wskaźnika.

### Tests for User Story 2

- [x] T020 [P] [US2] Test dla rat malejących
- [x] T021 [P] [US2] Test dla zmiany wskaźnika w trakcie spłaty

### Implementation for User Story 2

- [x] T022 [P] [US2] Implementacja rat malejących w domenie
- [x] T023 [US2] Integracja z odczytem serii wskaźnika z `src/dane/wskazniki.ts`
- [x] T024 [US2] Obsługa aktualnej stawki dla kolejnych okresów

**Checkpoint**: User Stories 1 i 2 działają niezależnie

---

## Phase 5: User Story 3 - Nadpłaty (Priority: P2)

**Goal**: Obsługa nadpłat, w tym obniżenie raty i skrócenie okresu.

**Independent Test**: Dwa testy nadpłat w obu trybach.

### Tests for User Story 3

- [x] T030 [P] [US3] Test nadpłaty „obniż ratę”
- [x] T031 [P] [US3] Test nadpłaty „skróć okres”

### Implementation for User Story 3

- [x] T032 [P] [US3] Implementacja logiki nadpłaty w domenie
- [x] T033 [US3] Integracja z harmonogramem rat i saldem kredytu

**Checkpoint**: User Story 3 jest niezależnie testowalna

---

## Phase 6: User Story 4 - API i ekran webowy (Priority: P1)

**Goal**: Udostępnienie wyniku przez endpoint i prezentacja w przeglądarce.

**Independent Test**: Test endpointu `/api/harmonogram` oraz walidacja UI.

### Implementation for User Story 4

- [x] T040 [US4] Implementacja `app/api/harmonogram/route.ts` z parsowaniem query string
- [x] T041 [US4] Delegowanie do domeny i format JSON z tabelą rat
- [x] T042 [US4] Implementacja `app/page.tsx` z formularzem, tabelą i eksportem CSV
- [x] T043 [US4] Podłączenie API do formularza i wyświetlanie wyników

**Checkpoint**: MVP jest kompletne i gotowe do walidacji

---

## Phase 7: Validation and Release

**Purpose**: Sprawdzenie zgodności z wymaganiami i gotowość do wdrożenia

- [x] T050 Uruchomienie `npm test`
- [x] T051 Uruchomienie `npm run typecheck`
- [x] T052 Uruchomienie `npm run build`
- [x] T053 Weryfikacja zgodności liczby kontrolnej z `BRIEF.md`
- [ ] T054 Wdrożenie na Vercel i finalna kontrola produktu

---

## Dependencies & Execution Order

- Setup i Foundational są obowiązkowe przed user story.
- User Story 1 ma najwyższy priorytet i powinien być wykonany pierwszy.
- Po nim można wprowadzić User Story 2 i 3 równolegle lub sekwencyjnie.
- API i ekran są realizowane po sprawdzeniu poprawności domeny.
- Finalną walidację wykonuje się dopiero po pełnym przejściu wszystkich scenariuszy MVP.
