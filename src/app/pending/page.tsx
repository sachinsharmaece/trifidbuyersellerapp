'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../providers/SessionProvider';
import { useLocale } from '../../providers/LocaleProvider';
import { LocaleToggle } from '../../components/LocaleToggle';

/**
 * ST-10 `pending → active | rejected`. This screen is the entire purpose of
 * `status`: an unapproved or rejected counterparty sees this and nothing
 * else — no rate, listing or order screen is reachable from here.
 */
export default function PendingPage() {
  const { status, me, logout } = useSession();
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    } else if (status === 'authenticated' && me?.status === 'active') {
      router.replace('/');
    }
  }, [status, me, router]);

  if (status !== 'authenticated' || !me) {
    return (
      <main className="page-state">
        <p>{t('loading')}</p>
      </main>
    );
  }

  if (me.status === 'blacklisted') {
    return (
      <main className="auth-page">
        <LocaleToggle />
        <h1>{t('blacklisted_title')}</h1>
        <p>{t('blacklisted_body')}</p>
        <button type="button" onClick={() => void logout()}>
          {t('sign_out')}
        </button>
      </main>
    );
  }

  if (me.status === 'rejected') {
    return (
      <main className="auth-page">
        <LocaleToggle />
        <h1>{t('rejected_title')}</h1>
        <p>{t('rejected_body')}</p>
        <button type="button" onClick={() => void logout()}>
          {t('sign_out')}
        </button>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <LocaleToggle />
      <h1>{t('pending_title')}</h1>
      <p>{t('pending_body')}</p>
      <button type="button" onClick={() => void logout()}>
        {t('sign_out')}
      </button>
    </main>
  );
}
