import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PileOfferCard } from '../src/components/PileOfferCard';
import { useLocale } from '../src/providers/LocaleProvider';
import { useSession } from '../src/providers/SessionProvider';
import { postAcceptPileOffer, postDeclinePileOffer } from '../src/lib/demandApi';
import { translate, type DictionaryKey } from '../src/lib/i18n';
import type { PileOffer } from '../src/lib/demandApi';

vi.mock('../src/providers/LocaleProvider', () => ({ useLocale: vi.fn() }));
vi.mock('../src/providers/SessionProvider', () => ({ useSession: vi.fn() }));
vi.mock('../src/lib/demandApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/demandApi')>()),
  postAcceptPileOffer: vi.fn(),
  postDeclinePileOffer: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useLocale).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: DictionaryKey, vars?: Record<string, string | number>) => translate('en', key, vars),
  });
  vi.mocked(useSession).mockReturnValue({
    callApi: ((fn: (token: string) => unknown) => fn('token')) as never,
  } as never);
  vi.mocked(postAcceptPileOffer).mockReset().mockResolvedValue({ soId: 'so1', boxes: 10 });
  vi.mocked(postDeclinePileOffer).mockReset().mockResolvedValue({ released: true });
});

const offer = (extra: Partial<PileOffer> = {}): PileOffer => ({
  requestId: 'r1',
  brand: 'ashitaka',
  packLabel: '50 GM',
  boxes: 10,
  askedBoxes: 10,
  ratePaise: 12272,
  expiryExact: '2028',
  holdUntil: '2026-11-03T10:00:00.000Z',
  ...extra,
});

describe('A deal the seller confirmed (BR-378)', () => {
  it('shows what he would be taking: the pack, his rate, the boxes, the expiry and that it is held', () => {
    render(<PileOfferCard offer={offer()} onChanged={vi.fn()} />);
    expect(screen.getByText('The seller confirmed — your deal')).toBeInTheDocument();
    expect(screen.getByText('ashitaka · 50 GM')).toBeInTheDocument();
    expect(screen.getByText('₹122.72')).toBeInTheDocument();
    expect(screen.getByText(/10 boxes · Expiry: 2028/)).toBeInTheDocument();
    expect(screen.getByText(/Yours until/)).toBeInTheDocument();
    expect(screen.getByText(/Your payment window starts then/)).toBeInTheDocument();
    expect(screen.queryByText(/You asked for/)).toBeNull();
  });

  it('says so when the seller can send fewer boxes than he asked for', () => {
    render(<PileOfferCard offer={offer({ boxes: 10, askedBoxes: 15 })} onChanged={vi.fn()} />);
    expect(screen.getByText('You asked for 15; the seller can send 10.')).toBeInTheDocument();
  });

  it('Confirm places the order, with an Idempotency-Key, and refreshes', async () => {
    const onChanged = vi.fn();
    render(<PileOfferCard offer={offer()} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(postAcceptPileOffer).toHaveBeenCalledTimes(1));
    const call = vi.mocked(postAcceptPileOffer).mock.calls[0]!;
    expect(call[1]).toBe('r1');
    expect(call[2]).toMatch(/.+/);
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(postDeclinePileOffer).not.toHaveBeenCalled();
  });

  it('"Not now" lets the deal go, and refreshes', async () => {
    const onChanged = vi.fn();
    render(<PileOfferCard offer={offer()} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await waitFor(() => expect(postDeclinePileOffer).toHaveBeenCalledTimes(1));
    expect(vi.mocked(postDeclinePileOffer).mock.calls[0]![1]).toBe('r1');
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(postAcceptPileOffer).not.toHaveBeenCalled();
  });
});
