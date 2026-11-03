import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AskCard } from '../src/components/AskCard';
import { useLocale } from '../src/providers/LocaleProvider';
import { useSession } from '../src/providers/SessionProvider';
import { postAcceptFill } from '../src/lib/demandApi';
import { translate, type DictionaryKey } from '../src/lib/i18n';
import type { MyAskItem } from '../src/lib/demandApi';

vi.mock('../src/providers/LocaleProvider', () => ({ useLocale: vi.fn() }));
vi.mock('../src/providers/SessionProvider', () => ({ useSession: vi.fn() }));
vi.mock('../src/lib/demandApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/lib/demandApi')>()),
  postAcceptFill: vi.fn(),
  postDeclineAsk: vi.fn(),
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
  vi.mocked(postAcceptFill)
    .mockReset()
    .mockResolvedValue({ soIds: ['so1'], filledBoxes: 10, remainingBoxes: 90 });
});

const quote = (quoteId: string, qtyAvailable: number) => ({
  quoteId,
  ratePaiseForIndore: 11500,
  qtyAvailable,
  conditionSet: {},
  daysToIndore: 2,
  status: 'live',
});
const ask = (extra: Partial<MyAskItem> = {}): MyAskItem => ({
  askId: 'a1',
  qty: 100,
  filledQty: 0,
  state: 'quoted',
  ttlAt: '2026-12-01T00:00:00.000Z',
  holdExpiresAt: null,
  quotes: [quote('q1', 10), quote('q2', 90)],
  ...extra,
});

describe('My asks — a short fill leaves the rest open (2 Nov, BR-127)', () => {
  it('says how many boxes are already ordered and how many are still wanted', () => {
    render(<AskCard ask={ask({ qty: 90, filledQty: 10, quotes: [] })} onChanged={vi.fn()} />);
    expect(screen.getByText('10 of 100 boxes ordered — still looking for 90.')).toBeInTheDocument();
  });

  it('a fresh ask shows no progress line', () => {
    render(<AskCard ask={ask({ quotes: [] })} onChanged={vi.fn()} />);
    expect(screen.queryByText(/boxes ordered/)).toBeNull();
  });

  it('offers to keep looking only when the ticked quotes cover fewer boxes than wanted', async () => {
    render(<AskCard ask={ask()} onChanged={vi.fn()} />);
    expect(screen.queryByText(/Keep looking/)).toBeNull(); // Nothing ticked yet.

    const [first, second] = screen.getAllByRole('checkbox');
    fireEvent.click(first!); // The 10-box quote: 90 still wanted.
    const keep = screen.getByLabelText('Keep looking for the other 90 boxes');
    expect(keep).toBeChecked();

    fireEvent.click(second!); // Both ticked: 10 + 90 = 100, nothing left.
    expect(screen.queryByText(/Keep looking/)).toBeNull();
  });

  it('sends keepRemainderOpen true by default, false when he unticks it', async () => {
    const { unmount } = render(<AskCard ask={ask()} onChanged={vi.fn()} />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(postAcceptFill).toHaveBeenCalledTimes(1));
    expect(vi.mocked(postAcceptFill).mock.calls[0]![2]).toMatchObject({
      quoteIds: ['q1'],
      keepRemainderOpen: true,
    });
    unmount();

    render(<AskCard ask={ask()} onChanged={vi.fn()} />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]!);
    fireEvent.click(screen.getByLabelText('Keep looking for the other 90 boxes'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(postAcceptFill).toHaveBeenCalledTimes(2));
    expect(vi.mocked(postAcceptFill).mock.calls[1]![2]).toMatchObject({
      keepRemainderOpen: false,
    });
  });

  it('taking quotes that cover everything sends no such flag', async () => {
    render(<AskCard ask={ask()} onChanged={vi.fn()} />);
    for (const box of screen.getAllByRole('checkbox')) fireEvent.click(box);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(postAcceptFill).toHaveBeenCalled());
    const body = vi.mocked(postAcceptFill).mock.calls[0]![2];
    expect(body.option).toBe('full');
    expect(body).not.toHaveProperty('keepRemainderOpen');
  });
});
