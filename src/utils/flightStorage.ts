import type { FareMarkupRule, FlatFare, FlightImportHistoryEntry, FlightInventoryRecord } from '../types/flight';
import { offersFromFlatFares } from './fareOffers';

const FLIGHTS_KEY = 'aeropoint-flight-inventory-v2';
const LEGACY_FLIGHTS_KEY = 'aeropoint-imported-flights';
const IMPORT_HISTORY_KEY = 'aeropoint-flight-import-history';
const MARKUP_RULES_KEY = 'aeropoint-flight-markup-rules';

const sampleFlights: FlightInventoryRecord[] = [
  { id: 'sample-1', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'AST Pakistan Airways', flightNumber: 'PK304', origin: 'Lahore', destination: 'Dubai', departure: '06:00:00', cabinClass: 'Economy', fareType: 'Recurring', availability: 'Not live', offers: [], samplePrices: { Adult: 155, Child: 116, Infant: 39 } },
  { id: 'sample-2', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Lufthansa', flightNumber: 'LH778', origin: 'Frankfurt', destination: 'Singapore', departure: '22:05:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 730, Child: 547.5, Infant: 73 } },
  { id: 'sample-3', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Emirates', flightNumber: 'EK382', origin: 'Dubai', destination: 'Hong Kong', departure: '03:45:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 560, Child: 420, Infant: 56 } },
  { id: 'sample-4', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Emirates', flightNumber: 'EK398', origin: 'Dubai', destination: 'Denpasar', departure: '02:35:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 580, Child: 435, Infant: 58 } },
  { id: 'sample-5', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Thai Airways', flightNumber: 'TG910', origin: 'Bangkok', destination: 'London', departure: '23:30:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 650, Child: 487.5, Infant: 65 } },
  { id: 'sample-6', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Thai Airways', flightNumber: 'TG676', origin: 'Bangkok', destination: 'Tokyo', departure: '07:35:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 430, Child: 322.5, Infant: 43 } },
  { id: 'sample-7', status: 'unknown', sourceType: 'sample', sourceName: 'Sample data (not live)', airline: 'Qantas', flightNumber: 'QF011', origin: 'Sydney', destination: 'Los Angeles', departure: '09:40:00', cabinClass: 'Economy', fareType: 'Fixed', availability: 'Not live', offers: [], samplePrices: { Adult: 1100, Child: 825, Infant: 110 } },
];

type LegacyFlight = {
  id: number;
  status: boolean;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  time: string;
  type: string;
  adult: string;
  child: string;
  infant: string;
};

function readLegacyFlights(): FlightInventoryRecord[] {
  const raw = localStorage.getItem(LEGACY_FLIGHTS_KEY);
  if (!raw) return [];

  try {
    return (JSON.parse(raw) as LegacyFlight[]).map((flight, index) => ({
      id: `legacy-${flight.id}-${index}`,
      status: flight.status ? 'verification-required' : 'inactive',
      sourceType: 'import',
      sourceName: 'Legacy local inventory (source details unavailable)',
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departure: flight.time,
      cabinClass: 'Not provided',
      fareType: flight.type,
      availability: 'Not provided',
      offers: [],
      samplePrices: {
        Adult: Number.parseFloat(flight.adult),
        Child: Number.parseFloat(flight.child),
        Infant: Number.parseFloat(flight.infant),
      },
    }));
  } catch {
    return [];
  }
}

type StoredFlight = Omit<FlightInventoryRecord, 'offers'> & { offers?: FlightInventoryRecord['offers']; fares?: FlatFare[] };

// Records saved before offers existed held one flat fare list, with cabin and brand on the flight itself.
function migrateStoredFlight(stored: StoredFlight): FlightInventoryRecord {
  const { fares, offers, ...flight } = stored;
  if (offers) return { ...flight, offers };
  const flatFares = (fares || []).map(fare => ({ ...fare, cabinClass: fare.cabinClass ?? flight.cabinClass, fareBrand: fare.fareBrand ?? flight.fareType }));
  return { ...flight, offers: offersFromFlatFares(flatFares, flight.id) };
}

export function readFlightInventory(): FlightInventoryRecord[] {
  const saved = localStorage.getItem(FLIGHTS_KEY);
  if (saved) {
    try {
      return (JSON.parse(saved) as StoredFlight[]).map(migrateStoredFlight);
    } catch {
      localStorage.removeItem(FLIGHTS_KEY);
    }
  }

  const inventory = [...sampleFlights, ...readLegacyFlights()];
  writeFlightInventory(inventory);
  return inventory;
}

export function writeFlightInventory(records: FlightInventoryRecord[]): void {
  localStorage.setItem(FLIGHTS_KEY, JSON.stringify(records));
}

export function readFlightImportHistory(): FlightImportHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(IMPORT_HISTORY_KEY) || '[]') as FlightImportHistoryEntry[];
  } catch {
    return [];
  }
}

export function writeFlightImportHistory(entries: FlightImportHistoryEntry[]): void {
  localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(entries));
}

function readMarkupRules(): Record<string, FareMarkupRule> {
  try {
    return JSON.parse(localStorage.getItem(MARKUP_RULES_KEY) || '{}') as Record<string, FareMarkupRule>;
  } catch {
    return {};
  }
}

export function readFlightMarkupRule(flightId: string): FareMarkupRule | undefined {
  return readMarkupRules()[flightId];
}

export function writeFlightMarkupRule(flightId: string, rule: FareMarkupRule | undefined): void {
  const rules = readMarkupRules();
  if (rule) rules[flightId] = rule;
  else delete rules[flightId];
  localStorage.setItem(MARKUP_RULES_KEY, JSON.stringify(rules));
}

export function flightDuplicateKey(flight: Pick<FlightInventoryRecord, 'flightNumber' | 'origin' | 'destination' | 'departure'>): string {
  return [flight.flightNumber, flight.origin, flight.destination, flight.departure]
    .map(value => (value || '').trim().toLowerCase())
    .join('|');
}
