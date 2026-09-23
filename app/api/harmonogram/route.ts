import { NextResponse } from 'next/server';
import { stopyNaOkresy } from '../../../src/dane/wskazniki';
import { policzHarmonogram, type Nadplata, type ParametryKredytu } from '../../../src/domena/harmonogram';

// Route handler jest cienki: parsuje parametry z query string, woła domenę, zwraca JSON.
// Żadnych obliczeń finansowych w tym pliku. Przeliczenie jednostek wejścia
// (złote na grosze, punkty procentowe na ułamek) to część parsowania kontraktu API.

const PRZYKLAD =
  '/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01';

function parsujNadplaty(wartosc: string | null): Nadplata[] | string {
  if (!wartosc) {
    return [];
  }

  let dane: unknown;
  try {
    dane = JSON.parse(wartosc) as unknown;
  } catch {
    return 'nadplaty: poprawny JSON, np. [{"miesiac":12,"kwota":10000,"tryb":"obnizRate"}]';
  }

  if (!Array.isArray(dane)) {
    return 'nadplaty: tablica obiektów';
  }

  const nadplaty: Nadplata[] = [];
  for (const element of dane) {
    if (typeof element !== 'object' || element === null) {
      return 'nadplaty: każdy element musi być obiektem';
    }
    const rekord = element as { miesiac?: unknown; kwota?: unknown; tryb?: unknown };
    const miesiac = Number(rekord.miesiac);
    const kwota = Number(rekord.kwota);
    if (!Number.isInteger(miesiac) || miesiac <= 0) {
      return 'nadplaty.miesiac: dodatnia liczba całkowita';
    }
    if (!Number.isFinite(kwota) || kwota <= 0) {
      return 'nadplaty.kwota: dodatnia kwota w złotych';
    }
    if (rekord.tryb !== 'obnizRate' && rekord.tryb !== 'skrocOkres') {
      return 'nadplaty.tryb: obnizRate albo skrocOkres';
    }
    nadplaty.push({ miesiac, kwotaGr: Math.round(kwota * 100), tryb: rekord.tryb });
  }
  return nadplaty;
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwota = Number(szukane.get('kwota'));
  const liczbaRat = Number(szukane.get('liczbaRat'));
  const marza = Number(szukane.get('marza'));
  const wskaznik = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznik !== 'POLSTR_1M' && wskaznik !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';

  const nadplaty = parsujNadplaty(szukane.get('nadplaty'));
  if (typeof nadplaty === 'string') return nadplaty;

  return {
    kwotaGr: Math.round(kwota * 100),
    liczbaRat,
    marza: marza / 100,
    wskaznik,
    typRat,
    pierwszaRata,
    stopy: stopyNaOkresy(wskaznik, pierwszaRata, liczbaRat),
    nadplaty,
  };
}

export function GET(request: Request) {
  const parametry = parsujParametry(new URL(request.url).searchParams);
  if (typeof parametry === 'string') {
    return NextResponse.json({ blad: parametry, przyklad: PRZYKLAD }, { status: 400 });
  }

  try {
    const harmonogram = policzHarmonogram(parametry);
    return NextResponse.json(harmonogram);
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    return NextResponse.json({ blad: komunikat }, { status: 400 });
  }
}
