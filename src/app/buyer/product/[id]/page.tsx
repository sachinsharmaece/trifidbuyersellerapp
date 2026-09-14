'use client';

import { use } from 'react';
import Link from 'next/link';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { BuyerNav } from '../../../../components/BuyerNav';
import { RateBlock } from '../../../../components/RateBlock';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
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
              <Link href={`/buyer/buy/${offer.listingLineId}`}>
                <Button fullWidth className="mt-3">
                  {t('buy_title')}
                </Button>
              </Link>
            </Card>
          ))}
          <Link href="/buyer/ask" className="text-center text-sm text-brand-600 underline">
            {t('buy_wait_with_others')}
          </Link>
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
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('product_title')}</h1>
          <LocaleToggle />
        </header>
        <OffersContent productId={id} />
        <BuyerNav />
      </main>
    </Gate>
  );
}
