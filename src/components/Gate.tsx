'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../providers/SessionProvider';
import { useLocale } from '../providers/LocaleProvider';

/**
 * ST-10 — the pending/rejected gate. No rate, listing or order screen is
 * reachable except through here: an anonymous visitor goes to /login, and a
 * signed-in but not-yet-active counterparty goes to /pending and nothing
 * else, whatever URL they typed.
 */
export function Gate({ children }: { children: ReactNode }) {
  const { status, me } = useSession();
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    } else if (status === 'authenticated' && me && me.status !== 'active') {
      router.replace('/pending');
    }
  }, [status, me, router]);

  if (status === 'loading') {
    return (
      <main className="page-state">
        <p>{t('loading')}</p>
      </main>
    );
  }

  if (status !== 'authenticated' || !me || me.status !== 'active') {
    // A redirect is already in flight (see the effect above) — render
    // nothing rather than flashing protected content first.
    return null;
  }

  return <>{children}</>;
}
