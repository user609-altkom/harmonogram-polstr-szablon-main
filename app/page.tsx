'use client';

import { FormEvent, useState } from 'react';

type Wskaznik = 'POLSTR_1M' | 'WIBOR_3M';
type TypRat = 'rowne' | 'malejace';
type TrybNadplaty = 'obnizRate' | 'skrocOkres';

interface Rata {
  numer: number;
  data: string;
  czescKapitalowa: number;
  czescOdsetkowa: number;
  rata: number;
  nadplata: number;
  saldoPoSplacie: number;
}

interface Harmonogram {
  rataPierwsza: number;
  rataOstatnia: number;
  sumaOdsetek: number;
  raty: Rata[];
}

interface NadplataFormularza {
  id: number;
  miesiac: string;
  kwota: string;
  tryb: TrybNadplaty;
}

interface DaneFormularza {
  kwota: string;
  liczbaRat: string;
  marza: string;
  pierwszaRata: string;
  wskaznik: Wskaznik;
  typRat: TypRat;
  nadplaty: NadplataFormularza[];
}

const poczatkoweDane: DaneFormularza = {
  kwota: '400000',
  liczbaRat: '300',
  marza: '2.11',
  pierwszaRata: '2026-10-01',
  wskaznik: 'POLSTR_1M',
  typRat: 'rowne',
  nadplaty: [],
};

const formatujKwote = (grosze: number): string =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(grosze / 100);
const formatujLiczbe = (grosze: number): string =>
  new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(grosze / 100);

function zbudujParametry(dane: DaneFormularza): URLSearchParams {
  const parametry = new URLSearchParams({
    kwota: dane.kwota,
    liczbaRat: dane.liczbaRat,
    marza: dane.marza.replace(',', '.'),
    wskaznik: dane.wskaznik,
    typRat: dane.typRat,
    pierwszaRata: dane.pierwszaRata,
  });
  const nadplaty = dane.nadplaty
    .filter((nadplata) => Number(nadplata.kwota.replace(',', '.')) > 0)
    .map((nadplata) => ({
      miesiac: Number(nadplata.miesiac),
      kwota: Number(nadplata.kwota.replace(',', '.')),
      tryb: nadplata.tryb,
    }));
  if (nadplaty.length > 0) parametry.set('nadplaty', JSON.stringify(nadplaty));
  return parametry;
}

