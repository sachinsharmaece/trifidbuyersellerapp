'use client';

import { use } from 'react';
import Link from 'next/link';
import { Gate } from '../../../../components/Gate';
import { AppHeader } from '../../../../components/AppHeader';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { DevNote } from '../../../../components/dev/DevNote';
import { RateBlock } from '../../../../components/RateBlock';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { OfferBuyAction } from '../../../../components/OfferBuyAction';
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
        <div className="flex flex-col gap-3">
          {data.pools.length > 0 && (
            <Note tone="wait">
              {t('has_pool')}{' '}
              <Link
                className="font-medium underline"
                href={`/buyer/pools/${data.pools[0]!.poolId}`}
              >
                {t('view')}
              </Link>
            </Note>
          )}
          {data.offers.map((offer) => (
            <Card key={offer.listingLineId}>
              <RateBlock ratePaise={offer.ratePaise} conditions={offer.conditions} />
              <OfferBuyAction listingLineId={offer.listingLineId} closed={offer.closed} />
            </Card>
          ))}
          {/* 29 Oct — a listed product is bought from its offers; an ask is for what is not listed. */}
          {data.offers.length === 0 && (
            <Link href="/buyer/ask" className="text-center text-sm text-brand-600 underline">
              {t('ask_raise_title')}
            </Link>
          )}
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
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('product_title')} backHref={'/buyer'} />
        <DevNote screen="buyer_product" />
        <OffersContent productId={id} />
      </main>
    </Gate>
  );
}
