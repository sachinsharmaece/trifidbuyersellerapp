'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Pill } from '../../../components/Pill';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatRupees } from '../../../lib/format';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import {
  getMyListings,
  postPauseListing,
  postRelistListing,
  type MyListingLineItem,
} from '../../../lib/listingApi';
import { getPoolsForSkus, type PoolSummaryDto } from '../../../lib/poolApi';

function StockContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<[MyListingLineItem[], PoolSummaryDto[]]>(
    () =>
      callApi((token) => getMyListings(token)).then(async (lines) => {
        const skuIds = [...new Set(lines.map((l) => l.skuId))];
        const pools =
          skuIds.length > 0 ? await callApi((token) => getPoolsForSkus(token, skuIds)) : [];
        return [lines, pools] as [MyListingLineItem[], PoolSummaryDto[]];
      }),
    ([lines]) => lines.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {([lines, pools]) => (
        <div className="flex flex-col gap-3">
          {lines.map((line) => {
            const pool = pools.find((p) => p.skuId === line.skuId);
            return (
              <Card key={line.listingLineId}>
                <div className="mb-1 flex items-center justify-between">
                  <strong className="text-slate-900">{line.packLabel}</strong>
                  <Pill tone={line.state === 'live' ? 'good' : 'neutral'}>{line.state}</Pill>
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {formatRupees(line.ratePaise)}
                </div>
                <div className="text-xs text-slate-400">{t('rate_excludes_gst')}</div>
                <div className="mb-2 text-sm text-slate-500">
                  {t('stock_days_left', { days: line.daysRemaining })}
                </div>
                {pool && (
                  <p className="mb-2 text-sm text-slate-500">
                    {t('pool_progress', { committed: pool.bindingQty, moq: pool.moq })}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/seller/stock/position/${line.listingLineId}`}>
                    <Button variant="secondary" size="sm">
                      {t('position_card_title')}
                    </Button>
                  </Link>
                  <Link href={`/seller/stock/rate/${line.listingLineId}`}>
                    <Button variant="secondary" size="sm">
                      {t('rate_change_title')}
                    </Button>
                  </Link>
                  {line.state === 'live' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void callApi((token) => postPauseListing(token, line.listingId)).then(retry)
                      }
                    >
                      {t('stock_pause')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void callApi((token) => postRelistListing(token, line.listingId)).then(
                          retry,
                        )
                      }
                    >
                      {t('stock_relist')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function MyStockPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('my_stock_title')}</h1>
          <LocaleToggle />
        </header>
        <Link
          href="/seller/listing/create"
          className="mb-4 inline-block text-sm text-brand-600 underline"
        >
          {t('create_listing_title')}
        </Link>
        <StockContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
