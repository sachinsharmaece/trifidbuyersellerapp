import { describe, expect, it } from 'vitest';
import { dictionary, translate } from '../src/lib/i18n';

/**
 * The Hindi pass this M5 brief asks for: every dictionary entry has a real,
 * non-empty Hindi string — not the English string duplicated, not a blank
 * placeholder. A future PR adding an English-only key fails this test
 * immediately rather than shipping a silently-untranslated screen.
 */
describe('i18n — Hindi parity sweep', () => {
  it('every key has a non-empty English and Hindi string', () => {
    const missing: string[] = [];
    for (const [key, [en, hi]] of Object.entries(dictionary)) {
      if (!en || !en.trim()) missing.push(`${key} (en)`);
      if (!hi || !hi.trim()) missing.push(`${key} (hi)`);
    }
    expect(missing).toEqual([]);
  });

  it('no Hindi string is byte-identical to its English pair (a copy-paste tell)', () => {
    const suspicious: string[] = [];
    for (const [key, [en, hi]] of Object.entries(dictionary)) {
      // `app_name` genuinely has a transliterated Hindi form, so it is
      // exempt; anything else matching verbatim is almost certainly an
      // untranslated placeholder rather than a deliberate loanword.
      if (key === 'app_name') continue;
      if (en === hi) suspicious.push(key);
    }
    expect(suspicious).toEqual([]);
  });

  it('translate() interpolates {placeholder} tokens in both locales', () => {
    expect(translate('en', 'step_of', { current: 2, total: 5 })).toBe('Step 2 of 5');
    expect(translate('hi', 'step_of', { current: 2, total: 5 })).toBe('चरण 2 / 5');
    expect(translate('en', 'feed_offers_count', { count: 3 })).toBe('3 offers');
  });
});
