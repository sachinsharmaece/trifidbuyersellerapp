'use client';

import Link from 'next/link';
import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { AsyncBoundary } from '../../components/AsyncBoundary';
import { BuyerNav } from '../../components/BuyerNav';
import { FeedCard } from '../../components/FeedCard';
import { Button } from '../../components/ui/Button';
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
  const { logout } = useSession();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('feed_title')}</h1>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              {t('sign_out')}
            </Button>
          </div>
        </header>
        <FeedContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
