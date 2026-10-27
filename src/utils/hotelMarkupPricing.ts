import type { DefaultHotelPricing, HotelMarkupRule, HotelPriceBreakdown } from '../types/markupRule';

export type HotelPricingQuery = {
  basePrice: number;
  city?: string;
  country?: string;
  accommodationType?: string;
  stars?: number;
  boardType?: string;
  date?: string;
};

const todayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

function matchLocation(ruleLocation: { type: string; value: string } | null, searchValue: string | undefined): boolean {
  if (!ruleLocation) return true;
  if (!searchValue) return false;
  return ruleLocation.value.toLowerCase() === searchValue.toLowerCase();
}

function matchesRule(rule: HotelMarkupRule, query: HotelPricingQuery): boolean {
  const date = query.date ?? todayKey();
  if (!rule.isActive) return false;
  if (rule.validFrom && date < rule.validFrom) return false;
  if (rule.validTo && date > rule.validTo) return false;
  if (rule.city && !matchLocation(rule.city, query.city)) return false;
  if (rule.country && !matchLocation(rule.country, query.country)) return false;
  if (rule.accommodationType && query.accommodationType && rule.accommodationType.toLowerCase() !== query.accommodationType.toLowerCase()) return false;
  if (rule.minStars != null && (query.stars ?? 0) < rule.minStars) return false;
  if (rule.maxStars != null && (query.stars ?? 999) > rule.maxStars) return false;
  if (rule.boardType && query.boardType && rule.boardType.toLowerCase() !== query.boardType.toLowerCase()) return false;
  return true;
}

export function selectHotelMarkupRule(rules: HotelMarkupRule[], query: HotelPricingQuery): HotelMarkupRule | null {
  return rules
    .filter(rule => matchesRule(rule, query))
    .sort((left, right) => right.priority - left.priority)[0] ?? null;
}

function applyMarkup(amount: number, type: DefaultHotelPricing['markupTypeB2C'] | HotelMarkupRule['markupType'], value: number): number {
  return type === 'percentage' ? amount * value / 100 : value;
}

export function calculateHotelPrice(
  query: HotelPricingQuery,
  rules: HotelMarkupRule[],
  defaults: DefaultHotelPricing,
  selectedRule?: HotelMarkupRule | null,
): HotelPriceBreakdown {
  const rule = selectedRule === undefined ? selectHotelMarkupRule(rules, query) : selectedRule;
  const discount = rule?.discountValue == null
    ? 0
    : rule.discountType === 'percentage' ? query.basePrice * rule.discountValue / 100 : rule.discountValue;
  const ourCost = Math.max(0, query.basePrice - discount);
  const passedDiscount = discount * (rule?.passThroughPercent ?? 0) / 100;
  const markup = rule
    ? applyMarkup(ourCost, rule.markupType, rule.markupValueB2C)
    : applyMarkup(ourCost, defaults.markupTypeB2C, defaults.markupValueB2C);
  const subtotal = Math.max(0, query.basePrice - passedDiscount + markup);
  const tax = defaults.taxType === 'percentage' ? subtotal * defaults.taxValue / 100 : defaults.taxValue;
  const customerPrice = subtotal + tax;
  const marginAmount = subtotal - ourCost;
  const marginPercent = ourCost === 0 ? (marginAmount > 0 ? 100 : 0) : marginAmount / ourCost * 100;

  return { basePrice: query.basePrice, discount, ourCost, passedDiscount, markup, tax, customerPrice, marginAmount, marginPercent, appliedRule: rule };
}

export function pricingBelowMinimumMargin(breakdown: HotelPriceBreakdown, minimumMarginPercent: number): boolean {
  return breakdown.marginPercent < minimumMarginPercent;
}
