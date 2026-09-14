import { apiFetch } from './apiClient';

/** Copied from trifid-serverapp/src/modules/orders/orders.dto.ts (API_CONTRACT.md §11.2). */
export const ORDER_RUNGS = [
  'placed',
  'payment',
  'seller_confirmed',
  'leg1_dispatch',
  'paperwork_at_indore',
  'leg2_dispatch',
  'delivered',
  'closed',
  'stopped',
] as const;
export type OrderRung = (typeof ORDER_RUNGS)[number];

export interface BuyerSoDto {
  soId: string;
  soNo: string;
  rung: OrderRung;
  soState: string;
  totalPaise: number;
  payDeadline: string;
  deliveryWindowEndsAt: string | null;
  createdAt: string;
  leg1?: { mode: string; dispatchedAt: string } | null;
  canConfirmReceipt: boolean;
  canComplain: boolean;
  canPay: boolean;
}

// API-070 — 👤B.
export function getMyOrders(accessToken: string): Promise<BuyerSoDto[]> {
  return apiFetch('/orders', { accessToken });
}
export function getMyOrder(accessToken: string, soId: string): Promise<BuyerSoDto> {
  return apiFetch(`/orders/${soId}`, { accessToken });
}

export interface SellerPoDto {
  poId: string;
  poNo: string;
  rung: OrderRung;
  poState: string;
  dispatchDueDate: string;
  promisedOutOfIndoreBy: string;
  hold: boolean;
  failed: boolean;
  requoteCount: number;
  extensionRequestedAt: string | null;
  leg1?: { mode: string; dispatchedAt: string } | null;
  leg2Dispatched: boolean;
  canDispatchLeg1: boolean;
  canRequestExtension: boolean;
}

// API-070 — 👤S.
export function getMySellerOrders(accessToken: string): Promise<SellerPoDto[]> {
  return apiFetch('/seller/orders', { accessToken });
}
export function getMySellerOrder(accessToken: string, poId: string): Promise<SellerPoDto> {
  return apiFetch(`/seller/orders/${poId}`, { accessToken });
}

export interface DispatchLeg1Input {
  mode: 'transport' | 'bus';
  transporter?: string;
  lr?: string;
  busNo?: string;
  driver?: string;
  driverMobile?: string;
  photoRef?: string;
  freightTerms: 'prepaid' | 'to_pay';
  freightAmountPaise: number;
}
// API-075.
export function postDispatch(
  accessToken: string,
  poId: string,
  input: DispatchLeg1Input,
  idempotencyKey: string,
): Promise<{ dispatched: true }> {
  return apiFetch(`/seller/orders/${poId}/dispatch`, {
    method: 'POST',
    accessToken,
    body: input,
    idempotencyKey,
  });
}

// API-076.
export function postExtensionRequest(
  accessToken: string,
  poId: string,
  reason: string,
): Promise<{ requested: true }> {
  return apiFetch(`/seller/orders/${poId}/extension-request`, {
    method: 'POST',
    accessToken,
    body: { reason },
  });
}

// API-073 — BR-192, an accelerator, not a requirement.
export function postConfirmReceipt(accessToken: string, soId: string): Promise<{ closed: true }> {
  return apiFetch(`/orders/${soId}/confirm-receipt`, { method: 'POST', accessToken, body: {} });
}

export const COMPLAINT_CATEGORIES = [
  'transit_damage',
  'hidden_defect_sealed_case',
  'wrong_declared_by_seller',
  'wrong_missed_by_dock',
  'short_count_on_arrival',
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

// API-074.
export function postComplaint(
  accessToken: string,
  soId: string,
  input: { category: ComplaintCategory; note?: string },
): Promise<{ complaintId: string }> {
  return apiFetch(`/orders/${soId}/complaints`, { method: 'POST', accessToken, body: input });
}
export function getComplaints(
  accessToken: string,
  soId: string,
): Promise<Array<{ complaintId: string; category: ComplaintCategory; state: string }>> {
  return apiFetch(`/orders/${soId}/complaints`, { accessToken });
}

export interface OrderDocumentDto {
  kind: 'invoice' | 'eway_bill' | 'lr' | 'dispatch_photo';
  available: boolean;
  ref?: string;
}
// API-077.
export function getDocuments(accessToken: string, soId: string): Promise<OrderDocumentDto[]> {
  return apiFetch(`/orders/${soId}/documents`, { accessToken });
}

export interface BuyerRefundDto {
  refundId: string;
  amountPaise: number;
  reasonCode: string;
  state: string;
  createdAt: string;
}
// New — 👤B, see trifid-serverapp orders.service.ts's own comment on why
// this exists outside the numbered contract.
export function getMyRefunds(accessToken: string): Promise<BuyerRefundDto[]> {
  return apiFetch('/me/refunds', { accessToken });
}
