import type { AirlineMarkupRule, DefaultFlightPricing, DefaultHotelPricing, HotelMarkupRule } from '../types/markupRule';

const RULES_STORAGE_KEY = 'aeropoint-amadeus-markup-rules-v1';
const DEFAULTS_STORAGE_KEY = 'aeropoint-amadeus-markup-defaults-v1';
const HOTEL_RULES_STORAGE_KEY = 'aeropoint-hotel-markup-rules-v1';
const HOTEL_DEFAULTS_STORAGE_KEY = 'aeropoint-hotel-markup-defaults-v1';

type RulesByModule = Record<string, AirlineMarkupRule[]>;
type DefaultsByModule = Record<string, DefaultFlightPricing>;
type HotelRulesByModule = Record<string, HotelMarkupRule[]>;
type HotelDefaultsByModule = Record<string, DefaultHotelPricing>;

function readStorage<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') as T;
  } catch {
    return {} as T;
  }
}

function writeStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function readAirlineMarkupRules(moduleId: number): AirlineMarkupRule[] {
  const byModule = readStorage<RulesByModule>(RULES_STORAGE_KEY);
  return byModule[String(moduleId)] ?? [];
}

export function writeAirlineMarkupRules(moduleId: number, rules: AirlineMarkupRule[]): void {
  const byModule = readStorage<RulesByModule>(RULES_STORAGE_KEY);
  byModule[String(moduleId)] = rules;
  writeStorage(RULES_STORAGE_KEY, byModule);
}

export function readDefaultFlightPricing(moduleId: number, fallback: DefaultFlightPricing): DefaultFlightPricing {
  const byModule = readStorage<DefaultsByModule>(DEFAULTS_STORAGE_KEY);
  return byModule[String(moduleId)] ?? fallback;
}

export function writeDefaultFlightPricing(moduleId: number, pricing: DefaultFlightPricing): void {
  const byModule = readStorage<DefaultsByModule>(DEFAULTS_STORAGE_KEY);
  byModule[String(moduleId)] = pricing;
  writeStorage(DEFAULTS_STORAGE_KEY, byModule);
}

export function readHotelMarkupRules(moduleId: number): HotelMarkupRule[] {
  const byModule = readStorage<HotelRulesByModule>(HOTEL_RULES_STORAGE_KEY);
  return byModule[String(moduleId)] ?? [];
}

export function writeHotelMarkupRules(moduleId: number, rules: HotelMarkupRule[]): void {
  const byModule = readStorage<HotelRulesByModule>(HOTEL_RULES_STORAGE_KEY);
  byModule[String(moduleId)] = rules;
  writeStorage(HOTEL_RULES_STORAGE_KEY, byModule);
}

export function readDefaultHotelPricing(moduleId: number, fallback: DefaultHotelPricing): DefaultHotelPricing {
  const byModule = readStorage<HotelDefaultsByModule>(HOTEL_DEFAULTS_STORAGE_KEY);
  return byModule[String(moduleId)] ?? fallback;
}

export function writeDefaultHotelPricing(moduleId: number, pricing: DefaultHotelPricing): void {
  const byModule = readStorage<HotelDefaultsByModule>(HOTEL_DEFAULTS_STORAGE_KEY);
  byModule[String(moduleId)] = pricing;
  writeStorage(HOTEL_DEFAULTS_STORAGE_KEY, byModule);
}