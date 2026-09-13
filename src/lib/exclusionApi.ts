import { apiFetch } from './apiClient';

// API-120 — a GSTIN-enumeration oracle; rate limiting lives server-side.
export function postLookup(
  accessToken: string,
  gstin: string,
): Promise<{ exists: boolean; maskedFirm?: string }> {
  return apiFetch('/exclusions/lookup', { method: 'POST', accessToken, body: { gstin } });
}

export interface ExclusionListItem {
  exclusionId: string;
  gstin: string;
  addedAt: string;
  status: string;
}
// API-121.
export function getExclusions(accessToken: string): Promise<ExclusionListItem[]> {
  return apiFetch('/exclusions', { accessToken });
}
export function postExclusion(
  accessToken: string,
  gstin: string,
): Promise<{ exclusionId: string }> {
  return apiFetch('/exclusions', { method: 'POST', accessToken, body: { gstin } });
}
export function deleteExclusion(
  accessToken: string,
  exclusionId: string,
): Promise<{ removed: true }> {
  return apiFetch(`/exclusions/${exclusionId}`, { method: 'DELETE', accessToken });
}
