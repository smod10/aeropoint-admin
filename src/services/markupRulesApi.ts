import apiClient from './apiClient';
import type { AirlineMarkupRule, DefaultFlightPricing } from '../types/markupRule';
import type { FlightPricingQuery } from '../utils/flightMarkupPricing';

const rulesPath = (moduleId: number) => `/integrations/${moduleId}/markup-rules`;

export async function listMarkupRules(moduleId: number): Promise<AirlineMarkupRule[]> {
  const response = await apiClient.get<AirlineMarkupRule[]>(rulesPath(moduleId));
  return response.data;
}

export async function createMarkupRule(moduleId: number, rule: Omit<AirlineMarkupRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AirlineMarkupRule> {
  const response = await apiClient.post<AirlineMarkupRule>(rulesPath(moduleId), rule);
  return response.data;
}

export async function updateMarkupRule(moduleId: number, ruleId: string, rule: Partial<AirlineMarkupRule>): Promise<AirlineMarkupRule> {
  const response = await apiClient.patch<AirlineMarkupRule>(`${rulesPath(moduleId)}/${encodeURIComponent(ruleId)}`, rule);
  return response.data;
}

export async function deleteMarkupRule(moduleId: number, ruleId: string): Promise<void> {
  await apiClient.delete(`${rulesPath(moduleId)}/${encodeURIComponent(ruleId)}`);
}

export async function testMarkupPrice(moduleId: number, query: FlightPricingQuery, defaults: DefaultFlightPricing) {
  const response = await apiClient.post(`${rulesPath(moduleId)}/test-price`, { ...query, defaults });
  return response.data;
}