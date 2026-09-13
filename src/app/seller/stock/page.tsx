'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Pill } from '../../../components/Pill';
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
        <div>
          {lines.map((line) => {
            const pool = pools.find((p) => p.skuId === line.skuId);
            return (
              <div key={line.listingLineId} className="card">
                <div className="page-header">
                  <strong>{line.packLabel}</strong>
                  <Pill tone={line.state === 'live' ? 'good' : 'neutral'}>{line.state}</Pill>
                </div>
                <div>{formatRupees(line.ratePaise)}</div>
                <div className="hint">{t('stock_days_left', { days: line.daysRemaining })}</div>
                {pool && (
                  <p className="hint">
                    {t('pool_progress', { committed: pool.bindingQty, moq: pool.moq })}
                  </p>
                )}
                <div className="btnrow">
                  <Link href={`/seller/stock/position/${line.listingLineId}`}>
                    <button type="button">{t('position_card_title')}</button>
                  </Link>
                  <Link href={`/seller/stock/rate/${line.listingLineId}`}>
                    <button type="button">{t('rate_change_title')}</button>
                  </Link>
                  {line.state === 'live' ? (
                    <button
                      type="button"
                      onClick={() =>
                        void callApi((token) => postPauseListing(token, line.listingId)).then(retry)
                      }
                    >
                      {t('stock_pause')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        void callApi((token) => postRelistListing(token, line.listingId)).then(
                          retry,
                        )
                      }
                    >
                      {t('stock_relist')}
                    </button>
                  )}
                </div>
              </div>
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
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('my_stock_title')}</h1>
          <LocaleToggle />
        </header>
        <p>
          <Link href="/seller/listing/create">{t('create_listing_title')}</Link>
        </p>
        <StockContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
