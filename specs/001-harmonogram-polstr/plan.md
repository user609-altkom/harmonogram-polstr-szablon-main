# Implementation Plan: Harmonogram kredytu na POLSTR

**Branch**: `001-harmonogram-polstr` | **Date**: 2026-09-23 | **Spec**: `specs/001-harmonogram-polstr/spec.md`

**Input**: Feature specification from `specs/001-harmonogram-polstr/spec.md`

## Summary

Wdrożenie kalkulatora harmonogramu spłat kredytu hipotecznego z obsługą POLSTR 1M i WIBOR 3M, rat równych i malejących oraz nadpłat. Zastosowany zostanie prosty model Next.js App Router, z logiką finansową wyizolowaną w domenie, osobnym API i ekranem webowym. Wersja MVP jest zorientowana na poprawność obliczeń i zgodność z liczbą kontrolną z briefu.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS, Vitest

**Storage**: JSON z plikami wskaźników w katalogu `dane/`

**Testing**: Vitest, testy domenowe i testy danych

**Target Platform**: Aplikacja webowa zgodna z Next.js App Router, uruchamiana lokalnie i na Vercel

**Project Type**: Web application

**Performance Goals**: Prosty kalkulator dla pojedynczego kredytu, bez potrzeby skalowania i dużej liczby użytkowników

**Constraints**: Obliczenia finansowe muszą być poprawne, wartości są w groszach, zaokrąglanie jest jawne i w jednym miejscu; brak nowych zależności bez uzasadnienia

**Scale/Scope**: MVP dla pojedynczego użytkownika, pojedynczy harmonogram, pojedynczy ekran kalkulatora

## Constitution Check

- Zgodność z konstytucją: domena czysta, logika w `src/domena/`, brak React w domenie.
- Test-first: każdy ważny scenariusz będzie najpierw opisany testem w `tests/`.
- Brak nowych zależności: stosujemy tylko istniejący stack projektu.
- Dane w `dane/*.json` są źródłem wartości wskaźników.
- Obliczenia finansowe w groszach i z dookreślonym zaokrąglaniem.

## Project Structure

```text
app/
├── api/
│   └── harmonogram/
│       └── route.ts
├── globals.css
├── layout.tsx
└── page.tsx

dane/
├── polstr-1m.json
└── wibor-3m.json

src/
├── dane/
│   └── wskazniki.ts
├── domena/
│   └── harmonogram.ts
└── ...

tests/
├── smoke.test.ts
└── ...
```

**Structure Decision**: Jest to pojedynczy projekt webowy z architekturą typu Next.js App Router. Logika obliczeniowa należy do `src/domena/`, dane do `src/dane/`, endpoint do `app/api/harmonogram/route.ts`, a ekran do `app/page.tsx`.

## Implementation Approach

### 1. Domena finansowa
- funkcja kalkulująca harmonogram rat równych,
- funkcja kalkulująca harmonogram rat malejących,
- wskaźnik stopa okresowa = wartość wskaźnika + marża,
- odsetki = saldo × stopa roczna / 12,
- zaokrąglanie do grosza,
- finalna rata wyrównująca,
- obsługa nadpłat z trybem obniż raty i skróć okres.

### 2. Dane wskaźników
- wczytanie serii z JSON,
- pobranie wartości dla danego okresu,
- obsługa ostatniej znanej wartości po końcu serii,
- zachowanie częstotliwości zmian: POLSTR 1M co miesiąc, WIBOR 3M co kwartał.

### 3. API
- endpoint `GET /api/harmonogram` z query string,
- walidacja parametrów wejściowych,
- delegowanie do domeny,
- zwrócenie JSON z listą rat, sumą odsetek i formatem kompatybilnym z ekranem.

### 4. Ekran
- komponent klienta z Tailwind,
- formularz parametrów,
- fetch do `/api/harmonogram`,
- wyświetlanie pierwszej i ostatniej raty, sumy odsetek oraz tabeli rat,
- eksport CSV po stronie przeglądarki.

## Complexity Tracking

Brak istotnych naruszeń konstytucji. Architektura jest prosta i zgodna z założeniami projektu. Nie ma potrzeby dodawania dodatkowych warstw lub bibliotek, ponieważ problem jest ograniczony do jednego modułu obliczeniowego i jednego UI.
