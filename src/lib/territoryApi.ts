import { apiFetch } from './apiClient';

export interface MyAreaTehsil {
  tehsilId: string;
  name: string;
  district: string;
  state: string;
}

export interface MyAreaResponse {
  tehsils: MyAreaTehsil[];
  dispatchCutoffTime: string;
}

// API-027 — "he requests, staff decide, and he can always see what applies
// to him."
export function getMyArea(accessToken: string): Promise<MyAreaResponse> {
  return apiFetch('/me/area', { accessToken });
}
