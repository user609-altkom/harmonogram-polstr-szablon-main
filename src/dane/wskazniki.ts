import polstr1m from '../../dane/polstr-1m.json';
import wibor3m from '../../dane/wibor-3m.json';
import type { ParametryKredytu } from '../domena/harmonogram';

/** Jeden wpis serii wskaźnika: wartość obowiązuje od dnia `od` do dnia przed kolejnym wpisem. */
export interface WpisSerii {
  /** Dzień, od którego obowiązuje wartość, YYYY-MM-DD. */
  od: string;
  /** Stopa jako ułamek, np. 0.0355 dla 3,55 %. */
  stopa: number;
}

const SERIE: Record<ParametryKredytu['wskaznik'], WpisSerii[]> = {
  POLSTR_1M: polstr1m.wartosci,
  WIBOR_3M: wibor3m.wartosci,
};

/** Seria wartości wskaźnika z dane/*.json, uporządkowana rosnąco po dacie. */
export function seriaWskaznika(wskaznik: ParametryKredytu['wskaznik']): WpisSerii[] {
  return SERIE[wskaznik];
}

function dodajMiesiac(data: string, miesiace: number): string {
  const dataWyjsciowa = new Date(`${data}T00:00:00Z`);
  dataWyjsciowa.setUTCMonth(dataWyjsciowa.getUTCMonth() + miesiace);
  return dataWyjsciowa.toISOString().slice(0, 10);
}

/** Zwraca stawkę obowiązującą w dniu raty, z utrzymaniem ostatniej znanej wartości. */
export function stopaNaDzien(seria: WpisSerii[], data: string): number {
  const wpis = seria.reduce<WpisSerii | undefined>(
    (ostatni, aktualny) => (aktualny.od <= data ? aktualny : ostatni),
    undefined,
  );
  return wpis?.stopa ?? seria[0]?.stopa ?? 0;
}

/** Buduje serię stawek przekazywaną do czystej funkcji domenowej. */
export function stopyNaOkresy(
  wskaznik: ParametryKredytu['wskaznik'],
  pierwszaRata: string,
  liczbaRat: number,
): number[] {
  const seria = seriaWskaznika(wskaznik);
  return Array.from({ length: liczbaRat }, (_, indeks) => stopaNaDzien(seria, dodajMiesiac(pierwszaRata, indeks)));
}
