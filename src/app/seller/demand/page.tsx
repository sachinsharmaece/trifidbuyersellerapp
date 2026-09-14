'use client';

import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Pill } from '../../../components/Pill';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
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
        <div className="flex flex-col gap-3">
          {asks.map((ask) => (
            <Card key={ask.askId}>
              {ask.headStart && (
                <div className="mb-2">
                  <Pill tone="good">{t('demand_head_start')}</Pill>
                </div>
              )}
              <div className="mb-3 text-sm text-slate-700">
                {t('demand_qty_needed', { qty: ask.qty })}
              </div>
              <Link href={`/seller/quote/${ask.askId}`}>
                <Button fullWidth>{t('quote_form_title')}</Button>
              </Link>
            </Card>
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
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('demand_board_title')}</h1>
          <LocaleToggle />
        </header>
        <DemandContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
