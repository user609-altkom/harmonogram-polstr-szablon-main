export type TypRat = 'rowne' | 'malejace';
export type TrybNadplaty = 'obnizRate' | 'skrocOkres';

export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: TrybNadplaty;
}

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: TypRat;
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  /** Stawki dla kolejnych okresów, jako ułamki roczne. */
  stopy?: number[];
  /** Lista nadpłat w okresach. */
  nadplaty?: Nadplata[];
}

export interface RataHarmonogramu {
  numer: number;
  data: string;
  czescKapitalowa: number;
  czescOdsetkowa: number;
  rata: number;
  saldoPoSplacie: number;
}

export interface Harmonogram {
  rataPierwsza: number;
  rataOstatnia: number;
  sumaOdsetek: number;
  raty: RataHarmonogramu[];
}

function zaokraglijDoGrosza(wartosc: number): number {
  return Math.round(wartosc);
}

function dodajMiesiac(data: string, miesiace: number): string {
  const dataWyjsciowa = new Date(`${data}T00:00:00Z`);
  dataWyjsciowa.setUTCMonth(dataWyjsciowa.getUTCMonth() + miesiace);

  const rok = dataWyjsciowa.getUTCFullYear();
  const miesiac = String(dataWyjsciowa.getUTCMonth() + 1).padStart(2, '0');
  const dzien = String(dataWyjsciowa.getUTCDate()).padStart(2, '0');

  return `${rok}-${miesiac}-${dzien}`;
}

function pobierzStopaOprocentowania(stopy: number[] | undefined, numerOkresu: number, marza: number): number {
  if (stopy && stopy.length > 0) {
    const stopa = stopy[Math.max(0, numerOkresu - 1)] ?? stopy[stopy.length - 1] ?? 0;
    return stopa + marza;
  }
  return marza;
}

export function policzHarmonogram(parametry: ParametryKredytu): Harmonogram {
  const stopy = parametry.stopy ?? [];
  let saldo = parametry.kwotaGr;
  let pozostalo = parametry.liczbaRat;
  let rataRowna: number | undefined;
  let poprzedniaStopaRoczna: number | undefined;
  const raty: RataHarmonogramu[] = [];

  for (let numerOkresu = 1; numerOkresu <= parametry.liczbaRat && saldo > 0; numerOkresu += 1) {
    const stopaRoczna = pobierzStopaOprocentowania(stopy, numerOkresu, parametry.marza);
    const stopaMiesieczna = stopaRoczna / 12;
    const pozostaloWTymMiesiacu = Math.max(1, pozostalo);
    const czescOdsetkowa = zaokraglijDoGrosza(saldo * stopaMiesieczna);
    let czescKapitalowa = 0;
    let rataOkresu: number;

    if (parametry.typRat === 'rowne') {
      const zmienilaSieStopa = poprzedniaStopaRoczna !== stopaRoczna;
      if (rataRowna === undefined || zmienilaSieStopa) {
        if (stopaMiesieczna === 0) {
          rataRowna = Math.round(saldo / pozostaloWTymMiesiacu);
        } else {
          const wspolczynnik = Math.pow(1 + stopaMiesieczna, pozostaloWTymMiesiacu);
          rataRowna = Math.round((saldo * stopaMiesieczna * wspolczynnik) / (wspolczynnik - 1));
        }
      }
      rataOkresu = rataRowna;
      czescKapitalowa = Math.min(saldo, Math.max(0, rataOkresu - czescOdsetkowa));
      if (pozostaloWTymMiesiacu === 1 || numerOkresu === parametry.liczbaRat) {
        czescKapitalowa = saldo;
        rataOkresu = czescKapitalowa + czescOdsetkowa;
      }
    } else {
      czescKapitalowa = Math.min(saldo, Math.max(0, Math.round(saldo / pozostaloWTymMiesiacu)));
      rataOkresu = czescKapitalowa + czescOdsetkowa;
      if (pozostaloWTymMiesiacu === 1 || numerOkresu === parametry.liczbaRat) {
        czescKapitalowa = saldo;
        rataOkresu = czescKapitalowa + czescOdsetkowa;
      }
    }

    czescKapitalowa = Math.min(saldo, Math.max(0, czescKapitalowa));
    const saldoPoSplacie = Math.max(0, saldo - czescKapitalowa);

    const rata: RataHarmonogramu = {
      numer: numerOkresu,
      data: dodajMiesiac(parametry.pierwszaRata, numerOkresu - 1),
      czescKapitalowa: zaokraglijDoGrosza(czescKapitalowa),
      czescOdsetkowa: zaokraglijDoGrosza(czescOdsetkowa),
      rata: zaokraglijDoGrosza(rataOkresu),
      saldoPoSplacie,
    };

    raty.push(rata);
    saldo = saldoPoSplacie;
    pozostalo = Math.max(1, pozostalo - 1);
    poprzedniaStopaRoczna = stopaRoczna;

    const nadplata = parametry.nadplaty?.find((element) => element.miesiac === numerOkresu);
    if (nadplata) {
      const kwotaNadplaty = Math.min(saldo, nadplata.kwotaGr);
      saldo -= kwotaNadplaty;
      if (kwotaNadplaty > 0) {
        const ostatnia = raty[raty.length - 1];
        if (ostatnia) {
          ostatnia.czescKapitalowa += kwotaNadplaty;
          ostatnia.rata += kwotaNadplaty;
          ostatnia.saldoPoSplacie = saldo;
        }
      }
      if (nadplata.tryb === 'obnizRate') {
        rataRowna = undefined;
      } else {
        pozostalo = Math.max(1, pozostalo - 1);
      }
    }
  }

  if (raty.length === 0) {
    return {
      rataPierwsza: 0,
      rataOstatnia: 0,
      sumaOdsetek: 0,
      raty: [],
    };
  }

  const sumaKapitalu = raty.reduce((suma, rata) => suma + rata.czescKapitalowa, 0);
  const roznicaKapitalu = parametry.kwotaGr - sumaKapitalu;
  if (roznicaKapitalu !== 0) {
    const ostatnia = raty[raty.length - 1];
    if (ostatnia) {
      ostatnia.czescKapitalowa = zaokraglijDoGrosza(ostatnia.czescKapitalowa + roznicaKapitalu);
      ostatnia.rata = ostatnia.czescKapitalowa + ostatnia.czescOdsetkowa;
      ostatnia.saldoPoSplacie = 0;
    }
  }

  const pierwsza = raty[0];
  const ostatnia = raty[raty.length - 1];
  if (!pierwsza || !ostatnia) {
    return {
      rataPierwsza: 0,
      rataOstatnia: 0,
      sumaOdsetek: 0,
      raty: [],
    };
  }

  const sumaOdsetek = raty.reduce((suma, rata) => suma + rata.czescOdsetkowa, 0);
  return {
    rataPierwsza: pierwsza.rata,
    rataOstatnia: ostatnia.rata,
    sumaOdsetek,
    raty,
  };
}
