'use client';

import { use, useState } from 'react';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { ProgressLadder } from '../../../../components/ProgressLadder';
import { Note } from '../../../../components/Note';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../../lib/idempotency';
import {
  getMySellerOrder,
  postDispatch,
  postExtensionRequest,
  type SellerPoDto,
  type DispatchLeg1Input,
} from '../../../../lib/ordersApi';
import { ApiError } from '../../../../lib/apiErrors';

function DispatchForm({ poId, onDone }: { poId: string; onDone: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [mode, setMode] = useState<'transport' | 'bus'>('bus');
  const [transporter, setTransporter] = useState('');
  const [lr, setLr] = useState('');
  const [busNo, setBusNo] = useState('');
  const [driver, setDriver] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [photoRef, setPhotoRef] = useState('');
  const [freightTerms, setFreightTerms] = useState<'prepaid' | 'to_pay'>('to_pay');
  const [freightAmountPaise, setFreightAmountPaise] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="card">
      <h2>{t('movement_title')}</h2>
      <Note tone="wait">{t('movement_blind_notice')}</Note>
      <label>
        {t('movement_mode')}
        <select value={mode} onChange={(e) => setMode(e.target.value as 'transport' | 'bus')}>
          <option value="bus">{t('movement_mode_bus')}</option>
          <option value="transport">{t('movement_mode_transport')}</option>
        </select>
      </label>
      {mode === 'transport' ? (
        <>
          <label>
            {t('movement_transporter')}
            <input
              type="text"
              value={transporter}
              onChange={(e) => setTransporter(e.target.value)}
            />
          </label>
          <label>
            {t('movement_lr')}
            <input type="text" value={lr} onChange={(e) => setLr(e.target.value)} />
          </label>
        </>
      ) : (
        <>
          <label>
            {t('movement_bus_no')}
            <input type="text" value={busNo} onChange={(e) => setBusNo(e.target.value)} />
          </label>
          <label>
            {t('movement_driver')}
            <input type="text" value={driver} onChange={(e) => setDriver(e.target.value)} />
          </label>
          <label>
            {t('movement_driver_mobile')}
            <input
              type="text"
              value={driverMobile}
              onChange={(e) => setDriverMobile(e.target.value)}
            />
          </label>
          <label>
            {t('movement_photo')}
            <input type="text" value={photoRef} onChange={(e) => setPhotoRef(e.target.value)} />
          </label>
        </>
      )}
      <label>
        {t('movement_freight_terms')}
        <select
          value={freightTerms}
          onChange={(e) => setFreightTerms(e.target.value as 'prepaid' | 'to_pay')}
        >
          <option value="to_pay">{t('movement_freight_to_pay')}</option>
          <option value="prepaid">{t('movement_freight_prepaid')}</option>
        </select>
      </label>
      <label>
        {t('movement_freight_amount')}
        <input
          type="number"
          min={0}
          value={freightAmountPaise}
          onChange={(e) => setFreightAmountPaise(e.target.value)}
        />
      </label>

      {error && <Note tone="urgent">{error}</Note>}

      <button
        type="button"
        disabled={submitting}
        onClick={() => {
          setSubmitting(true);
          setError(null);
          const input: DispatchLeg1Input = {
            mode,
            transporter: mode === 'transport' ? transporter : undefined,
            lr: mode === 'transport' ? lr : undefined,
            busNo: mode === 'bus' ? busNo : undefined,
            driver: mode === 'bus' ? driver : undefined,
            driverMobile: mode === 'bus' ? driverMobile : undefined,
            photoRef: mode === 'bus' ? photoRef : undefined,
            freightTerms,
            freightAmountPaise: Number(freightAmountPaise) || 0,
          };
          callApi((token) => postDispatch(token, poId, input, newIdempotencyKey()))
            .then(onDone)
            .catch((err: unknown) => {
              setError(err instanceof ApiError ? err.message : 'Something went wrong.');
              setSubmitting(false);
            });
        }}
      >
        {t('movement_submit')}
      </button>
    </div>
  );
}

function ExtensionForm({ poId, onDone }: { poId: string; onDone: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return <Note tone="wait">{t('extension_requested_note')}</Note>;

  return (
    <div className="card">
      <h2>{t('extension_request_title')}</h2>
      <label>
        {t('extension_reason_label')}
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={!reason}
        onClick={() =>
          void callApi((token) => postExtensionRequest(token, poId, reason)).then(() => {
            setSent(true);
            onDone();
          })
        }
      >
        {t('extension_submit')}
      </button>
    </div>
  );
}

function OrderContent({ poId }: { poId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<SellerPoDto>(
    () => callApi((token) => getMySellerOrder(token, poId)),
    () => false,
    [poId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {(order) => (
        <div>
          <h2>{order.poNo}</h2>
          <ProgressLadder rung={order.rung} />
          {order.leg1 && (
            <p className="hint">
              {t('rung_leg1_dispatch')}: {order.leg1.mode}
            </p>
          )}
          {order.leg2Dispatched && <p className="hint">{t('rung_leg2_dispatch')}</p>}

          {order.canDispatchLeg1 && <DispatchForm poId={poId} onDone={retry} />}
          {order.canRequestExtension && <ExtensionForm poId={poId} onDone={retry} />}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function SellerOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <OrderContent poId={id} />
      </main>
    </Gate>
  );
}
