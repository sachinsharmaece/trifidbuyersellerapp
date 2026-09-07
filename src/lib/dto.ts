/**
 * Copied from trifid-serverapp/src/shared/dto/identity.dto.ts (TD-008,
 * API_CONTRACT.md §11.2). Staff fields do not exist on any of these types —
 * this repository never handles a staff session.
 */
export type CounterpartyStatus = 'pending' | 'active' | 'rejected' | 'blacklisted';

export interface BuyerMeDto {
  actorType: 'counterparty';
  counterpartyId: string;
  mobile: string;
  kind: 'buyer';
  status: CounterpartyStatus;
}

export interface SellerMeDto {
  actorType: 'counterparty';
  counterpartyId: string;
  mobile: string;
  kind: 'seller';
  status: CounterpartyStatus;
}

export interface BothMeDto {
  actorType: 'counterparty';
  counterpartyId: string;
  mobile: string;
  kind: 'both';
  status: CounterpartyStatus;
}

export type MeResponse = BuyerMeDto | SellerMeDto | BothMeDto;
