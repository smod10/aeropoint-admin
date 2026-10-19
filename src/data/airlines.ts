import { iataAirlines } from './iataAirlines';
import { nigerianAirlineSupplement } from './nigerianAirlines';

export type Airline = {
  id: number;
  status: boolean;
  name: string;
  code: string; // 2-letter IATA code
  iata: string; // ICAO / secondary code
  country: string;
};

// Static bundled IATA-code snapshot; imported records and Nigerian supplements are merged below.
export const airlines: Airline[] = iataAirlines;

function mergeAirlines(...groups: Airline[][]): Airline[] {
  const byCode = new Map<string, Airline>();
  groups.flat().forEach(airline => {
    const code = airline.code.toUpperCase();
    const normalizedName = airline.name.trim().toLowerCase();
    const normalizedCountry = airline.country.trim().toLowerCase();
    const sameName = Array.from(byCode.entries()).find(([, existing]) => existing.name.trim().toLowerCase() === normalizedName && existing.country.trim().toLowerCase() === normalizedCountry);
    if (sameName && sameName[0] !== code) byCode.delete(sameName[0]);
    const existingCode = byCode.get(code);
    byCode.set(code, existingCode ? { ...existingCode, ...airline, iata: airline.iata || existingCode.iata } : airline);
  });
  return Array.from(byCode.values());
}

export function getAvailableAirlines(): Airline[] {
  try {
    const saved = localStorage.getItem('aeropoint-imported-airlines');
    const base = mergeAirlines(airlines, nigerianAirlineSupplement);
    if (!saved) return base;
    const parsed = JSON.parse(saved) as Airline[];
    if (!Array.isArray(parsed) || parsed.length === 0) return base;
    // Upgrade if legacy dummy dataset (8 items)
    if (parsed.length <= 8 && parsed.some(a => a.name === 'Fly One')) {
      return base;
    }
    return mergeAirlines(base, parsed);
  } catch {
    return mergeAirlines(airlines, nigerianAirlineSupplement);
  }
}