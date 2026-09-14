'use client';

import { use } from 'react';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../../components/AsyncBoundary';
import { Pill } from '../../../../../components/Pill';
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
          <p className="hint">{t('position_suppressed')}</p>
        ) : (
          <div>
            <Pill
              tone={card.gapBand === 'ahead' ? 'good' : card.gapBand === 'behind' ? 'bad' : 'warn'}
            >
              {t(
                card.gapBand === 'ahead'
                  ? 'position_ahead'
                  : card.gapBand === 'behind'
                    ? 'position_behind'
                    : 'position_competitive',
              )}
            </Pill>
            <p className="hint">
              #{card.rank} / {card.ofCount}
            </p>
            {card.band && (
              <p className="hint">
                {formatRupees(card.band.lowPaise)} – {formatRupees(card.band.highPaise)} (
                {card.band.listingCount})
              </p>
            )}
          </div>
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
      <main>
        <header className="page-header">
          <h1>{t('position_card_title')}</h1>
          <LocaleToggle />
        </header>
        <PositionContent lineId={id} />
      </main>
    </Gate>
  );
}
