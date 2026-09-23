# Plan wdrożenia CR-A: wybór skutku nadpłaty

## Cel

Dodać możliwość wyboru skutku każdej nadpłaty:

- `skrocOkres` - rata pozostaje bez zmian, a harmonogram kończy się wcześniej,
- `obnizRate` - liczba rat pozostaje bez zmian, a rata jest przeliczana po nadpłacie.

Domyślny tryb dla brakującej wartości `tryb` pozostaje `skrocOkres`.

Zakres nie obejmuje CR-B ani CR-C.

## Stan obecny

- Typ `Nadplata` i oba tryby istnieją w `src/domena/harmonogram.ts`.
- Domena rozpoznaje `obnizRate` i `skrocOkres`, ale wymaga testu kontrolnego zgodnego z kartą CR-A.
- Route handler parsuje listę nadpłat, lecz brak `tryb` obecnie odrzuca dane zamiast stosować domyślne `skrocOkres`.
- Ekran w `app/page.tsx` pozwala obecnie wprowadzić tylko jedną nadpłatę.
- Nadpłata jest obecnie dodawana do pola regularnej raty, co wymaga rozdzielenia raty i nadpłaty w wyniku harmonogramu.

## Etap 1: czerwone testy domeny

Plik: `tests/smoke.test.ts`

Dodać test kontrolny CR-A dla:

- kwoty kredytu: `300 000 zł`,
- liczby rat: `240`,
- oprocentowania: `6,66%`,
- nadpłaty: `30 000 zł` po zaksięgowaniu pierwszej raty.

Sprawdzić wariant `obnizRate`:

- rata przed nadpłatą: `2 265,07 zł`,
- saldo po pierwszej racie i nadpłacie: `269 399,93 zł`,
- nowa rata od drugiego okresu: `2 038,11 zł`,
- liczba rat: `240`,
- suma kapitału z rat i nadpłat: `300 000 zł`.

Sprawdzić wariant `skrocOkres`:

- rata regularna pozostaje równa `2 265,07 zł`,
- liczba rat razem: `196`,
- liczba rat po nadpłacie: `195`,
- ostatnia rata wyrównująca: `2 200,53 zł`,
- suma kapitału z rat i nadpłat: `300 000 zł`.

Dodać test braku `tryb`, który potwierdzi domyślne zachowanie `skrocOkres`.

Na tym etapie `npm test` powinno początkowo nie przechodzić.

## Etap 2: zmiana modelu domenowego

Plik: `src/domena/harmonogram.ts`

1. Zachować księgowanie nadpłaty po racie danego miesiąca.
2. Naliczanie odsetek wykonywać od salda sprzed nadpłaty.
3. Nie doliczać nadpłaty do regularnego pola `rata`.
4. Rozszerzyć `RataHarmonogramu` o osobne pole `nadplata` w groszach.
5. Dla `obnizRate`:
   - pomniejszyć saldo o nadpłatę,
   - zachować pierwotną liczbę rat,
   - wyzerować zapamiętaną ratę równą,
   - obliczyć nową ratę od salda po nadpłacie i pozostałego okresu.
6. Dla `skrocOkres`:
   - zachować wysokość regularnej raty,
   - zmniejszyć liczbę pozostałych rat,
   - zakończyć harmonogram po wcześniejszej spłacie,
   - wyrównać ostatnią ratę do pozostałego salda.
7. Dopilnować, aby suma `czescKapitalowa + nadplata` ze wszystkich rat była równa kwocie kredytu.
8. Zachować zaokrąglanie kwot do groszy w jednym, jasno określonym miejscu.

## Etap 3: zmiana API

Plik: `app/api/harmonogram/route.ts`

1. Przyjąć listę nadpłat z polami:
   - `miesiac`,
   - `kwota`,
   - opcjonalnie `tryb`.
2. Jeśli `tryb` nie występuje, ustawić `skrocOkres`.
3. Odrzucać nieznane wartości trybu czytelnym błędem walidacji.
4. Zachować parsowanie kwoty w złotych do groszy.
5. Nie przenosić obliczeń finansowych do route handlera.
6. Dodać test API lub test parsera, jeśli istniejący układ testów będzie na to pozwalał bez wprowadzania testów UI.

## Etap 4: zmiana ekranu

Plik: `app/page.tsx`

1. Zastąpić pojedynczy formularz nadpłaty listą nadpłat.
2. Umożliwić dodawanie kolejnego wpisu.
3. Każdy wpis powinien zawierać:
   - miesiąc,
   - kwotę,
   - wybór `Obniż ratę` albo `Skróć okres`,
   - przycisk usunięcia wpisu.
4. Domyślnie ustawić nową nadpłatę na `Skróć okres`.
5. Przekazywać całą listę w parametrze `nadplaty` do API.
6. W tabeli pokazać regularną ratę i nadpłatę jako osobne wartości.
7. Zachować eksport CSV i uwzględnić osobną kolumnę nadpłaty.

## Etap 5: dokumentacja

Plik: `README.md`

Dodać konwencję:

> Nadpłata jest księgowana po racie danego miesiąca. Odsetki są naliczane od salda sprzed nadpłaty. Nadpłata nie jest częścią regularnej raty.

Dodać informację, że brak pola `tryb` oznacza `skrocOkres`.

## Etap 6: walidacja

Uruchomić kolejno:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

Ręcznie sprawdzić endpoint z nadpłatą w obu trybach oraz ekran kalkulatora:

```text
/api/harmonogram?kwota=300000&liczbaRat=240&marza=2.11&wskaznik=WIBOR_3M&typRat=rowne&pierwszaRata=2026-10-01&nadplaty=[{"miesiac":1,"kwota":30000,"tryb":"obnizRate"}]
```

Sprawdzić dodatkowo, że brak `tryb` nie powoduje błędu i działa jak `skrocOkres`.

## Kryteria akceptacji

- [x] Każda nadpłata obsługuje `skrocOkres` i `obnizRate`.
- [x] Brak trybu oznacza `skrocOkres`.
- [x] `obnizRate` zachowuje liczbę rat i przelicza ratę.
- [x] `skrocOkres` zachowuje regularną ratę i skraca harmonogram.
- [x] Ostatnia rata w trybie skrócenia jest wyrównująca.
- [x] Nadpłata jest osobnym polem, a nie częścią regularnej raty.
- [x] Suma kapitału z rat i nadpłat równa się kwocie kredytu.
- [x] Test kontrolny CR-A przechodzi.
- [x] Testy istniejące nadal przechodzą.
- [x] Typecheck, lint i build przechodzą.

## Proces Git i PR

1. Utworzyć gałąź:

```text
cr-a-tryb-nadplaty
```

2. Wykonać czerwone testy, implementację i walidację.
3. Utworzyć commit:

```text
cr-a: wybór skutku nadpłaty
```

4. Wypchnąć gałąź i utworzyć PR z odhaczonymi kryteriami 1-4 z CR-A.
5. Dodać Copilota jako reviewera.
6. Zamknąć uwagi review poprawką albo uzasadnieniem.
7. Po scaleniu utworzyć i wypchnąć tag:

```text
git tag v0.2.0
git push --tags
```

8. Sprawdzić produkcję na liczbie kontrolnej CR-A.
