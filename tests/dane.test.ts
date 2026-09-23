import { describe, expect, it } from 'vitest';
import { seriaWskaznika, stopaNaDzien, stopyNaOkresy } from '../src/dane/wskazniki';

describe('dane: serie wskaźników', () => {
  it('utrzymują pierwszą znaną wartość przed początkiem serii', () => {
    const seria = seriaWskaznika('POLSTR_1M');
    expect(stopaNaDzien(seria, '2020-01-01')).toBe(0.049);
  });

  it('utrzymują ostatnią znaną wartość po końcu serii', () => {
    const seria = seriaWskaznika('WIBOR_3M');
    expect(stopaNaDzien(seria, '2030-01-01')).toBe(0.038);
  });

  it('mapują zmianę kwartalnego WIBOR-u na okresy harmonogramu', () => {
    expect(stopyNaOkresy('WIBOR_3M', '2026-06-01', 3)).toEqual([0.039, 0.038, 0.038]);
  });
});