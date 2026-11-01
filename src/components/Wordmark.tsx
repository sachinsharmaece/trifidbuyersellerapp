'use client';

import { useLocale } from '../providers/LocaleProvider';

/** The TriFid name and mark, above the card on the screens a visitor sees before signing in. */
export function Wordmark() {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-brand-600">
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-base font-bold text-white"
      >
        T
      </span>
      {t('app_name')}
    </div>
  );
}
