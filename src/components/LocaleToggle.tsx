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
      className="inline-flex gap-0.5 rounded-md border border-slate-300 bg-white p-0.5"
    >
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`min-h-8 min-w-9 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
          locale === 'en' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'hi'}
        onClick={() => setLocale('hi')}
        className={`min-h-8 min-w-9 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
          locale === 'hi' ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
