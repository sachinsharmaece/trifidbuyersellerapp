'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Pill } from '../../../components/Pill';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getDemandBoard, type DemandBoardItem } from '../../../lib/demandApi';

function DemandContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<DemandBoardItem[]>(
    () => callApi((token) => getDemandBoard(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(asks) => (
        <div>
          {asks.map((ask) => (
            <div key={ask.askId} className="card">
              {ask.headStart && <Pill tone="good">{t('demand_head_start')}</Pill>}
              <div>{t('demand_qty_needed', { qty: ask.qty })}</div>
              <Link href={`/seller/quote/${ask.askId}`}>
                <button type="button">{t('quote_form_title')}</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function DemandBoardPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('demand_board_title')}</h1>
          <LocaleToggle />
        </header>
        <DemandContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
