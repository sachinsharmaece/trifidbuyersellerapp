'use client';

import { use, useState } from 'react';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { Clock } from '../../../../components/Clock';
import { Note } from '../../../../components/Note';
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
        <div>
          <p>{t('pool_progress', { committed: pool.bindingQty, moq: pool.moq })}</p>
          {pool.myRatePaise !== undefined && (
            <div className="rate-block">
              <div className="rate-block__label">{t('pool_your_rate')}</div>
              <div className="rate-block__rate">{formatRupees(pool.myRatePaise)}</div>
            </div>
          )}

          {pool.status === 'triggered' && pool.payDeadline && (
            <Note tone="urgent">
              {t('pool_triggered')} <Clock targetIso={pool.payDeadline} />
            </Note>
          )}

          {pool.myCommitment ? (
            <div>
              {!pool.myCommitment.isBinding && pool.status === 'reconfirm' && (
                <div>
                  <Note tone="wait">{t('pool_reconfirm_needed')}</Note>
                  <p className="hint">{t('pool_binding_notice')}</p>
                  <div className="btnrow">
                    <button
                      type="button"
                      onClick={() =>
                        void callApi((token) => postReconfirm(token, poolId)).then(retry)
                      }
                    >
                      {t('pool_reconfirm')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void callApi((token) => postWithdraw(token, poolId)).then(retry)
                      }
                    >
                      {t('pool_withdraw')}
                    </button>
                  </div>
                </div>
              )}
              {!pool.myCommitment.isBinding && pool.status === 'open' && (
                <button
                  type="button"
                  onClick={() => void callApi((token) => postWithdraw(token, poolId)).then(retry)}
                >
                  {t('pool_withdraw')}
                </button>
              )}
            </div>
          ) : (
            <div>
              {locations.length === 0 ? (
                <Note tone="urgent">{t('buy_no_locations')}</Note>
              ) : (
                <>
                  <label>
                    {t('buy_qty_label')}
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </label>
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
                  {error && <Note tone="urgent">{error}</Note>}
                  <button
                    type="button"
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
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function PoolPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('pools_title')}</h1>
          <LocaleToggle />
        </header>
        <PoolContent poolId={id} />
      </main>
    </Gate>
  );
}
