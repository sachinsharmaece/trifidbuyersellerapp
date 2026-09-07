'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../providers/SessionProvider';
import { useLocale } from '../providers/LocaleProvider';
import { routeForMe } from '../lib/routeForMe';

export default function Home() {
  const { status, me } = useSession();
  const { t } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    } else if (status === 'authenticated' && me) {
      router.replace(routeForMe(me));
    }
  }, [status, me, router]);

  return (
    <main className="page-state">
      <p>{t('loading')}</p>
    </main>
  );
}
