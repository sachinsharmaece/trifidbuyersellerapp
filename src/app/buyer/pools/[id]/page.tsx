'use client';

import { use, useState } from 'react';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { Clock } from '../../../../components/Clock';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Input, Select } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { formatRupees } from '../../../../lib/format';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../../lib/idempotency';
import {
  getPool,
  postCommit,
  postReconfirm,
  postWithdraw,
  type PoolDetailDto,
} from '../../../../lib/poolApi';
import { getMyDeliveryLocations, type DeliveryLocation } from '../../../../lib/listingApi';
import { ApiError } from '../../../../lib/apiErrors';

function PoolContent({ poolId }: { poolId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [qty, setQty] = useState('');
  const [locationId, setLocationId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { state, retry } = useAsyncData<[PoolDetailDto, DeliveryLocation[]]>(
    () =>
      Promise.all([
        callApi((token) => getPool(token, poolId)),
        callApi((token) => getMyDeliveryLocations(token)),
      ]),
    () => false,
    [poolId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {([pool, locations]) => (
        <Card>
          <p className="mb-3 text-sm text-slate-700">
            {t('pool_progress', { committed: pool.bindingQty, moq: pool.moq })}
          </p>
          {pool.myRatePaise !== undefined && (
            <div className="mb-3 rounded-md border border-slate-200 p-3">
              <div className="text-xs text-slate-500">{t('pool_your_rate')}</div>
              <div className="text-xl font-bold text-slate-900">
                {formatRupees(pool.myRatePaise)}
              </div>
              <div className="text-xs text-slate-400">{t('rate_includes_gst')}</div>
            </div>
          )}

          {pool.status === 'triggered' && pool.payDeadline && (
            <Note tone="urgent">
              {t('pool_triggered')} <Clock targetIso={pool.payDeadline} />
            </Note>
          )}

          {pool.myCommitment ? (
            <div className="mt-3">
              {!pool.myCommitment.isBinding && pool.status === 'reconfirm' && (
                <div className="flex flex-col gap-3">
                  <Note tone="wait">{t('pool_reconfirm_needed')}</Note>
                  <p className="text-sm text-slate-500">{t('pool_binding_notice')}</p>
                  <div className="flex gap-3">
                    <Button
                      fullWidth
                      onClick={() =>
                        void callApi((token) => postReconfirm(token, poolId)).then(retry)
                      }
                    >
                      {t('pool_reconfirm')}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void callApi((token) => postWithdraw(token, poolId)).then(retry)
                      }
                    >
                      {t('pool_withdraw')}
                    </Button>
                  </div>
                </div>
              )}
              {!pool.myCommitment.isBinding && pool.status === 'open' && (
                <Button
                  variant="secondary"
                  onClick={() => void callApi((token) => postWithdraw(token, poolId)).then(retry)}
                >
                  {t('pool_withdraw')}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {locations.length === 0 ? (
                <Note tone="urgent">{t('buy_no_locations')}</Note>
              ) : (
                <>
                  <Input
                    label={t('buy_qty_label')}
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
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
                  {error && <Note tone="urgent">{error}</Note>}
                  <Button
                    fullWidth
                    onClick={() => {
                      const qtyNum = Number(qty);
                      if (!qtyNum || !locationId) return;
                      setError(null);
                      callApi((token) =>
                        postCommit(
                          token,
                          poolId,
                          { qty: qtyNum, deliveryLocationId: locationId },
                          newIdempotencyKey(),
                        ),
                      )
                        .then(retry)
                        .catch((err: unknown) =>
                          setError(err instanceof ApiError ? err.message : 'Something went wrong.'),
                        );
                    }}
                  >
                    {t('pool_join')}
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      )}
    </AsyncBoundary>
  );
}

export default function PoolPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('pools_title')}</h1>
          <LocaleToggle />
        </header>
        <PoolContent poolId={id} />
      </main>
    </Gate>
  );
}
