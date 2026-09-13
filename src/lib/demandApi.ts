import { apiFetch } from './apiClient';

// ---------------------------------------------------------------------------
// Buyer side — asks. API-040/041/042/043.
// ---------------------------------------------------------------------------

export interface RaiseAskInput {
  skuId?: string;
  productId?: string;
  allPacks: boolean;
  qty: number;
  conditionRequirement: { expiryBand: string; deliveryBand?: string };
}
export function postAsk(accessToken: string, input: RaiseAskInput): Promise<{ askId: string }> {
  return apiFetch('/asks', { method: 'POST', accessToken, body: input });
}

export interface MyAskQuote {
  quoteId: string;
  ratePaiseForIndore?: number; // This buyer's own tier rate — see BR-060.
  qtyAvailable: number;
  conditionSet: unknown;
  daysToIndore: number;
  status: string;
}
export interface MyAskItem {
  askId: string;
  qty: number;
  state: string;
  ttlAt: string;
  holdExpiresAt: string | null;
  quotes: MyAskQuote[];
}
export function getMyAsks(accessToken: string): Promise<MyAskItem[]> {
  return apiFetch('/asks', { accessToken });
}

export function postAcceptFill(
  accessToken: string,
  askId: string,
  input: { option: 'partial' | 'full'; quoteIds: string[] },
  idempotencyKey: string,
): Promise<{ soIds: string[] }> {
  return apiFetch(`/asks/${askId}/accept`, {
    method: 'POST',
    accessToken,
    body: input,
    idempotencyKey,
  });
}

export function postDeclineAsk(accessToken: string, askId: string): Promise<{ declined: true }> {
  return apiFetch(`/asks/${askId}/decline`, { method: 'POST', accessToken, body: {} });
}

// ---------------------------------------------------------------------------
// Seller side — demand board and quoting. API-044/045/046.
// ---------------------------------------------------------------------------

export interface DemandBoardItem {
  askId: string;
  skuId?: string;
  productId?: string;
  allPacks: boolean;
  qty: number;
  conditionRequirement: unknown;
  headStart: boolean;
  visibleToAllAt: string;
}
export function getDemandBoard(accessToken: string): Promise<DemandBoardItem[]> {
  return apiFetch('/demand', { accessToken });
}

export interface PostQuoteInput {
  ratePaiseForIndore: number;
  qtyAvailable: number;
  expiryBand: string;
  expiryExact: string;
  deliveryBand: string;
  provenance: string;
  batch?: string;
  daysToIndore: number;
}
export function postQuote(
  accessToken: string,
  askId: string,
  input: PostQuoteInput,
): Promise<{ quoteId: string }> {
  return apiFetch(`/asks/${askId}/quotes`, { method: 'POST', accessToken, body: input });
}

export interface MyQuoteItem {
  quoteId: string;
  status: string;
  rank?: number;
  ofCount?: number;
  qtyAvailable: number;
}
export function getMyQuotes(accessToken: string): Promise<MyQuoteItem[]> {
  return apiFetch('/quotes', { accessToken });
}

// ---------------------------------------------------------------------------
// Piles/confirmations — WF-05, API-048/049/050.
// ---------------------------------------------------------------------------

export interface PileQueueItem {
  pileId: string;
  listingLineId: string;
  totalQty: number;
  buyerCount: number;
  requests: Array<{ index: number; boxes: number; time: string }>;
  meetsMoqOnOneTap: boolean;
}
export function getConfirmations(accessToken: string): Promise<PileQueueItem[]> {
  return apiFetch('/confirmations', { accessToken });
}

export function postConfirmPile(
  accessToken: string,
  pileId: string,
  input: { canSendBoxes: number; expiryExact: string; batch?: string },
  idempotencyKey: string,
): Promise<{ pileId: string; undoWindowMs: number }> {
  return apiFetch(`/confirmations/${pileId}/confirm`, {
    method: 'POST',
    accessToken,
    body: input,
    idempotencyKey,
  });
}

// BR-137's undo half — no Idempotency-Key: this is the deliberate cancel of
// an action that has not taken external effect yet.
export function postUndoPileConfirm(
  accessToken: string,
  pileId: string,
): Promise<{ undone: true }> {
  return apiFetch(`/confirmations/${pileId}/undo`, { method: 'POST', accessToken, body: {} });
}

export function postRequotePile(accessToken: string, pileId: string): Promise<{ requoted: true }> {
  return apiFetch(`/confirmations/${pileId}/requote`, { method: 'POST', accessToken, body: {} });
}
export function postDeclinePile(accessToken: string, pileId: string): Promise<{ declined: true }> {
  return apiFetch(`/confirmations/${pileId}/decline`, { method: 'POST', accessToken, body: {} });
}

// ---------------------------------------------------------------------------
// Claim board — BR-140, off by default (config.claim_board). A 404 here
// means the feature is switched off, not a real error — callers should
// treat it as "no claim board" rather than surfacing a server-error screen.
// ---------------------------------------------------------------------------

export interface ClaimBoardItem {
  pileId: string;
  listingLineId: string;
  totalQty: number;
  ratePaise: number;
}
export function getClaimBoard(accessToken: string): Promise<ClaimBoardItem[]> {
  return apiFetch('/claims', { accessToken });
}
export function postClaim(accessToken: string, pileId: string): Promise<{ claimId: string }> {
  return apiFetch(`/claims/${pileId}/claim`, { method: 'POST', accessToken, body: {} });
}
export function postUndoClaim(accessToken: string, claimId: string): Promise<{ undone: true }> {
  return apiFetch(`/claims/${claimId}/undo`, { method: 'POST', accessToken, body: {} });
}
