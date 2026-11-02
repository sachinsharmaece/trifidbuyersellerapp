import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { AddedToOpenAskNote } from '../src/components/AddedToOpenAskNote';
import { useLocale } from '../src/providers/LocaleProvider';
import { translate, type DictionaryKey } from '../src/lib/i18n';

vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../src/providers/LocaleProvider', () => ({ useLocale: vi.fn() }));

function setUp(query: string) {
  vi.mocked(useLocale).mockReturnValue({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: DictionaryKey, vars?: Record<string, string | number>) => translate('en', key, vars),
  });
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(query) as never);
}

describe('My asks — an ask added to one he already had open (30 Oct, BR-371)', () => {
  it('says so, with the boxes on it now', () => {
    setUp('added=10');
    render(<AddedToOpenAskNote />);
    expect(
      screen.getByText('Added to your open ask for this pack — 10 boxes now.'),
    ).toBeInTheDocument();
  });

  it('shows nothing after a new ask', () => {
    setUp('');
    const { container } = render(<AddedToOpenAskNote />);
    expect(container).toBeEmptyDOMElement();
  });
});
