export type FlightSourceType = 'sample' | 'api' | 'import';
export type FlightStatus = 'active' | 'inactive' | 'verification-required' | 'unknown';

// One passenger line inside an offer. A supplier may price each passenger type or only a whole passenger combination.
export type FarePrice = {
  passengerType?: 'Adult' | 'Child' | 'Infant' | string;
  passengerCombination?: string;
  baseFare?: number;
  supplierFare?: number;
  taxesAndFees?: number;
  supplierTotal?: number;
  markup?: number;
  sellingPrice?: number;
};

// A flight can have many offers; each differs by cabin, brand, baggage, conditions or price and is priced independently.
export type FareOffer = {
  id: string;
  cabinClass?: string;
  fareBrand?: string;
  fareBasis?: string;
  bookingClass?: string;
  baggage?: string;
  conditions?: string;
  currency?: string;
  availability?: string;
  validUntil?: string;
  importBatchId?: string;
  importedAt?: string;
  prices: FarePrice[];
};

// Flat shape used by older stored records and flat API payloads before offers were modelled.
export type FlatFare = FarePrice & Omit<FareOffer, 'id' | 'prices'>;

export type FlightInventoryRecord = {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival?: string;
  cabinClass?: string;
  fareType?: string;
  availability?: string;
  status: FlightStatus;
  sourceType: FlightSourceType;
  sourceName: string;
  provider?: string;
  retrievedAt?: string;
  importedAt?: string;
  importBatchId?: string;
  offers: FareOffer[];
  samplePrices?: Partial<Record<'Adult' | 'Child' | 'Infant', number>>;
};

export type FlightImportHistoryEntry = {
  id: string;
  fileName: string;
  importedAt: string;
  rowsRead: number;
  recordsImported: number;
  duplicateRows: number;
  rejectedRows: number;
  errors: string[];
};

export type FareMarkupRule = {
  type: 'percent' | 'fixed';
  value: number;
  note?: string;
  updatedAt: string;
  updatedBy: string;
};
