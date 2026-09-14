'use client';

import { use, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { RateBlock } from '../../../../components/RateBlock';
import { GestureConfirmButton } from '../../../../components/GestureConfirmButton';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Input, Select } from '../../../../components/ui/Input';
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
      <Card className="text-center">
        <FiCheckCircle className="mx-auto mb-2 text-3xl text-success-500" aria-hidden />
        <h2 className="mb-1 text-lg font-semibold text-slate-900">{t('buy_requested_title')}</h2>
        <p className="text-sm text-slate-600">{t('buy_requested_body')}</p>
      </Card>
    );
  }

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {([line, locations]) => (
        <div className="flex flex-col gap-4">
          <RateBlock ratePaise={line.ratePaise} conditions={line.conditions} />
          <p className="text-sm text-slate-500">{t('buy_moq_hint', { moq: line.moqExact })}</p>

          <Input
            label={t('buy_qty_label')}
            type="number"
            min={line.moqExact}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          {locations.length === 0 ? (
            <Note tone="urgent">{t('buy_no_locations')}</Note>
          ) : (
            <Select
              label={t('buy_delivery_location')}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">{t('pick_choose')}</option>
              {locations.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.label}
                </option>
              ))}
            </Select>
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
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('buy_title')}</h1>
          <LocaleToggle />
        </header>
        <BuyForm lineId={id} />
      </main>
    </Gate>
  );
}
