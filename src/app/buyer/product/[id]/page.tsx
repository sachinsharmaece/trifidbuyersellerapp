'use client';

import { use } from 'react';
import Link from 'next/link';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { BuyerNav } from '../../../../components/BuyerNav';
import { RateBlock } from '../../../../components/RateBlock';
import { Note } from '../../../../components/Note';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import { getProductOffers, type ProductOffersDto } from '../../../../lib/listingApi';

function OffersContent({ productId }: { productId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<ProductOffersDto>(
    () => callApi((token) => getProductOffers(token, productId)),
    (data) => data.offers.length === 0,
    [productId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(data) => (
        <div>
          {data.pools.length > 0 && (
            <Note tone="wait">
              {t('has_pool')}{' '}
              <Link href={`/buyer/pools/${data.pools[0]!.poolId}`}>{t('view')}</Link>
            </Note>
          )}
          {data.offers.map((offer) => (
            <div key={offer.listingLineId} className="card">
              <RateBlock ratePaise={offer.ratePaise} conditions={offer.conditions} />
              <div className="btnrow">
                <Link href={`/buyer/buy/${offer.listingLineId}`}>
                  <button type="button">{t('buy_title')}</button>
                </Link>
              </div>
            </div>
          ))}
          <p className="hint">
            <Link href="/buyer/ask">{t('buy_wait_with_others')}</Link>
          </p>
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function ProductOffersPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('product_title')}</h1>
          <LocaleToggle />
        </header>
        <OffersContent productId={id} />
        <BuyerNav />
      </main>
    </Gate>
  );
}
