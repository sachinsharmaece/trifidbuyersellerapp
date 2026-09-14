'use client';

import { useLocale } from '../providers/LocaleProvider';

// ARCHITECTURE.md §M2 frontend scope — the EN/हिंदी toggle wired up on every
// screen in this flow, even while the dictionary is still small.
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex gap-1 rounded-md border border-slate-300 p-0.5"
    >
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`rounded px-2.5 py-1 text-xs font-medium ${
          locale === 'en' ? 'bg-brand-500 text-white' : 'text-slate-600'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'hi'}
        onClick={() => setLocale('hi')}
        className={`rounded px-2.5 py-1 text-xs font-medium ${
          locale === 'hi' ? 'bg-brand-500 text-white' : 'text-slate-600'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
