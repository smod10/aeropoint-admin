import { iataAirports } from './iataAirports';

export type Airport = {
  id: number;
  status: boolean;
  name: string;
  city: string;
  country: string;
  iata: string; // 3-letter IATA code
};

// Officially approved IATA airports database (6,071 airports worldwide)
export const airports: Airport[] = iataAirports;

export function getAvailableAirports(): Airport[] {
  try {
    const saved = localStorage.getItem('aeropoint-imported-airports');
    if (!saved) return airports;
    const parsed = JSON.parse(saved) as Airport[];
    if (!Array.isArray(parsed) || parsed.length === 0) return airports;
    // Upgrade if legacy dummy dataset (7 items)
    if (parsed.length <= 7 && parsed.some(a => a.name === 'Banjarmasin Internasional')) {
      return airports;
    }
    return parsed;
  } catch {
    return airports;
  }
}