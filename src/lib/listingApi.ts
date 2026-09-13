import { apiFetch } from './apiClient';

/** Copied from trifid-serverapp/src/modules/listing/listing.service.ts DTOs (API_CONTRACT.md §11.2). */
export interface ConditionTags {
  expiryBand: string;
  moqBand: string;
  deliveryBand: string;
  provenance: string;
  // IC-01/BR-102 — absent until the seller has confirmed supply.
  expiryExact?: string;
}

export interface BuyerFeedCard {
  productId: string;
  brand: string;
  technical: string;
  lowestRatePaise: number;
  conditions: ConditionTags;
  offerCount: number;
}

/**
 * API-030. `apiFetch` unwraps to `data` only (see apiClient.ts) — the
 * server's `nextCursor` travels in `meta`, which is discarded there, so
 * paging here is by page size: a page shorter than `limit` is the last one.
 */
export function getFeed(accessToken: string, cursor = 0, limit = 20): Promise<BuyerFeedCard[]> {
  return apiFetch(`/listings?cursor=${cursor}&limit=${limit}`, { accessToken });
}

export interface BuyerOfferDto {
  listingLineId: string;
  ratePaise: number;
  conditions: ConditionTags;
  hasPool: boolean;
}
export interface ProductOffersDto {
  offers: BuyerOfferDto[];
  pools: Array<{ poolId: string; skuId: string; moq: number; status: string }>;
}
// API-031.
export function getProductOffers(
  accessToken: string,
  productId: string,
): Promise<ProductOffersDto> {
  return apiFetch(`/products/${productId}/offers`, { accessToken });
}

export interface BuyScreenDto {
  listingLineId: string;
  productId: string;
  brand: string;
  packLabel: string;
  baseUnit: string;
  baseUnitsPerBox: number;
  ratePaise: number;
  moqExact: number;
  availableBoxes: number;
  conditions: ConditionTags;
}
// API-032.
export function getListingLineForBuy(
  accessToken: string,
  listingLineId: string,
): Promise<BuyScreenDto> {
  return apiFetch(`/listings/lines/${listingLineId}`, { accessToken });
}

// WF-04 — submits the buy screen.
export function postInquire(
  accessToken: string,
  listingLineId: string,
  input: { qty: number; deliveryLocationId: string },
  idempotencyKey: string,
): Promise<{ pileId: string }> {
  return apiFetch(`/listings/lines/${listingLineId}/inquire`, {
    method: 'POST',
    accessToken,
    body: input,
    idempotencyKey,
  });
}

export interface DeliveryLocation {
  locationId: string;
  label: string;
  address: string;
  isPrimary: boolean;
}
export function getMyDeliveryLocations(accessToken: string): Promise<DeliveryLocation[]> {
  return apiFetch('/me/locations', { accessToken });
}

// ---------------------------------------------------------------------------
// Seller side.
// ---------------------------------------------------------------------------

export interface CreateListingLineInput {
  skuId: string;
  ratePaise: number;
  expiryBand: string;
  expiryExact?: string;
  moqExact?: number;
  deliveryBand: string;
  provenance: string;
  batch?: string;
  qty: number;
}
export interface CreateListingInput {
  productId: string;
  scopeType: 'my_area' | 'all_india' | 'all_except_mine' | 'custom';
  customTehsilIds?: string[];
  lines: CreateListingLineInput[];
}
// API-033.
export function postListing(
  accessToken: string,
  input: CreateListingInput,
): Promise<{ listingId: string; lineIds: string[] }> {
  return apiFetch('/listings', { method: 'POST', accessToken, body: input });
}

export interface MyListingLineItem {
  listingId: string;
  listingLineId: string;
  skuId: string;
  packLabel: string;
  ratePaise: number;
  qty: number;
  expiryBand: string;
  moqBand: string;
  deliveryBand: string;
  provenance: string;
  state: string;
  expiresAt: string;
  daysRemaining: number;
}
// API-034.
export function getMyListings(accessToken: string, state?: string): Promise<MyListingLineItem[]> {
  return apiFetch(`/listings/mine${state ? `?state=${state}` : ''}`, { accessToken });
}

// API-035.
export function patchListingLineRate(
  accessToken: string,
  listingLineId: string,
  input: { ratePaise: number; doubleConfirmed?: boolean },
): Promise<{ heldOutOfBenchmark: boolean }> {
  return apiFetch(`/listings/lines/${listingLineId}/rate`, {
    method: 'PATCH',
    accessToken,
    body: input,
  });
}

// API-036.
export function postPauseListing(
  accessToken: string,
  listingId: string,
): Promise<{ paused: true }> {
  return apiFetch(`/listings/${listingId}/pause`, { method: 'POST', accessToken, body: {} });
}
export function postRelistListing(
  accessToken: string,
  listingId: string,
): Promise<{ relisted: true }> {
  return apiFetch(`/listings/${listingId}/relist`, { method: 'POST', accessToken, body: {} });
}

export interface PositionCardDto {
  rank?: number;
  ofCount?: number;
  gapBand?: 'ahead' | 'competitive' | 'behind';
  band?: { lowPaise: number; highPaise: number; listingCount: number };
  suppressed: boolean;
}
// API-037.
export function getPositionCard(
  accessToken: string,
  listingLineId: string,
): Promise<PositionCardDto> {
  return apiFetch(`/listings/lines/${listingLineId}/position`, { accessToken });
}

// API-038.
export function getBoardOpportunities(
  accessToken: string,
): Promise<Array<{ skuId: string; conditionSetKey: string; sellerCount: number }>> {
  return apiFetch('/board/opportunities', { accessToken });
}
