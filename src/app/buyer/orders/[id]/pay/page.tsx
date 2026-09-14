'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../../components/AsyncBoundary';
import { Note } from '../../../../../components/Note';
import { Card } from '../../../../../components/ui/Card';
import { Input, Select } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { formatRupees } from '../../../../../lib/format';
import { useLocale } from '../../../../../providers/LocaleProvider';
import { useSession } from '../../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../../lib/useAsyncData';
import { getMyOrder, type BuyerSoDto } from '../../../../../lib/ordersApi';
import { postPaymentClaim, type PaymentClaimInput } from '../../../../../lib/paymentApi';
import { ApiError } from '../../../../../lib/apiErrors';

function PayForm({ soId }: { soId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentClaimInput['method']>('utr');
  const [utr, setUtr] = useState('');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { state, retry } = useAsyncData<BuyerSoDto>(
    () => callApi((token) => getMyOrder(token, soId)),
    () => false,
    [soId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {(order) => (
        <Card>
          <p className="mb-3 text-lg font-semibold text-slate-900">
            {t('payment_amount_due')}: {formatRupees(order.totalPaise)}
          </p>
          <Note>{t('payment_not_proof_note')}</Note>

          <div className="mt-4 flex flex-col gap-4">
            <Select
              label={t('payment_method')}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentClaimInput['method'])}
            >
              <option value="utr">{t('payment_method_utr')}</option>
              <option value="bank_message">{t('payment_method_bank_message')}</option>
              <option value="screenshot">{t('payment_method_screenshot')}</option>
            </Select>

            {method === 'utr' && (
              <Input
                label={t('payment_method_utr')}
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            )}
            {method === 'bank_message' && (
              <Input
                label={t('payment_method_bank_message')}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            )}

            {error && <Note tone="urgent">{error}</Note>}

            <Button
              fullWidth
              loading={submitting}
              icon={<FiSend />}
              onClick={() => {
                setSubmitting(true);
                setError(null);
                callApi((token) =>
                  postPaymentClaim(token, {
                    amountPaise: order.totalPaise,
                    method,
                    utr: method === 'utr' ? utr : undefined,
                    rawText: method === 'bank_message' ? rawText : undefined,
                  }),
                )
                  .then(() => router.push(`/buyer/orders/${soId}`))
                  .catch((err: unknown) => {
                    setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                    setSubmitting(false);
                  });
              }}
            >
              {t('payment_submit')}
            </Button>
          </div>
        </Card>
      )}
    </AsyncBoundary>
  );
}

export default function PayPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('payment_title')}</h1>
          <LocaleToggle />
        </header>
        <PayForm soId={id} />
      </main>
    </Gate>
  );
}
