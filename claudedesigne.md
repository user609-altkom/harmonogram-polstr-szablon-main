Stwórz jeden komponent React z Tailwind, bez bibliotek UI i bez dodatkowych zależności. To ma być prosty, czytelny ekran kalkulatora harmonogramu spłat kredytu hipotecznego dla doradcy w banku.

Założenia:
- komponent ma być w jednym pliku,
- używaj Tailwind do stylowania,
- nie używaj bibliotek UI ani ikon zewnętrznych,
- ekran ma wyglądać nowocześnie, profesjonalnie i prostolinijnie,
- charakter: bankowo-finansowy, czytelny dla użytkownika, bez zbędnych ozdobników,
- teksty i etykiety po polsku.

Funkcje:
- formularz z polami:
  - kwota kredytu (PLN),
  - liczba rat,
  - data pierwszej raty,
  - marża (w punktach procentowych),
  - wskaźnik: POLSTR 1M albo WIBOR 3M,
  - typ rat: równe albo malejące,
  - lista nadpłat: miesiąc, kwota, tryb (obniż ratę albo skróć okres),
- przycisk „Policz”
- po kliknięciu pobiera dane z endpointu:
  - GET /api/harmonogram?... z parametrami formularza w query string
- wynik:
  - rata pierwsza,
  - rata ostatnia,
  - suma odsetek,
  - tabela rat z kolumnami: nr, data, kapitał, odsetki, rata, saldo,
  - przycisk „Eksport CSV”
- kwoty wyświetlaj z separatorem tysięcy i dwoma miejscami po przecinku
- tabela ma mieć czytelne nagłówki i responsywny układ
- na górze ekranu ma być sekcja nagłówkowa z tytułem: „Kalkulator harmonogramu kredytu”
- poniżej ma być prosty panel formularza i panel wyników
- interfejs ma być gotowy do podpięcia do API i nie zawierać mocków

Dodatkowe wymagania:
- komponent ma być zapisany jako `app/page.tsx`
- na górze pliku musi być dyrektywa `'use client'` w pierwszej linii
- nie dodawaj zależności
- utrzymaj prosty i spójny wygląd, bez logotypów i bez rozbudowanych grafik
- pamiętaj o dobrym układzie na desktopie i mobile

Dodatkowe uwagi:
- formularz ma być łatwy do użycia przez doradcę bankowego,
- wyniki mają być czytelne, z dobrym kontrastem i przejrzystą tabelą,
- kod ma być przygotowany do podłączenia do endpointu `/api/harmonogram`,
- eksport CSV ma generować plik w przeglądarce po kliknięciu.

Wynik ma być gotowym fragmentem kodu React z Tailwind, który da się wkleić bez dalszych poprawek do `app/page.tsx`.
