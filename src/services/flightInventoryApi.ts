import apiClient from './apiClient';
import type { FareOffer, FarePrice, FlatFare, FlightInventoryRecord } from '../types/flight';
import { offersFromFlatFares } from '../utils/fareOffers';

export function getFlightInventoryEndpoint() {
  return import.meta.env.VITE_FLIGHT_INVENTORY_ENDPOINT?.trim() || '';
}

export function getFlightRevalidateEndpoint() {
  return import.meta.env.VITE_FLIGHT_REVALIDATE_ENDPOINT?.trim() || '';
}

type Row = Record<string, unknown>;

const isRow = (value: unknown): value is Row => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const textOf = (row: Row, key: string) => typeof row[key] === 'string' && (row[key] as string).trim() ? (row[key] as string).trim() : undefined;

function amountOf(row: Row, key: string) {
  const raw = row[key];
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() && Number.isFinite(Number(raw))) return Number(raw);
  return undefined;
}

function normalizePrice(row: Row): FarePrice {
  const price: FarePrice = {};
  const passengerType = textOf(row, 'passengerType');
  const passengerCombination = textOf(row, 'passengerCombination');
  if (passengerType) price.passengerType = passengerType;
  if (passengerCombination) price.passengerCombination = passengerCombination;
  for (const key of ['baseFare', 'supplierFare', 'taxesAndFees', 'supplierTotal', 'markup', 'sellingPrice'] as const) {
    const amount = amountOf(row, key);
    if (amount !== undefined) price[key] = amount;
  }
  return price;
}

function normalizeAttributes(row: Row) {
  return {
    cabinClass: textOf(row, 'cabinClass'),
    fareBrand: textOf(row, 'fareBrand'),
    fareBasis: textOf(row, 'fareBasis'),
    bookingClass: textOf(row, 'bookingClass'),
    baggage: textOf(row, 'baggage'),
    conditions: textOf(row, 'conditions'),
    currency: textOf(row, 'currency'),
    availability: textOf(row, 'availability'),
    validUntil: textOf(row, 'validUntil'),
  };
}

function normalizeOffer(value: unknown, index: number, idPrefix: string): FareOffer | undefined {
  if (!isRow(value)) return undefined;
  const prices = Array.isArray(value.prices) ? value.prices.flatMap(price => isRow(price) ? [normalizePrice(price)] : []) : [];
  return { id: textOf(value, 'id') || `${idPrefix}-offer-${index + 1}`, ...normalizeAttributes(value), prices };
}

export function normalizeApiFlight(value: unknown, index: number, retrievedAt: string): FlightInventoryRecord | undefined {
  if (!isRow(value)) return undefined;
  const provider = textOf(value, 'provider') || textOf(value, 'sourceName');
  const [airline, flightNumber, origin, destination, departure] = ['airline', 'flightNumber', 'origin', 'destination', 'departure'].map(key => textOf(value, key));
  if (!provider || !airline || !flightNumber || !origin || !destination || !departure) return undefined;

  const id = textOf(value, 'id') || `api-${provider}-${flightNumber}-${index}`;
  const allowedStatus = ['active', 'inactive', 'verification-required', 'unknown'] as const;
  const status = allowedStatus.find(item => item === textOf(value, 'status')?.toLowerCase()) || 'unknown';

  // Providers return one entry per offer; a flat fares list is still accepted and grouped into offers.
  const offers = Array.isArray(value.offers)
    ? value.offers.flatMap((offer, offerIndex) => { const normalized = normalizeOffer(offer, offerIndex, id); return normalized ? [normalized] : []; })
    : offersFromFlatFares(Array.isArray(value.fares) ? value.fares.flatMap(fare => isRow(fare) ? [{ ...normalizePrice(fare), ...normalizeAttributes(fare) } as FlatFare] : []) : [], id);

  const arrival = textOf(value, 'arrival');
  const cabinClass = textOf(value, 'cabinClass');
  const fareType = textOf(value, 'fareType');
  const availability = textOf(value, 'availability');
  return {
    id,
    airline,
    flightNumber,
    origin,
    destination,
    departure,
    ...(arrival ? { arrival } : {}),
    ...(cabinClass ? { cabinClass } : {}),
    ...(fareType ? { fareType } : {}),
    ...(availability ? { availability } : {}),
    status,
    sourceType: 'api',
    sourceName: provider,
    provider,
    retrievedAt: textOf(value, 'retrievedAt') || retrievedAt,
    offers,
  };
}

export async function fetchApiFlights(): Promise<FlightInventoryRecord[]> {
  const endpoint = getFlightInventoryEndpoint();
  if (!endpoint) return [];

  const response = await apiClient.get<unknown>(endpoint);
  const payload = response.data;
  const rows = Array.isArray(payload)
    ? payload
    : isRow(payload) && Array.isArray(payload.flights)
      ? payload.flights
      : [];
  const retrievedAt = new Date().toISOString();
  return rows.flatMap((row, index) => {
    const flight = normalizeApiFlight(row, index, retrievedAt);
    return flight ? [flight] : [];
  });
}

// The endpoint must re-price the fare with the supplier and return one flight in the inventory contract.
export async function revalidateApiFlight(flightId: string): Promise<FlightInventoryRecord | undefined> {
  const endpoint = getFlightRevalidateEndpoint();
  if (!endpoint) return undefined;
  const response = await apiClient.post<unknown>(endpoint, { id: flightId });
  const payload = response.data;
  const row = isRow(payload) && 'flight' in payload ? payload.flight : payload;
  return normalizeApiFlight(row, 0, new Date().toISOString());
}
