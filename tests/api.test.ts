import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/harmonogram/route';

describe('API harmonogramu: CR-A', () => {
  it('ustawia skrocenie okresu, gdy nadplata nie ma trybu', async () => {
    const baza = 'http://localhost/api/harmonogram?kwota=300000&liczbaRat=240&marza=2.11&wskaznik=WIBOR_3M&typRat=rowne&pierwszaRata=2026-10-01&nadplaty=';
    const odpowiedz = await GET(new Request(`${baza}%5B%7B%22miesiac%22%3A1%2C%22kwota%22%3A30000%7D%5D`));
    const odpowiedzJawna = await GET(new Request(`${baza}%5B%7B%22miesiac%22%3A1%2C%22kwota%22%3A30000%2C%22tryb%22%3A%22skrocOkres%22%7D%5D`));
    const wynik = (await odpowiedz.json()) as { raty?: Array<{ rata: number }>; blad?: string };
    const wynikJawny = (await odpowiedzJawna.json()) as { raty?: Array<{ rata: number }>; blad?: string };

    expect(odpowiedz.status).toBe(200);
    expect(wynik.blad).toBeUndefined();
    expect(wynikJawny.blad).toBeUndefined();
    expect(wynik.raty?.length).toBe(wynikJawny.raty?.length);
    expect(wynik.raty?.at(-1)?.rata).toBe(wynikJawny.raty?.at(-1)?.rata);
  });
});