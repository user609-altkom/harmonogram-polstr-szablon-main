import { describe, expect, it } from 'vitest';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('domena: rata równa przy stałej stopie', () => {
  it('zgodnie z liczbą kontrolną', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: Array(300).fill(0.0355),
    });

    expect(Math.abs(wynik.rataPierwsza - 249_472)).toBeLessThanOrEqual(5);
    expect(Math.abs(wynik.rataOstatnia - 249_253)).toBeLessThanOrEqual(5);
    expect(wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0)).toBe(400_000_00);
  });
});

describe('domena: rata malejąca', () => {
  it('ma coraz mniejsze odsetki i sumuje się do kwoty kredytu', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 120_000_00,
      liczbaRat: 12,
      marza: 0.005,
      typRat: 'malejace',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: Array(12).fill(0.04),
    });

    const pierwsza = wynik.raty[0];
    const druga = wynik.raty[1];
    const ostatnia = wynik.raty[11];
    if (!pierwsza || !druga || !ostatnia) {
      throw new Error('Brak oczekiwanych rat w harmonogramie');
    }
    expect(pierwsza.czescKapitalowa).toBe(druga.czescKapitalowa);
    expect(pierwsza.czescOdsetkowa).toBeGreaterThan(ostatnia.czescOdsetkowa);
    expect(wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0)).toBe(120_000_00);
  });
});

describe('domena: zmiana wskaźnika w trakcie spłaty', () => {
  it('używa aktualnej stawki dla kolejnych rat', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 30_000_00,
      liczbaRat: 3,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: [0.04, 0.06, 0.08],
    });

    expect(wynik.raty.map((rata) => rata.czescOdsetkowa)).toEqual([10000, 10017, 6694]);
  });
});

describe('domena: nadpłata w trybie obniż raty i skrócenia okresu', () => {
  it('obniża ratę po nadpłacie', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 30_000_00,
      liczbaRat: 6,
      marza: 0.02,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: Array(6).fill(0.04),
      nadplaty: [{ miesiac: 3, kwotaGr: 5_000_00, tryb: 'obnizRate' }],
    });

    const rataPrzedNadplata = wynik.raty[2];
    const rataPoNadplacie = wynik.raty[3];
    if (!rataPrzedNadplata || !rataPoNadplacie) {
      throw new Error('Brak rat do weryfikacji nadpłaty');
    }
    expect(rataPrzedNadplata.rata).toBeGreaterThan(rataPoNadplacie.rata);
    expect(wynik.raty.length).toBe(6);
  });

  it('skróca okres po nadpłacie', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 30_000_00,
      liczbaRat: 6,
      marza: 0.02,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: Array(6).fill(0.04),
      nadplaty: [{ miesiac: 2, kwotaGr: 10_000_00, tryb: 'skrocOkres' }],
    });

    expect(wynik.raty.length).toBeLessThan(6);
    expect(wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0)).toBe(30_000_00);
  });
});

describe('domena: sumy kapitałowe po zaokrągleniach', () => {
  it('sumują się do pełnej kwoty kredytu', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 45_000_00,
      liczbaRat: 10,
      marza: 0.03,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      stopy: Array(10).fill(0.05),
    });

    expect(wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0)).toBe(45_000_00);
  });
});
