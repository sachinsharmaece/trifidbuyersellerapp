'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../providers/SessionProvider';
import { useLocale } from '../../providers/LocaleProvider';
import { LocaleToggle } from '../../components/LocaleToggle';
import { DevNote } from '../../components/dev/DevNote';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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
      <main className="flex min-h-screen items-center justify-center">
        <Loader label={t('loading')} />
      </main>
    );
  }

  const copy =
    me.status === 'blacklisted'
      ? { title: t('blacklisted_title'), body: t('blacklisted_body') }
      : me.status === 'rejected'
        ? { title: t('rejected_title'), body: t('rejected_body') }
        : { title: t('pending_title'), body: t('pending_body') };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <LocaleToggle />
        </div>
        <h1 className="mb-2 text-lg font-semibold text-slate-900">{copy.title}</h1>
        <p className="mb-6 text-sm text-slate-600">{copy.body}</p>
        <DevNote screen="pending_gate" />
        <Button variant="secondary" fullWidth onClick={() => void logout()}>
          {t('sign_out')}
        </Button>
      </Card>
    </main>
  );
}
