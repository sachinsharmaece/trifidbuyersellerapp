'use client';

import Link from 'next/link';
import { Gate } from '../../components/Gate';
import { LocaleToggle } from '../../components/LocaleToggle';
import { AsyncBoundary } from '../../components/AsyncBoundary';
import { BuyerNav } from '../../components/BuyerNav';
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
        <div>
          {cards.map((card) => (
            <Link
              key={card.productId}
              href={`/buyer/product/${card.productId}`}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
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
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('feed_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <FeedContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
