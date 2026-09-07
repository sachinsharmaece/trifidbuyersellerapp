'use client';

import { useLocale } from '../providers/LocaleProvider';

// ARCHITECTURE.md §M2 frontend scope — the EN/हिंदी toggle wired up on every
// screen in this flow, even while the dictionary is still small.
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="locale-toggle" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        className={
          locale === 'en'
            ? 'locale-toggle__option locale-toggle__option--active'
            : 'locale-toggle__option'
        }
        onClick={() => setLocale('en')}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'hi'}
        className={
          locale === 'hi'
            ? 'locale-toggle__option locale-toggle__option--active'
            : 'locale-toggle__option'
        }
        onClick={() => setLocale('hi')}
      >
        हिंदी
      </button>
    </div>
  );
}
