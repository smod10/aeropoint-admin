import { iataAirlines } from './iataAirlines';

export type Airline = {
  id: number;
  status: boolean;
  name: string;
  code: string; // 2-letter IATA code
  iata: string; // ICAO / secondary code
  country: string;
};

// Officially approved IATA airlines database (1,105 carriers)
export const airlines: Airline[] = iataAirlines;

export function getAvailableAirlines(): Airline[] {
  try {
    const saved = localStorage.getItem('aeropoint-imported-airlines');
    if (!saved) return airlines;
    const parsed = JSON.parse(saved) as Airline[];
    if (!Array.isArray(parsed) || parsed.length === 0) return airlines;
    // Upgrade if legacy dummy dataset (8 items)
    if (parsed.length <= 8 && parsed.some(a => a.name === 'Fly One')) {
      return airlines;
    }
    return parsed;
  } catch {
    return airlines;
  }
}