import { describe, expect, it } from 'vitest';
import { routeForMe } from '../src/lib/routeForMe';
import type { MeResponse } from '../src/lib/dto';

function me(overrides: Partial<MeResponse>): MeResponse {
  return {
    actorType: 'counterparty',
    counterpartyId: 'c1',
    mobile: '9876543210',
    kind: 'buyer',
    status: 'active',
    ...overrides,
  } as MeResponse;
}

describe('routeForMe (ST-10 gate)', () => {
  it('sends a pending buyer to the gate, never the buyer home', () => {
    expect(routeForMe(me({ kind: 'buyer', status: 'pending' }))).toBe('/pending');
  });

  it('sends a rejected seller to the gate', () => {
    expect(routeForMe(me({ kind: 'seller', status: 'rejected' }))).toBe('/pending');
  });

  it('sends a blacklisted counterparty to the gate', () => {
    expect(routeForMe(me({ kind: 'both', status: 'blacklisted' }))).toBe('/pending');
  });

  it('sends an active buyer to the buyer home', () => {
    expect(routeForMe(me({ kind: 'buyer', status: 'active' }))).toBe('/buyer');
  });

  it('sends an active seller to the seller home', () => {
    expect(routeForMe(me({ kind: 'seller', status: 'active' }))).toBe('/seller');
  });

  it('defaults an active both-kind firm to the buyer home', () => {
    expect(routeForMe(me({ kind: 'both', status: 'active' }))).toBe('/buyer');
  });
});
