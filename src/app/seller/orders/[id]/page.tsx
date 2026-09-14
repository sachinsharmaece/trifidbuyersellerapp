'use client';

import { use, useState } from 'react';
import { FiTruck, FiClock } from 'react-icons/fi';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../components/AsyncBoundary';
import { ProgressLadder } from '../../../../components/ProgressLadder';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Input, Select, Textarea } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
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
    <Card title={t('movement_title')}>
      <Note tone="wait">{t('movement_blind_notice')}</Note>
      <div className="mt-4 flex flex-col gap-4">
        <Select
          label={t('movement_mode')}
          value={mode}
          onChange={(e) => setMode(e.target.value as 'transport' | 'bus')}
        >
          <option value="bus">{t('movement_mode_bus')}</option>
          <option value="transport">{t('movement_mode_transport')}</option>
        </Select>
        {mode === 'transport' ? (
          <>
            <Input
              label={t('movement_transporter')}
              value={transporter}
              onChange={(e) => setTransporter(e.target.value)}
            />
            <Input label={t('movement_lr')} value={lr} onChange={(e) => setLr(e.target.value)} />
          </>
        ) : (
          <>
            <Input
              label={t('movement_bus_no')}
              value={busNo}
              onChange={(e) => setBusNo(e.target.value)}
            />
            <Input
              label={t('movement_driver')}
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
            />
            <Input
              label={t('movement_driver_mobile')}
              value={driverMobile}
              onChange={(e) => setDriverMobile(e.target.value)}
            />
            <Input
              label={t('movement_photo')}
              value={photoRef}
              onChange={(e) => setPhotoRef(e.target.value)}
            />
          </>
        )}
        <Select
          label={t('movement_freight_terms')}
          value={freightTerms}
          onChange={(e) => setFreightTerms(e.target.value as 'prepaid' | 'to_pay')}
        >
          <option value="to_pay">{t('movement_freight_to_pay')}</option>
          <option value="prepaid">{t('movement_freight_prepaid')}</option>
        </Select>
        <Input
          label={t('movement_freight_amount')}
          type="number"
          min={0}
          value={freightAmountPaise}
          onChange={(e) => setFreightAmountPaise(e.target.value)}
        />

        {error && <Note tone="urgent">{error}</Note>}

        <Button
          fullWidth
          loading={submitting}
          icon={<FiTruck />}
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
        </Button>
      </div>
    </Card>
  );
}

function ExtensionForm({ poId, onDone }: { poId: string; onDone: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return <Note tone="wait">{t('extension_requested_note')}</Note>;

  return (
    <Card title={t('extension_request_title')}>
      <div className="flex flex-col gap-4">
        <Textarea
          label={t('extension_reason_label')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          fullWidth
          variant="secondary"
          icon={<FiClock />}
          disabled={!reason}
          onClick={() =>
            void callApi((token) => postExtensionRequest(token, poId, reason)).then(() => {
              setSent(true);
              onDone();
            })
          }
        >
          {t('extension_submit')}
        </Button>
      </div>
    </Card>
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
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">{order.poNo}</h2>
            <ProgressLadder rung={order.rung} />
            {order.leg1 && (
              <p className="mt-3 text-sm text-slate-500">
                {t('rung_leg1_dispatch')}: {order.leg1.mode}
              </p>
            )}
            {order.leg2Dispatched && (
              <p className="mt-1 text-sm text-slate-500">{t('rung_leg2_dispatch')}</p>
            )}
          </Card>

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
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('orders_title')}</h1>
          <LocaleToggle />
        </header>
        <OrderContent poId={id} />
      </main>
    </Gate>
  );
}
