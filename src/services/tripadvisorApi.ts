import apiClient from './apiClient';

export type TripadvisorMatch = { locationId: string; name: string; address?: string };

export function getTripadvisorSearchEndpoint() {
  return import.meta.env.VITE_TRIPADVISOR_SEARCH_ENDPOINT?.trim() || '';
}

// The endpoint should return an array, or { results: [...] }, of { locationId, name, address? }.
export async function searchTripadvisor(name: string, city: string): Promise<TripadvisorMatch[]> {
  const endpoint = getTripadvisorSearchEndpoint();
  if (!endpoint) return [];
  const response = await apiClient.get<unknown>(endpoint, { params: { name, city } });
  const payload = response.data;
  const rows = Array.isArray(payload) ? payload : payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results) ? (payload as { results: unknown[] }).results : [];
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return [];
    const record = row as Record<string, unknown>;
    const id = record.locationId ?? record.location_id;
    const matchName = record.name;
    if ((typeof id !== 'string' && typeof id !== 'number') || typeof matchName !== 'string') return [];
    return [{ locationId: String(id), name: matchName, ...(typeof record.address === 'string' ? { address: record.address } : {}) }];
  });
}
