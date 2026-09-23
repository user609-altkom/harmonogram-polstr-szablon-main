# Konstytucja projektu: Harmonogram na POLSTR

## Core Principles

### I. Domena czysta i obliczenia w jednym miejscu
Wszystka logika obliczeń kredytu i harmonogramu musi być zlokalizowana w `src/domena/` i realizowana jako czyste funkcje TypeScript bez React, I/O i zależności od czasu systemowego. Route handler i komponenty UI mają tylko przetwarzać dane i pokazywać wyniki.

### II. Test-first i liczby kontrolne
Każda zmiana logiki obliczeń musi mieć test w `tests/` z liczbą kontrolną lub scenariuszem biznesowym. W projekcie obowiązkowe są testy Vitest dla domeny i danych przed wdrożeniem implementacji.

### III. Next.js i TypeScript strict bez niepotrzebnych zależności
Projekt działa na Next.js App Router z TypeScript strict. Nie dodajemy nowych bibliotek bez uzasadnienia w PR. Komponenty i API są proste, czytelne i zgodne ze stackiem repozytorium.

### IV. Wskaźniki i dane jako źródło prawdy
Dane wskaźników są zapisane w `dane/*.json` i dostępne przez `src/dane/wskazniki.ts`. Wartości są wczytywane jako dane wejściowe do obliczeń, a nie ręcznie kodowane w domenie. Ostatnia znana wartość obowiązuje po końcu serii.

### V. Rachunek finansowy z jasnym zaokrąglaniem
Kwoty są traktowane w groszach jako liczby całkowite, a zaokrąglanie jest wykonywane w jednym, jawnie zdefiniowanym miejscu. Ostatnia rata wyrównująca ma zapewnić zgodność sumy części kapitałowych z kwotą kredytu.

## Dodatkowe ograniczenia

- API `app/api/harmonogram/route.ts` jest cienkie: parsuje query string i przekazuje dane do domeny; nie liczy.
- Ekran `app/page.tsx` jest komponentem `'use client'` z Tailwind bez bibliotek UI.
- Dane i komunikaty w dokumentacji, komentarzach i commitach są po polsku.
- W przypadku różnych scenariuszy spłaty obowiązuje prosty model odsetek prostych bez kapitalizacji w okresie.
- Produkcyjny build musi przechodzić przez `next build`, więc lokalne czerwone budowanie oznacza czerwony deploy.

## Proces rozwoju

- Faza po fazie, z małymi PR i review.
- Każdy etap kończy się krótkim podsumowaniem i validacją.
- Nie zaczynamy kolejnej fazy bez zakończenia poprzedniej.
- Zmiany w katalogu `dane/` wymagają wyraźnego polecenia i są objęte testami.

## Governance

Konstytucja ma pierwszeństwo przed lokalnymi nawykami. Wszelkie PR-y i review muszą sprawdzać zgodność z tymi zasadami, a każda decyzja techniczna musi dawać się uzasadnić w kontekście MVP i jakości obliczeń finansowych.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
