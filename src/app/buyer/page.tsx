'use client';

import Link from 'next/link';
import { Gate } from '../../components/Gate';
import { AppHeader } from '../../components/AppHeader';
import { AsyncBoundary } from '../../components/AsyncBoundary';
import { DevNote } from '../../components/dev/DevNote';
import { FeedCard } from '../../components/FeedCard';
import { useLocale } from '../../providers/LocaleProvider';
import { useSession } from '../../providers/SessionProvider';
import { useAsyncData } from '../../lib/useAsyncData';
import { getFeed, type BuyerFeedCard } from '../../lib/listingApi';

function FeedContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<BuyerFeedCard[]>(
    () => callApi((token) => getFeed(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(cards) => (
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <Link key={card.productId} href={`/buyer/product/${card.productId}`}>
              <FeedCard card={card} />
            </Link>
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function BuyerPage() {
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('feed_title')} showSignOut />
        <DevNote screen="buyer_feed" />
        <FeedContent />
      </main>
    </Gate>
  );
}
