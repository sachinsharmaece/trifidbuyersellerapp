'use client';

import { useLocale } from '../../providers/LocaleProvider';
import { LocaleToggle } from '../../components/LocaleToggle';

/**
 * MASTER_PLAN.md §M2/§M3 — an unknown mobile lands here rather than on the
 * OTP screen. Full registration content (the five-step buyer form, the
 * four-step seller form) is M3 and explicitly out of scope this session.
 */
export default function RegisterPlaceholderPage() {
  const { t } = useLocale();

  return (
    <main className="auth-page">
      <LocaleToggle />
      <h1>{t('registration_coming_title')}</h1>
      <p>{t('registration_coming_body')}</p>
    </main>
  );
}
