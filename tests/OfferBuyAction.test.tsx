import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferBuyAction } from '../src/components/OfferBuyAction';
import { useLocale } from '../src/providers/LocaleProvider';
import { translate, type DictionaryKey } from '../src/lib/i18n';

vi.mock('../src/providers/LocaleProvider', () => ({ useLocale: vi.fn() }));

function setUp(locale: 'en' | 'hi' = 'en') {
  vi.mocked(useLocale).mockReturnValue({
    locale,
    setLocale: vi.fn(),
    t: (key: DictionaryKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
  });
}

describe('An offer the seller has already answered (2 Nov)', () => {
  it('an open offer keeps its Buy button', () => {
    setUp();
    render(<OfferBuyAction listingLineId="l1" closed={null} />);
    expect(screen.getByRole('link', { name: 'Buy' })).toHaveAttribute('href', '/buyer/buy/l1');
  });

  it.each(['confirmed', 'requoted', 'declined'] as const)(
    'a %s offer says so instead of a button that would be refused',
    (closed) => {
      setUp();
      render(<OfferBuyAction listingLineId="l1" closed={closed} />);
      expect(
        screen.getByText(
          'The seller has already responded to this offer, so it takes no more requests.',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole('link')).toBeNull();
    },
  );

  it('says it in Hindi too', () => {
    setUp('hi');
    render(<OfferBuyAction listingLineId="l1" closed="confirmed" />);
    expect(screen.getByText(/विक्रेता इस ऑफ़र पर पहले ही निर्णय ले चुका है/)).toBeInTheDocument();
  });
});
