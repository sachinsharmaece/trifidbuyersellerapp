import { apiFetch } from './apiClient';
import type { MeResponse } from './dto';

export interface OtpRequestResult {
  requestId?: string;
  expiresIn: number;
  maskedMobile: string;
  accountExists: boolean;
  devCode?: string; // non-production only, see trifid-serverapp auth.service.ts
}

// API-001
export function requestOtp(mobile: string): Promise<OtpRequestResult> {
  return apiFetch('/auth/otp/request', { method: 'POST', body: { mobile } });
}

export interface OtpVerifyResult {
  accessToken: string;
  me: MeResponse;
}

// API-002
export function verifyOtp(
  requestId: string,
  code: string,
  deviceFingerprint: string,
): Promise<OtpVerifyResult> {
  return apiFetch('/auth/otp/verify', {
    method: 'POST',
    body: { requestId, code, deviceFingerprint },
  });
}

// API-005 — relies on the httpOnly refresh cookie; nothing else to send.
export function refreshSession(): Promise<{ accessToken: string }> {
  return apiFetch('/auth/refresh', { method: 'POST' });
}

// API-006
export function logout(accessToken: string): Promise<{ loggedOut: boolean }> {
  return apiFetch('/auth/logout', { method: 'POST', body: {}, accessToken });
}

// API-008
export function getMe(accessToken: string): Promise<MeResponse> {
  return apiFetch('/me', { accessToken });
}
