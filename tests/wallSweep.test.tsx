import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FeedCard } from '../src/components/FeedCard';
import { SellerOrderCard } from '../src/components/SellerOrderCard';
import { useLocale } from '../src/providers/LocaleProvider';
import { translate } from '../src/lib/i18n';
import type { DictionaryKey } from '../src/lib/i18n';
import type { BuyerFeedCard } from '../src/lib/listingApi';
import type { SellerPoDto } from '../src/lib/ordersApi';

vi.mock('../src/providers/LocaleProvider', () => ({
  useLocale: vi.fn(),
}));

function setUpLocale() {
  vi.mocked(useLocale).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: DictionaryKey, vars?: Record<string, string | number>) => translate('en', key, vars),
  });
}

/**
 * TD-008/BR-060/BR-138 — the audience-DTO wall, exercised at the render
 * layer this time (the backend side is covered in trifid-serverapp's own
 * test suite). `BuyerFeedCard` and `SellerPoDto` are typed with no seller
 * identity / no buyer identity fields respectively, but TypeScript's
 * structural typing does not strip an extra property a misbehaving backend
 * response might actually send over the wire — so each mock below is cast
 * through `unknown` with a "poisoned" extra field attached, proving the
 * component only ever reads its named fields rather than spreading the
 * object onto the page.
 */
describe('Wall sweep — buyer screens never render a seller identity', () => {
  it('FeedCard ignores an unexpected sellerId/sellerNetPaise on the wire', () => {
    setUpLocale();
    const poisoned = {
      productId: 'p1',
      brand: 'Acme',
      technical: 'Glyphosate',
      lowestRatePaise: 41400,
      conditions: {
        expiryBand: 'over12',
        moqBand: 'up25',
        deliveryBand: '48h',
        provenance: 'auth',
      },
      offerCount: 3,
      // Fields that must never appear on a buyer-facing card (BR-060).
      sellerId: 'SELLER_SECRET_ID',
      sellerNetPaise: 40000,
    } as unknown as BuyerFeedCard;

    const { container } = render(<FeedCard card={poisoned} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('SELLER_SECRET_ID');
    expect(text.toLowerCase()).not.toContain('sellernet');
    expect(text).not.toContain('40000');
  });
});

describe('Wall sweep — seller screens never render a buyer identity (BR-138)', () => {
  it('SellerOrderCard ignores an unexpected buyerId/tehsil/town on the wire', () => {
    setUpLocale();
    const poisoned = {
      poId: 'po1',
      poNo: 'PO-000001',
      rung: 'leg1_dispatch',
      poState: 'dispatched_leg1',
      dispatchDueDate: '2026-01-01',
      promisedOutOfIndoreBy: '2026-01-03',
      hold: false,
      failed: false,
      requoteCount: 0,
      extensionRequestedAt: null,
      leg1: { mode: 'bus', dispatchedAt: '2026-01-01' },
      leg2Dispatched: false,
      canDispatchLeg1: false,
      canRequestExtension: false,
      // Fields that must never appear on a seller-facing order (BR-138).
      buyerId: 'BUYER_SECRET_ID',
      buyerTehsil: 'Dewas',
      deliveryTown: 'Dewas',
    } as unknown as SellerPoDto;

    const { container } = render(<SellerOrderCard order={poisoned} />);
    const text = container.textContent ?? '';
    expect(text).not.toContain('BUYER_SECRET_ID');
    expect(text).not.toContain('Dewas');
    expect(text.toLowerCase()).not.toContain('buyerid');
  });
});
