export type MarkupValueType = 'percentage' | 'fixed';
export type FlightCabin = 'Economy' | 'Premium Economy' | 'Business' | 'First';
export type RuleSource = 'MANUAL' | 'API';
export type RouteLocationType = 'airport' | 'city' | 'country';

export type RouteLocation = {
  type: RouteLocationType;
  value: string;
  label: string;
};

export type MarkupRoute = {
  origin: RouteLocation | null;
  destination: RouteLocation | null;
};

export type AirlineMarkupRule = {
  id: string;
  airlineCode: string | null;
  routes: MarkupRoute[];
  bidirectional: boolean;
  cabin: FlightCabin | null;
  discountType: MarkupValueType;
  discountValue: number | null;
  markupType: MarkupValueType;
  markupValueB2C: number;
  passThroughPercent: number;
  validFrom: string | null;
  validTo: string | null;
  priority: number;
  isActive: boolean;
  source: RuleSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DefaultFlightPricing = {
  markupTypeB2C: MarkupValueType;
  markupValueB2C: number;
  baseCurrency: string;
  taxType: MarkupValueType;
  taxValue: number;
  minimumMarginPercent: number;
};

export type FlightPriceBreakdown = {
  fare: number;
  airlineDiscount: number;
  ourCost: number;
  passedDiscount: number;
  markup: number;
  tax: number;
  customerPrice: number;
  marginAmount: number;
  marginPercent: number;
  appliedRule: AirlineMarkupRule | null;
};