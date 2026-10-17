import type { FareOffer, FarePrice, FlatFare } from '../types/flight';

type OfferAttributes = Omit<FareOffer, 'id' | 'prices'>;

const keyFields = ['cabinClass', 'fareBrand', 'fareBasis', 'bookingClass', 'baggage', 'conditions', 'currency'] as const;

// Two offers are the same product only when every one of these attributes matches.
export function offerKey(offer: Pick<OfferAttributes, typeof keyFields[number]>): string {
  return keyFields.map(field => (offer[field] || '').trim().toLowerCase()).join('|');
}

export function priceKey(price: FarePrice): string {
  return (price.passengerCombination || price.passengerType || '').trim().toLowerCase();
}

export function offersFromFlatFares(fares: FlatFare[], idPrefix: string): FareOffer[] {
  const offers = new Map<string, FareOffer>();
  for (const fare of fares) {
    const { cabinClass, fareBrand, fareBasis, bookingClass, baggage, conditions, currency, availability, validUntil, importBatchId, importedAt, ...price } = fare;
    const attributes = { cabinClass, fareBrand, fareBasis, bookingClass, baggage, conditions, currency };
    const key = offerKey(attributes);
    const offer = offers.get(key) ?? { id: `${idPrefix}-offer-${offers.size + 1}`, ...attributes, availability, validUntil, importBatchId, importedAt, prices: [] };
    if (Object.keys(price).length > 0) offer.prices.push(price);
    offers.set(key, offer);
  }
  return Array.from(offers.values());
}
