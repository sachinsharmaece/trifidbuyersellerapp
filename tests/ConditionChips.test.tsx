import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConditionChips } from '../src/components/ConditionChips';
import { RateBlock } from '../src/components/RateBlock';
import { useLocale } from '../src/providers/LocaleProvider';
import { translate } from '../src/lib/i18n';
import type { DictionaryKey } from '../src/lib/i18n';

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
 * BR-101 — every rendered rate carries all four condition-set tags. This is
 * the condition-set sweep the M5 brief asks for: no permutation of the four
 * fields should ever render with a tag missing.
 */
describe('ConditionChips — the condition-set sweep', () => {
  const permutations = [
    { expiryBand: 'under12', moqBand: 'up25', deliveryBand: '48h', provenance: 'auth' },
    { expiryBand: 'over12', moqBand: 'up25', deliveryBand: '2-5d', provenance: 'company' },
    { expiryBand: 'under12', moqBand: 'up100', deliveryBand: '2-5d', provenance: 'auth' },
    { expiryBand: 'over12', moqBand: 'up100', deliveryBand: '48h', provenance: 'company' },
  ];

  it.each(permutations)('renders all four tags for %o', (conditions) => {
    setUpLocale();
    const { container } = render(<ConditionChips conditions={conditions} />);
    const pills = container.querySelectorAll('.pill');
    // Four required tags — a fifth only appears when expiryExact is set.
    expect(pills.length).toBe(4);
  });

  it('adds a fifth, positive-toned pill only once expiryExact is confirmed (IC-01/BR-102)', () => {
    setUpLocale();
    const { container, rerender } = render(
      <ConditionChips
        conditions={{
          expiryBand: 'over12',
          moqBand: 'up25',
          deliveryBand: '48h',
          provenance: 'auth',
        }}
      />,
    );
    expect(container.querySelectorAll('.pill').length).toBe(4);

    rerender(
      <ConditionChips
        conditions={{
          expiryBand: 'over12',
          moqBand: 'up25',
          deliveryBand: '48h',
          provenance: 'auth',
          expiryExact: '06/2028',
        }}
      />,
    );
    expect(container.querySelectorAll('.pill').length).toBe(5);
    expect(screen.getByText(/06\/2028/)).toBeInTheDocument();
  });
});

describe('RateBlock — a rate never renders without its conditions', () => {
  it('always renders the rate and all four condition tags together', () => {
    setUpLocale();
    render(
      <RateBlock
        ratePaise={41400}
        conditions={{
          expiryBand: 'over12',
          moqBand: 'up25',
          deliveryBand: '48h',
          provenance: 'auth',
        }}
      />,
    );
    expect(screen.getByText('₹414')).toBeInTheDocument();
    expect(document.querySelectorAll('.pill').length).toBe(4);
  });
});
