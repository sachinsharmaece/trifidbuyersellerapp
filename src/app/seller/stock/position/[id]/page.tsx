'use client';

import { use } from 'react';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../../components/AsyncBoundary';
import { DevNote } from '../../../../../components/dev/DevNote';
import { Pill } from '../../../../../components/Pill';
import { Card } from '../../../../../components/ui/Card';
import { formatRupees } from '../../../../../lib/format';
import { useLocale } from '../../../../../providers/LocaleProvider';
import { useSession } from '../../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../../lib/useAsyncData';
import { getPositionCard, type PositionCardDto } from '../../../../../lib/listingApi';

function PositionContent({ lineId }: { lineId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<PositionCardDto>(
    () => callApi((token) => getPositionCard(token, lineId)),
    () => false,
    [lineId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {(card) =>
        card.suppressed ? (
          <Card>
            <p className="text-sm text-slate-500">{t('position_suppressed')}</p>
          </Card>
        ) : (
          <Card>
            <div className="mb-2">
              <Pill
                tone={
                  card.gapBand === 'ahead' ? 'good' : card.gapBand === 'behind' ? 'bad' : 'warn'
                }
              >
                {t(
                  card.gapBand === 'ahead'
                    ? 'position_ahead'
                    : card.gapBand === 'behind'
                      ? 'position_behind'
                      : 'position_competitive',
                )}
              </Pill>
            </div>
            <p className="mb-1 text-sm text-slate-500">
              #{card.rank} / {card.ofCount}
            </p>
            {card.band && (
              <>
                <p className="text-sm text-slate-500">
                  {formatRupees(card.band.lowPaise)} – {formatRupees(card.band.highPaise)} (
                  {card.band.listingCount})
                </p>
                <p className="text-xs text-slate-400">{t('rate_excludes_gst')}</p>
              </>
            )}
          </Card>
        )
      }
    </AsyncBoundary>
  );
}

export default function PositionCardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('position_card_title')}</h1>
          <LocaleToggle />
        </header>
        <DevNote screen="seller_position" />
        <PositionContent lineId={id} />
      </main>
    </Gate>
  );
}
