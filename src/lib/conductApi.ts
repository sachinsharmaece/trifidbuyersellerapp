import { apiFetch } from './apiClient';

export interface BuyerConductDto {
  rateViews: number;
  rateViewThreshold: number;
  strikeCount: 0;
  blacklisted: boolean;
}
// API-110 GET.
export function getConduct(accessToken: string): Promise<BuyerConductDto> {
  return apiFetch('/me/conduct', { accessToken });
}
export function postDisagree(
  accessToken: string,
  conductRefId: string,
  reason: string,
): Promise<{ recorded: true }> {
  return apiFetch(`/conduct/${conductRefId}/disagree`, {
    method: 'POST',
    accessToken,
    body: { reason },
  });
}

export interface SellerScorecardDto {
  trustTier: string;
  suppliesCompleted: number;
  poCount: number;
  failedCount: number;
  requoteTotal: number;
}
// API-111.
export function getScorecard(accessToken: string): Promise<SellerScorecardDto> {
  return apiFetch('/me/scorecard', { accessToken });
}
