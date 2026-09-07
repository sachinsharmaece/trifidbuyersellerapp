import { apiFetch } from './apiClient';

export interface BankDetailInput {
  accountNumber: string;
  ifsc: string;
  accountName: string;
}

export interface ConsentInput {
  noticeVersion: string;
  marketingOptIn: boolean;
}

export interface RegisterBuyerInput {
  mobile: string;
  firm: string;
  gstin: string;
  ownerName: string;
  licenceNo: string;
  gstPpobAddress: string;
  bankDetail: BankDetailInput;
  consent: ConsentInput;
}

// API-010. Dealership declaration (BR-244) is not sent from here — there is
// no public endpoint that lists manufacturers for an unauthenticated
// registrant to pick from (GET /admin/manufacturers is staff-only), so this
// session leaves it uncaptured rather than sending an unverifiable free-text
// manufacturer name. See QUESTION_REGISTER.md for the new question raised.
export function registerBuyer(input: RegisterBuyerInput): Promise<{ registrationId: string }> {
  return apiFetch('/registrations/buyer', { method: 'POST', body: input });
}

export interface SellerReferenceInput {
  firm: string;
  phone: string;
  relationship: string;
  whatTheySaid: string;
}

export interface RegisterSellerInput {
  mobile: string;
  firm: string;
  gstin: string;
  ownerName: string;
  licenceNo: string;
  references: SellerReferenceInput[];
  bankDetail: BankDetailInput;
  consent: ConsentInput;
}

// API-011
export function registerSeller(input: RegisterSellerInput): Promise<{ registrationId: string }> {
  return apiFetch('/registrations/seller', { method: 'POST', body: input });
}
