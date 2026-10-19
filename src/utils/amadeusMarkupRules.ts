import type { AirlineMarkupRule, DefaultFlightPricing } from '../types/markupRule';

const RULES_STORAGE_KEY = 'aeropoint-amadeus-markup-rules-v1';
const DEFAULTS_STORAGE_KEY = 'aeropoint-amadeus-markup-defaults-v1';

type RulesByModule = Record<string, AirlineMarkupRule[]>;
type DefaultsByModule = Record<string, DefaultFlightPricing>;

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