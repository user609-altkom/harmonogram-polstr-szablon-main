# Plan realizacji: Harmonogram na POLSTR

## Cel projektu

Zbudować kalkulator harmonogramu spłat kredytu hipotecznego z możliwością obsługi wskaźników POLSTR 1M i WIBOR 3M, rat równych i malejących oraz nadpłat. Projekt ma być realizowany w Next.js i TypeScript z metodyką spec-kit, z logiką obliczeniową w domenie i prostym API REST oraz ekranem użytkownika.

## Założenia i wymagania

### Obszar biznesowy
- kredyt hipoteczny ze zmiennym oprocentowaniem,
- wskaźniki: POLSTR 1M i WIBOR 3M,
- typy rat: równe i malejące,
- lista nadpłat z trybami: obniż ratę albo skróć okres,
- dane wskaźników w plikach JSON w katalogu `dane/`.

### Wymagania techniczne
- Next.js App Router,
- TypeScript strict,
- domena w `src/domena/` bez React i bez I/O,
- dane wskaźników w `src/dane/`, wczytywane z `dane/*.json`,
- route handler `app/api/harmonogram/route.ts` ma tylko parsować parametry i wywoływać domenę,
- ekran w `app/page.tsx` ma być komponentem z dyrektywą `'use client'` i pobierać dane z `/api/harmonogram`,
- testy Vitest w katalogu `tests/` tylko dla domeny i danych,
- w przypadku zmian logiki obliczeniowej obowiązkowy jest test z liczbą kontrolną.

### Reguły domenowe
- oprocentowanie okresu = wartość wskaźnika + marża,
- POLSTR 1M zmienia się co miesiąc, WIBOR 3M co kwartał,
- po ostatnim wpisie serii obowiązuje ostatnia znana wartość,
- zaokrąglanie do grosza,
- ostatnia rata wyrównująca ma zapewnić, że suma części kapitałowych jest równa kwocie kredytu,
- odsetki proste w okresie, bez kapitalizacji w ramach miesiąca.

### Liczba kontrolna
- kwota kredytu: 400 000 zł,
- 300 rat równych,
- POLSTR 1M 3,55 % + marża 2,11 pp = 5,66 % rocznie,
- rata równa: 2 494,72 zł (tolerancja ±0,05 zł),
- ostatnia rata: 2 492,53 zł.

## Plan realizacji

### 1. Faza przygotowawcza i artefakty spec-kit
- sprawdzenie środowiska i zależności,
- uruchomienie testów, typecheck i build,
- utworzenie gałęzi roboczej `spec-mvp`,
- wygenerowanie artefaktów spec-kit:
  - `.specify/memory/constitution.md`,
  - `specs/.../spec.md`,
  - `plan.md`,
  - `tasks.md`,
- utworzenie PR z artefaktami i przejrzenie review Copilota.

### 2. Faza domeny: obliczanie harmonogramu
- implementacja modułu w `src/domena/harmonogram.ts`,
- pisanie testów zgodnie z listą minimalnych scenariuszy:
  1. rata równa przy stałej stopie,
  2. rata malejąca,
  3. zmiana wskaźnika w trakcie spłaty,
  4. nadpłata w trybie „obniż ratę” i „skróć okres”,
  5. suma części kapitałowych = kwota kredytu po zaokrągleniach,
- obliczanie rat, części kapitałowych i odsetkowych,
- obsługa stałej i zmiennej stopy,
- prawidłowe zaokrąglanie i wyrównanie ostatniej raty.

### 3. Faza danych i wskaźników
- wykorzystanie serii z `dane/polstr-1m.json` i `dane/wibor-3m.json`,
- wskaźnik pobierany z danych dla danego okresu,
- obsługa ostatniej znanej wartości po zakończeniu serii,
- uwzględnienie częstotliwości zmiany wskaźników.

### 4. Faza API
- implementacja `GET /api/harmonogram` w `app/api/harmonogram/route.ts`,
- parsowanie parametrów z query string,
- wywołanie logiki z domeny,
- zwracanie JSON z tabelą rat i sumą odsetek.

### 5. Faza ekranu aplikacji
- implementacja komponentu klienta w `app/page.tsx`,
- formularz wejściowy: kwota, liczba rat, data pierwszej raty, marża, wskaźnik, typ rat, nadpłaty,
- przycisk „Policz”,
- wyświetlanie: rata pierwsza i ostatnia, suma odsetek, tabela rat,
- eksport CSV po stronie przeglądarki,
- stylowanie Tailwind bez dodatkowych bibliotek UI.

### 6. Faza walidacji i wdrożenia
- sprawdzenie przez `npm test`, `npm run typecheck`, `npm run build`,
- testowanie API i UI lokalnie,
- weryfikacja zgodności z numerem kontrolnym,
- wdrożenie na Vercel przez GitHub,
- finalna weryfikacja i gotowość do prezentacji.

## Kolejność wykonania

1. spec-kit: dokumenty i plan,
2. testy domenowe i implementacja harmonogramu,
3. dane wskaźników i integracja z domeną,
4. API,
5. ekran,
6. walidacja i deploy.

## Kryteria sukcesu MVP
- testy dla domeny są zielone,
- liczba kontrolna jest zgodna z BRIEF,
- endpoint `/api/harmonogram` zwraca poprawny JSON,
- ekran wyświetla wynik i pozwala na eksport CSV,
- aplikacja buduje się produkcyjnie i działa na Vercel.

## Uwagi projektowe
- zadania mają być realizowane w małych etapach z osobnym PR na każdą fazę,
- commit message’y i dokumenty powinny być po polsku,
- nie wolno dodawać zależności bez uzasadnienia,
- nie wolno edytować plików w katalogu `dane/` bez wyraźnego polecenia,
- wszystkie obliczenia mają zostać zrealizowane w domenie, a nie w handlerze API ani w komponencie React.
