'use client';

import { Gate } from '../../../components/Gate';
import { AppHeader } from '../../../components/AppHeader';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { DevNote } from '../../../components/dev/DevNote';
import { Pill } from '../../../components/Pill';
import { Card } from '../../../components/ui/Card';
import { ButtonLink } from '../../../components/ui/Button';
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
              <ButtonLink href={`/seller/quote/${ask.askId}`} fullWidth>
                {t('quote_form_title')}
              </ButtonLink>
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
      <main className="mx-auto max-w-lg p-4 md:max-w-2xl">
        <AppHeader title={t('demand_board_title')} />
        <DevNote screen="seller_demand" />
        <DemandContent />
      </main>
    </Gate>
  );
}
