'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { AddedToOpenAskNote } from '../../../components/AddedToOpenAskNote';
import { Gate } from '../../../components/Gate';
import { AppHeader } from '../../../components/AppHeader';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { DevNote } from '../../../components/dev/DevNote';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getMyAsks, type MyAskItem } from '../../../lib/demandApi';
import { AskCard } from '../../../components/AskCard';

function AsksContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<MyAskItem[]>(
    () => callApi((token) => getMyAsks(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(asks) => (
        <div className="flex flex-col gap-3">
          {asks.map((ask) => (
            <AskCard key={ask.askId} ask={ask} onChanged={retry} />
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function MyAsksPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('my_asks_title')} backHref={'/buyer'} />
        <DevNote screen="buyer_my_asks" />
        <Link href="/buyer/ask" className="mb-4 inline-block text-sm text-brand-600 underline">
          {t('ask_raise_title')}
        </Link>
        <Suspense fallback={null}>
          <AddedToOpenAskNote />
        </Suspense>
        <AsksContent />
      </main>
    </Gate>
  );
}
