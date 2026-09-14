import { apiFetch } from './apiClient';

export interface PoolSummaryDto {
  poolId: string;
  skuId: string;
  moq: number;
  status: string;
  bindingQty: number;
  totalQty: number;
  payDeadline: string | null;
}
export interface PoolDetailDto extends PoolSummaryDto {
  myRatePaise?: number;
  myCommitment?: {
    qty: number;
    isBinding: boolean;
    reconfirmedAt: string | null;
    paidAt: string | null;
  };
}

// API-060.
export function getPoolsForSkus(accessToken: string, skuIds: string[]): Promise<PoolSummaryDto[]> {
  return apiFetch(`/pools?skuIds=${skuIds.join(',')}`, { accessToken });
}
export function getPool(accessToken: string, poolId: string): Promise<PoolDetailDto> {
  return apiFetch(`/pools/${poolId}`, { accessToken });
}

// API-061 — may create a chain (post-trigger joiner).
export function postCommit(
  accessToken: string,
  poolId: string,
  input: { qty: number; deliveryLocationId: string },
  idempotencyKey: string,
): Promise<{ poolId: string; isBinding: boolean }> {
  return apiFetch(`/pools/${poolId}/commit`, {
    method: 'POST',
    accessToken,
    body: input,
    idempotencyKey,
  });
}

// API-062.
export function postReconfirm(accessToken: string, poolId: string): Promise<{ reconfirmed: true }> {
  return apiFetch(`/pools/${poolId}/reconfirm`, { method: 'POST', accessToken, body: {} });
}
export function postWithdraw(accessToken: string, poolId: string): Promise<{ withdrawn: true }> {
  return apiFetch(`/pools/${poolId}/withdraw`, { method: 'POST', accessToken, body: {} });
}

// API-063 — 👤S, creates a chain per binding buyer.
export function postTriggerEarly(
  accessToken: string,
  poolId: string,
  idempotencyKey: string,
): Promise<{ triggered: true }> {
  return apiFetch(`/pools/${poolId}/trigger-early`, {
    method: 'POST',
    accessToken,
    body: {},
    idempotencyKey,
  });
}
