import { apiFetch } from './apiClient';

export interface PaymentClaimInput {
  amountPaise: number;
  method: 'bank_message' | 'utr' | 'screenshot';
  rawText?: string;
  utr?: string;
  fileId?: string;
}

/**
 * API-072. BR-011 — none of the three proofs is proof; this only records
 * that the buyer says he paid. The route is not scoped to one order
 * (trifid-serverapp payment.routes.ts — `POST /orders/payment-claims`, no
 * `:id`) — Sales allocates the claim to specific SOs afterwards.
 */
export function postPaymentClaim(
  accessToken: string,
  input: PaymentClaimInput,
): Promise<{ upcomingReceiptId: string }> {
  return apiFetch('/orders/payment-claims', { method: 'POST', accessToken, body: input });
}
