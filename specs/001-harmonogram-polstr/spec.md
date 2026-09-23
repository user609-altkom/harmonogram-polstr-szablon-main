# Feature Specification: Harmonogram kredytu na POLSTR

**Feature Branch**: `001-harmonogram-polstr`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Kalkulator harmonogramu spłat kredytu hipotecznego ze zmiennym oprocentowaniem na POLSTR 1M lub WIBOR 3M, raty równe i malejące, nadpłaty, dane z plików JSON, endpoint API i ekran webowy."

## User Scenarios & Testing

### User Story 1 - Kalkulacja raty równej przy stałej stopie (Priority: P1)
Użytkownik wprowadza kwotę kredytu, liczbę rat, datę pierwszej raty, marżę, typ rat równych i wskaźnik POLSTR 1M oraz otrzymuje poprawny harmonogram spłaty. To jest najważniejsza ścieżka MVP, bo dostarcza wartość biznesową od razu po uruchomieniu produktu.

**Why this priority**: To podstawowy scenariusz użytkownika i kryterium akceptacji z liczby kontrolnej.

**Independent Test**: Można zweryfikować ręcznie przez wywołanie API dla 400 000 zł, 300 rat i stałej stopy 3,55% + marża 2,11 pp; wynik musi odpowiadać 2 494,72 zł ± 0,05 zł.

**Acceptance Scenarios**:

1. **Given** kredyt 400 000 zł, 300 rat, pierwsza rata 2026-09-01, marża 2,11 pp, typ rat równych, wskaźnik stały 0,0355, **When** użytkownik wywoła kalkulację, **Then** pierwsza rata jest równa 2 494,72 zł z tolerancją ±0,05 zł i suma części kapitałowych kończy się na całej kwocie kredytu.
2. **Given** ten sam kredyt i parametry, **When** obliczenie zostanie wykonane, **Then** ostatnia rata jest wyrównująca i ma wartość 2 492,53 zł.

---

### User Story 2 - Kalkulacja rat malejących i zmiennych wskaźników (Priority: P1)
Użytkownik może wybrać raty malejące i wskaźnik WIBOR 3M lub POLSTR 1M; system powinien uwzględnić zmiany wskaźnika w trakcie spłaty oraz poprawnie wypisać harmonogram.

**Why this priority**: Są to wymagania funkcjonalne z zakresu MVP i bez nich produkt nie obsłużyłby pełnej specyfikacji.

**Independent Test**: Można utworzyć dwa testy domenowe: jeden dla rat malejących, drugi dla zmiany wskaźnika między okresami spłaty.

**Acceptance Scenarios**:

1. **Given** kredyt z parametrami ratalnymi malejącymi, **When** obliczenie przebiegnie, **Then** każda kolejna rata ma mniejszą część odsetkową, a suma kapitału pozostaje zgodna z kwotą kredytu.
2. **Given** wartość wskaźnika zmienia się w trakcie spłaty, **When** następuje kolejny okres, **Then** odsetki liczone są według aktualnej stawki dla danego okresu.

---

### User Story 3 - Nadpłaty i skracanie okresu lub obniżanie raty (Priority: P2)
Użytkownik wprowadza listę nadpłat z okresem, kwotą i trybem. System musi poprawnie zmienić harmonogram zgodnie z wybranym trybem.

**Why this priority**: Nadpłaty są częścią zakresu MVP, choć ich pełna złożoność jest niższa niż standardowa rata czy zmienne stawki.

**Independent Test**: Nadpłatę można sprawdzić na prostym kredycie z jedną nadpłatą w trybie obniżenia raty oraz w trybie skrócenia okresu.

**Acceptance Scenarios**:

1. **Given** istnieje nadpłata w trybie obniż ratę, **When** harmonogram zostanie przeliczony, **Then** rata zostanie obniżona, a saldo kredytu zmniejszy się zgodnie z kwotą nadpłaty.
2. **Given** istnieje nadpłata w trybie skróć okres, **When** harmonogram zostanie przeliczony, **Then** liczba rat ulegnie skróceniu, a suma odsetek zmniejszy się.

---

### User Story 4 - Endpoint API i ekran webowy (Priority: P1)
Użytkownik korzysta z aplikacji w przeglądarce i wysyła formularz do API. Aplikacja zwraca dane w formacie JSON i wyświetla harmonogram oraz eksport CSV.

**Why this priority**: To warunek dostarczenia produktu w formie aplikacji webowej zgodnie z zakresem MVP.

**Independent Test**: Można wywołać endpoint z parametrami formularza i sprawdzić, że jest poprawny JSON z tabelą rat oraz że ekran renderuje dane.

