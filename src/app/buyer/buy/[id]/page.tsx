'use client';

import { use, useState } from 'react';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { RateBlock } from '../../../../components/RateBlock';
import { GestureConfirmButton } from '../../../../components/GestureConfirmButton';
import { Note } from '../../../../components/Note';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../../lib/idempotency';
import {
  getListingLineForBuy,
  getMyDeliveryLocations,
  postInquire,
  type BuyScreenDto,
  type DeliveryLocation,
} from '../../../../lib/listingApi';
import { ApiError } from '../../../../lib/apiErrors';

function BuyForm({ lineId }: { lineId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [qty, setQty] = useState('');
  const [locationId, setLocationId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { state, retry } = useAsyncData<[BuyScreenDto, DeliveryLocation[]]>(
    () =>
      Promise.all([
        callApi((token) => getListingLineForBuy(token, lineId)),
        callApi((token) => getMyDeliveryLocations(token)),
      ]),
    () => false,
    [lineId],
  );

  if (done) {
    return (
      <div className="card">
        <h2>{t('buy_requested_title')}</h2>
        <p>{t('buy_requested_body')}</p>
      </div>
    );
  }

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {([line, locations]) => (
        <div>
          <RateBlock ratePaise={line.ratePaise} conditions={line.conditions} />
          <p className="hint">{t('buy_moq_hint', { moq: line.moqExact })}</p>

          <label>
            {t('buy_qty_label')}
            <input
              type="number"
              min={line.moqExact}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>

          {locations.length === 0 ? (
            <Note tone="urgent">{t('buy_no_locations')}</Note>
          ) : (
            <label>
              {t('buy_delivery_location')}
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">{t('pick_choose')}</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && <Note tone="urgent">{error}</Note>}

          <GestureConfirmButton
            label={t('buy_submit')}
            disabled={locations.length === 0}
            onConfirm={() => {
              const qtyNum = Number(qty);
              if (!qtyNum || qtyNum < line.moqExact) {
                setError(t('buy_below_moq'));
                return;
              }
              if (!locationId) return;
              setError(null);
              callApi((token) =>
                postInquire(
                  token,
                  lineId,
                  { qty: qtyNum, deliveryLocationId: locationId },
                  newIdempotencyKey(),
                ),
              )
                .then(() => setDone(true))
                .catch((err: unknown) => {
                  setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                });
            }}
          />
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function BuyPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('buy_title')}</h1>
          <LocaleToggle />
        </header>
        <BuyForm lineId={id} />
      </main>
    </Gate>
  );
}
