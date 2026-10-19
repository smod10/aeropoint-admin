import { getAvailableAirports } from '../data/airports';
import type { AirlineMarkupRule, DefaultFlightPricing, FlightCabin, FlightPriceBreakdown, MarkupRoute, RouteLocation } from '../types/markupRule';

export type FlightPricingQuery = {
  airlineCode: string | null;
  origin: RouteLocation | null;
  destination: RouteLocation | null;
  cabin: FlightCabin | null;
  fare: number;
  date?: string;
};

const todayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

function matchLocation(ruleLocation: RouteLocation | null, searchLocation: RouteLocation | null): boolean {
  if (!ruleLocation) return true;
  if (!searchLocation) return false;
  if (ruleLocation.type === searchLocation.type) return ruleLocation.value.toLowerCase() === searchLocation.value.toLowerCase();
  if (searchLocation.type !== 'airport') return false;
  const airport = getAvailableAirports().find(item => item.iata.toLowerCase() === searchLocation.value.toLowerCase());
  if (!airport) return false;
  if (ruleLocation.type === 'city') return airport.city.toLowerCase() === ruleLocation.value.toLowerCase();
  return ruleLocation.type === 'country' && airport.country.toLowerCase() === ruleLocation.value.toLowerCase();
}

function matchesRoute(route: MarkupRoute, query: FlightPricingQuery): boolean {
  return matchLocation(route.origin, query.origin) && matchLocation(route.destination, query.destination);
}

function ruleSpecificity(rule: AirlineMarkupRule): number {
  const routed = rule.routes.filter(route => route.origin || route.destination);
  if (rule.airlineCode && routed.some(route => route.origin?.type === 'airport' && route.destination?.type === 'airport')) return 4;
  if (rule.airlineCode && routed.length) return 3;
  if (rule.airlineCode) return 2;
  if (routed.length) return 1;
  return 0;
}

export function selectAirlineMarkupRule(rules: AirlineMarkupRule[], query: FlightPricingQuery): AirlineMarkupRule | null {
  const date = query.date ?? todayKey();
  return rules
    .filter(rule => rule.isActive
      && (!rule.airlineCode || rule.airlineCode === query.airlineCode)
      && (!rule.cabin || rule.cabin === query.cabin)
      && (!rule.validFrom || date >= rule.validFrom)
      && (!rule.validTo || date <= rule.validTo)
      && (rule.routes.some(route => matchesRoute(route, query))
        || rule.bidirectional && rule.routes.some(route => matchesRoute({ origin: route.destination, destination: route.origin }, query))))
    .sort((left, right) => ruleSpecificity(right) - ruleSpecificity(left) || right.priority - left.priority)[0] ?? null;
}

function applyMarkup(amount: number, type: DefaultFlightPricing['markupTypeB2C'] | AirlineMarkupRule['markupType'], value: number): number {
  return type === 'percentage' ? amount * value / 100 : value;
}

export function calculateFlightPrice(
  query: FlightPricingQuery,
  rules: AirlineMarkupRule[],
  defaults: DefaultFlightPricing,
  selectedRule?: AirlineMarkupRule | null,
): FlightPriceBreakdown {
  const rule = selectedRule === undefined ? selectAirlineMarkupRule(rules, query) : selectedRule;
  const discount = rule?.discountValue == null
    ? 0
    : rule.discountType === 'percentage' ? query.fare * rule.discountValue / 100 : rule.discountValue;
  const ourCost = Math.max(0, query.fare - discount);
  const passedDiscount = discount * (rule?.passThroughPercent ?? 0) / 100;
  const markup = rule
    ? applyMarkup(ourCost, rule.markupType, rule.markupValueB2C)
    : applyMarkup(ourCost, defaults.markupTypeB2C, defaults.markupValueB2C);
  const subtotal = Math.max(0, query.fare - passedDiscount + markup);
  const tax = defaults.taxType === 'percentage' ? subtotal * defaults.taxValue / 100 : defaults.taxValue;
  const customerPrice = subtotal + tax;
  const marginAmount = subtotal - ourCost;
  const marginPercent = ourCost === 0 ? (marginAmount > 0 ? 100 : 0) : marginAmount / ourCost * 100;

  return { fare: query.fare, airlineDiscount: discount, ourCost, passedDiscount, markup, tax, customerPrice, marginAmount, marginPercent, appliedRule: rule };
}

export function pricingBelowMinimumMargin(breakdown: FlightPriceBreakdown, minimumMarginPercent: number): boolean {
  return breakdown.marginPercent < minimumMarginPercent;
}