function pobierzCsv(harmonogram: Harmonogram): void {
  const naglowek = 'Numer;Data;Kapitał;Odsetki;Rata;Nadpłata;Saldo po spłacie';
  const wiersze = harmonogram.raty.map((rata) => [
    rata.numer,
    rata.data,
    formatujLiczbe(rata.czescKapitalowa),
    formatujLiczbe(rata.czescOdsetkowa),
    formatujLiczbe(rata.rata),
    formatujLiczbe(rata.nadplata),
    formatujLiczbe(rata.saldoPoSplacie),
  ].join(';'));
  const plik = new Blob([`\ufeff${[naglowek, ...wiersze].join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const adres = URL.createObjectURL(plik);
  const link = document.createElement('a');
  link.href = adres;
  link.download = 'harmonogram-kredytu.csv';
  link.click();
  URL.revokeObjectURL(adres);
}

export default function Strona() {
  const [dane, setDane] = useState<DaneFormularza>(poczatkoweDane);
  const [harmonogram, setHarmonogram] = useState<Harmonogram | null>(null);
  const [blad, setBlad] = useState('');
  const [ladowanie, setLadowanie] = useState(false);

  const zmienDane = (pole: keyof DaneFormularza, wartosc: string): void => {
    setDane((poprzednie) => ({ ...poprzednie, [pole]: wartosc }));
  };

  const dodajNadplate = (): void => {
    setDane((poprzednie) => ({
      ...poprzednie,
      nadplaty: [...poprzednie.nadplaty, { id: Date.now(), miesiac: '12', kwota: '', tryb: 'skrocOkres' }],
    }));
  };

  const zmienNadplate = (id: number, pole: keyof Omit<NadplataFormularza, 'id'>, wartosc: string): void => {
    setDane((poprzednie) => ({
      ...poprzednie,
      nadplaty: poprzednie.nadplaty.map((nadplata) => nadplata.id === id ? { ...nadplata, [pole]: wartosc } : nadplata),
    }));
  };

  const usunNadplate = (id: number): void => {
    setDane((poprzednie) => ({ ...poprzednie, nadplaty: poprzednie.nadplaty.filter((nadplata) => nadplata.id !== id) }));
  };

  const oblicz = async (zdarzenie: FormEvent<HTMLFormElement>): Promise<void> => {
    zdarzenie.preventDefault();
    setLadowanie(true);
    setBlad('');
    try {
      const odpowiedz = await fetch(`/api/harmonogram?${zbudujParametry(dane).toString()}`);
      const wynik = (await odpowiedz.json()) as Harmonogram & { blad?: string };
      if (!odpowiedz.ok || wynik.blad) throw new Error(wynik.blad ?? 'Nie udało się obliczyć harmonogramu.');
      setHarmonogram(wynik);
    } catch (bladOdpowiedzi) {
      setBlad(bladOdpowiedzi instanceof Error ? bladOdpowiedzi.message : 'Wystąpił nieznany błąd.');
    } finally {
      setLadowanie(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f2f2] text-[#201e1d]">
      <header className="border-b border-[#d6d3d2] bg-[#201e1d] text-white">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-5 py-6 sm:px-8 lg:px-12">
          <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#76c9df]">Finanse osobiste / 01</p><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Kalkulator harmonogramu kredytu</h1></div>
          <div className="hidden border-l border-white/20 pl-5 text-right text-xs leading-5 text-[#c9c4c2] sm:block"><p>POLSTR 1M</p><p>WIBOR 3M</p><p className="text-[#76c9df]">MVP / 2026</p></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-12 lg:py-12">
        <aside>
          <div className="mb-8 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[#0088b0] text-sm font-bold text-white">01</span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#605d5d]">Parametry</p><h2 className="text-xl font-semibold">Twój kredyt</h2></div></div>
          <form className="space-y-6" onSubmit={oblicz}>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Kwota kredytu</span><span className="flex items-center border-b-2 border-[#201e1d] bg-white px-3 py-2.5"><input className="w-full bg-transparent text-xl font-semibold outline-none" inputMode="decimal" value={dane.kwota} onChange={(e) => zmienDane('kwota', e.target.value)} /><span className="text-sm text-[#605d5d]">zł</span></span></label>
            <div className="grid grid-cols-2 gap-4"><label className="block"><span className="mb-2 block text-sm font-semibold">Liczba rat</span><input className="w-full border-b-2 border-[#201e1d] bg-white px-3 py-3 outline-none" inputMode="numeric" value={dane.liczbaRat} onChange={(e) => zmienDane('liczbaRat', e.target.value)} /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Marża banku</span><span className="flex border-b-2 border-[#201e1d] bg-white px-3 py-3"><input className="w-full bg-transparent outline-none" inputMode="decimal" value={dane.marza} onChange={(e) => zmienDane('marza', e.target.value)} /><span className="text-[#605d5d]">%</span></span></label></div>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Pierwsza rata</span><input className="w-full border-b-2 border-[#201e1d] bg-white px-3 py-3 outline-none" type="date" value={dane.pierwszaRata} onChange={(e) => zmienDane('pierwszaRata', e.target.value)} /></label>
            <fieldset><legend className="mb-2 text-sm font-semibold">Wskaźnik referencyjny</legend><div className="grid grid-cols-2 gap-2">{(['POLSTR_1M', 'WIBOR_3M'] as Wskaznik[]).map((wskaznik) => <button key={wskaznik} className={`border px-3 py-3 text-left text-xs font-bold ${dane.wskaznik === wskaznik ? 'border-[#0088b0] bg-[#0088b0] text-white' : 'border-[#c9c4c2] bg-white'}`} type="button" onClick={() => zmienDane('wskaznik', wskaznik)}>{wskaznik.replace('_', ' ')}</button>)}</div></fieldset>
            <fieldset><legend className="mb-2 text-sm font-semibold">Typ rat</legend><div className="flex border border-[#c9c4c2] bg-white p-1">{(['rowne', 'malejace'] as TypRat[]).map((typ) => <button key={typ} className={`flex-1 px-3 py-2 text-sm font-semibold ${dane.typRat === typ ? 'bg-[#201e1d] text-white' : 'text-[#605d5d]'}`} type="button" onClick={() => zmienDane('typRat', typ)}>{typ === 'rowne' ? 'Równe' : 'Malejące'}</button>)}</div></fieldset>
            <fieldset className="border-t border-[#d6d3d2] pt-5"><legend className="mb-3 flex w-full items-center justify-between text-sm font-semibold"><span>Nadpłaty</span><span className="text-xs font-normal text-[#605d5d]">opcjonalnie</span></legend><div className="space-y-3">{dane.nadplaty.map((nadplata) => <div className="border border-[#c9c4c2] bg-white p-3" key={nadplata.id}><div className="mb-2 flex justify-between"><span className="text-xs font-bold text-[#605d5d]">Nadpłata</span><button className="text-xs font-bold text-[#aa0b56]" type="button" onClick={() => usunNadplate(nadplata.id)}>Usuń</button></div><div className="grid grid-cols-2 gap-2"><label className="text-xs text-[#605d5d]">Miesiąc<input className="mt-1 w-full border-b border-[#201e1d] px-2 py-2 text-sm text-[#201e1d] outline-none" inputMode="numeric" value={nadplata.miesiac} onChange={(e) => zmienNadplate(nadplata.id, 'miesiac', e.target.value)} /></label><label className="text-xs text-[#605d5d]">Kwota<input className="mt-1 w-full border-b border-[#201e1d] px-2 py-2 text-sm text-[#201e1d] outline-none" inputMode="decimal" value={nadplata.kwota} onChange={(e) => zmienNadplate(nadplata.id, 'kwota', e.target.value)} /></label></div><select className="mt-3 w-full border-b border-[#201e1d] px-2 py-2 text-sm outline-none" value={nadplata.tryb} onChange={(e) => zmienNadplate(nadplata.id, 'tryb', e.target.value as TrybNadplaty)}><option value="skrocOkres">Skróć okres</option><option value="obnizRate">Obniż ratę</option></select></div>)}</div><button className="mt-3 w-full border border-dashed border-[#0088b0] px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#0088b0]" type="button" onClick={dodajNadplate}>+ Dodaj nadpłatę</button></fieldset>
            <button className="w-full bg-[#aa0b56] px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white disabled:opacity-60" disabled={ladowanie} type="submit">{ladowanie ? 'Liczenie...' : 'Oblicz harmonogram'}</button>{blad && <p className="border-l-4 border-[#aa0b56] bg-white p-3 text-sm text-[#aa0b56]">{blad}</p>}
          </form>
        </aside>
        <section className="min-w-0"><div className="mb-8 flex items-end justify-between gap-4 border-b-2 border-[#201e1d] pb-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0088b0]">02 / Wynik</p><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Twój harmonogram</h2></div>{harmonogram && <button className="hidden border border-[#201e1d] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] sm:block" type="button" onClick={() => pobierzCsv(harmonogram)}>Pobierz CSV</button>}</div>
          {!harmonogram ? <div className="flex min-h-[420px] items-center justify-center border border-dashed border-[#bcb7b5] bg-white p-8 text-center"><div className="max-w-sm"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-[#eae9e9] text-2xl text-[#0088b0]">↗</div><h3 className="mb-2 text-xl font-semibold">Zobacz koszt swojego kredytu</h3><p className="text-sm leading-6 text-[#605d5d]">Uzupełnij parametry po lewej stronie. Wynik pojawi się tutaj wraz z pełnym rozkładem kapitału i odsetek.</p></div></div> : <><div className="mb-8 grid gap-px bg-[#c9c4c2] sm:grid-cols-3"><div className="bg-white p-5"><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#605d5d]">Pierwsza rata</p><p className="text-2xl font-semibold sm:text-3xl">{formatujKwote(harmonogram.rataPierwsza)}</p></div><div className="bg-[#0088b0] p-5 text-white"><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/75">Ostatnia rata</p><p className="text-2xl font-semibold sm:text-3xl">{formatujKwote(harmonogram.rataOstatnia)}</p></div><div className="bg-white p-5"><p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#605d5d]">Suma odsetek</p><p className="text-2xl font-semibold sm:text-3xl">{formatujKwote(harmonogram.sumaOdsetek)}</p></div></div><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#605d5d]">Pełny plan spłaty</p><p className="mt-1 text-sm text-[#605d5d]">{harmonogram.raty.length} rat / kwoty w złotych</p></div><button className="border border-[#201e1d] px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] sm:hidden" type="button" onClick={() => pobierzCsv(harmonogram)}>CSV</button></div><div className="overflow-x-auto border border-[#c9c4c2] bg-white"><table className="w-full min-w-[820px] border-collapse text-right text-sm"><thead><tr className="border-b-2 border-[#201e1d] text-xs uppercase tracking-[0.08em] text-[#605d5d]"><th className="px-4 py-4 text-left">Nr</th><th className="px-4 py-4 text-left">Data</th><th className="px-4 py-4">Kapitał</th><th className="px-4 py-4">Odsetki</th><th className="px-4 py-4">Rata</th><th className="px-4 py-4">Nadpłata</th><th className="px-4 py-4">Saldo</th></tr></thead><tbody>{harmonogram.raty.map((rata) => <tr className="border-b border-[#e5e2e1] last:border-0 hover:bg-[#f3f2f2]" key={rata.numer}><td className="px-4 py-3 text-left font-semibold">{String(rata.numer).padStart(3, '0')}</td><td className="px-4 py-3 text-left text-[#605d5d]">{rata.data}</td><td className="px-4 py-3">{formatujLiczbe(rata.czescKapitalowa)}</td><td className="px-4 py-3 text-[#aa0b56]">{formatujLiczbe(rata.czescOdsetkowa)}</td><td className="px-4 py-3 font-semibold">{formatujLiczbe(rata.rata)}</td><td className="px-4 py-3 text-[#0088b0]">{rata.nadplata ? formatujLiczbe(rata.nadplata) : '-'}</td><td className="px-4 py-3 text-[#605d5d]">{formatujLiczbe(rata.saldoPoSplacie)}</td></tr>)}</tbody></table></div></>}
        </section>
      </div>
      <footer className="border-t border-[#d6d3d2] px-5 py-5 text-center text-xs text-[#605d5d] sm:px-8 lg:px-12">Kalkulator harmonogramu kredytu / dane wskaźników ilustracyjne / 2026</footer>
    </main>
  );
}