**Acceptance Scenarios**:

1. **Given** użytkownik wysyła zapytanie GET do `/api/harmonogram` z parametrami kredytu, **When** endpoint zwróci wynik, **Then** zawiera numer raty, datę, część kapitałową, odsetkową, ratę i saldo po spłacie.
2. **Given** ekran kalkulatora, **When** użytkownik klika „Policz”, **Then** dane są pobierane z API i prezentowane w tabeli z wynikiem oraz możliwością eksportu CSV.

---

### Edge Cases

- Co dzieje się, gdy wskaźnik ma brakujące dane po ostatnim wpisie serii? System ma obowiązkowo stosować ostatnią znaną wartość.
- Co dzieje się, gdy brakujący wpis w danych lub niepoprawna data? System powinien odrzucić niepoprawne dane wejściowe i zwrócić błąd walidacji.
- Co dzieje się, gdy suma części kapitałowych po zaokrągleniach nie daje dokładnie kwoty kredytu? Ostatnia rata jest wyrównująca, aby uzyskać równowagę.
- Co dzieje się, gdy nadpłata przekracza dostępne saldo? Nadpłata powinna zostać ograniczona do bieżącego salda lub odrzucona jako nieprawidłowa.

## Requirements

### Functional Requirements

- **FR-001**: System MUST umożliwiać wpisanie kwoty kredytu, liczby rat, daty pierwszej raty, marży banku, typu rat i wskaźnika.
- **FR-002**: System MUST umożliwiać wybór wskaźnika POLSTR 1M lub WIBOR 3M.
- **FR-003**: System MUST obliczać oprocentowanie okresu jako wartość wskaźnika + marża.
- **FR-004**: System MUST uwzględniać zmiany wskaźnika w trakcie trwania kredytu zgodnie z częstotliwością serii danych.
- **FR-005**: System MUST wspierać raty równe i malejące.
- **FR-006**: System MUST wspierać nadpłaty z trybem obniż ratę lub skróć okres.
- **FR-007**: System MUST zwracać pełny harmonogram rat w formacie JSON z numerem raty, datą, kapitałem, odsetkami, ratą i saldem po spłacie.
- **FR-008**: System MUST zwracać sumę odsetek za cały okres.
- **FR-009**: System MUST stosować zaokrąglanie do grosza w jednym miejscu logiki obliczeń.
- **FR-010**: System MUST wyrównać ostatnią ratę, tak aby suma części kapitałowych była równa kwocie kredytu.
- **FR-011**: System MUST obliczać odsetki proste dla okresu, bez kapitalizacji w ramach miesiąca.
- **FR-012**: System MUST umożliwiać wyświetlenie harmonogramu w ekranie aplikacji oraz export do CSV po stronie przeglądarki.
- **FR-013**: System MUST pobierać dane z API `/api/harmonogram` z parametrami w query string.
- **FR-014**: System MUST używać danych z plików `dane/*.json` jako źródła stóp wskaźników.

### Key Entities

- **Kredyt**: kwota główna, liczba rat, data pierwszej raty, marża, typ rat, wskaźnik, harmonogram spłat.
- **Rata**: numer, data, część kapitałowa, część odsetkowa, rata, saldo po spłacie.
- **Nadpłata**: miesiąc, kwota, tryb: obniż ratę lub skróć okres.
- **Wskaźnik**: nazwa serii, opis, okresy wartości oraz wartość stopy dla danego okresu.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Użytkownik może obliczyć harmonogram kredytu dla 400 000 zł i 300 rat równych i otrzymać ratę 2 494,72 zł z tolerancją ±0,05 zł.
- **SC-002**: System poprawnie obsługuje co najmniej dwa wskaźniki: POLSTR 1M i WIBOR 3M.
- **SC-003**: System obsługuje raty malejące i nadpłaty w obu trybach.
- **SC-004**: API `/api/harmonogram` zwraca komplet danych dla tabeli rat i sumy odsetek.
- **SC-005**: Ekran webowy odświeża wynik po kliknięciu „Policz” i pozwala wyeksportować CSV.

## Assumptions

- Użytkownik pracuje w przeglądarce i ma dostęp do lokalnego środowiska Next.js.
- Wartości wskaźników w plikach JSON są ilustracyjne i przybliżone, zgodnie z wymaganiem MVP.
- Nie ma potrzeby budowania pełnej logiki RRSO, dziennych stawek czy innych zaawansowanych kalkulacji.
- Produkt ma być zbudowany w jednym repozytorium i wdrożony na Vercel z GitHuba.
