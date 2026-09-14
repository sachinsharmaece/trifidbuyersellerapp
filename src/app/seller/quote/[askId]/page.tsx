'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Input, Select } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { postQuote, type PostQuoteInput } from '../../../../lib/demandApi';
import { ApiError } from '../../../../lib/apiErrors';

export default function QuoteFormPage(props: { params: Promise<{ askId: string }> }) {
  const { askId } = use(props.params);
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();

  const [ratePaise, setRatePaise] = useState('');
  const [qtyAvailable, setQtyAvailable] = useState('');
  const [expiryBand, setExpiryBand] = useState<'under12' | 'over12'>('over12');
  const [expiryExact, setExpiryExact] = useState('');
  const [provenance, setProvenance] = useState<'auth' | 'company'>('auth');
  const [batch, setBatch] = useState('');
  const [daysToIndore, setDaysToIndore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryBand = provenance === 'auth' ? '48h' : '2-5d';

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('quote_form_title')}</h1>
          <LocaleToggle />
        </header>

        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label={t('quote_rate_label')}
              type="number"
              value={ratePaise}
              onChange={(e) => setRatePaise(e.target.value)}
            />
            <Input
              label={t('quote_qty_available')}
              type="number"
              min={1}
              value={qtyAvailable}
              onChange={(e) => setQtyAvailable(e.target.value)}
            />
            <Select
              label={t('quote_expiry_band')}
              value={expiryBand}
              onChange={(e) => setExpiryBand(e.target.value as 'under12' | 'over12')}
            >
              <option value="over12">{t('cond_expiry_over12')}</option>
              <option value="under12">{t('cond_expiry_under12')}</option>
            </Select>
            <Input
              label={t('quote_expiry_exact')}
              placeholder="MM/YYYY"
              value={expiryExact}
              onChange={(e) => setExpiryExact(e.target.value)}
            />
            <Select
              label={t('quote_provenance')}
              value={provenance}
              onChange={(e) => setProvenance(e.target.value as 'auth' | 'company')}
            >
              <option value="auth">{t('cond_provenance_auth')}</option>
              <option value="company">{t('cond_provenance_company')}</option>
            </Select>
            <p className="text-sm text-slate-500">
              {t('quote_delivery_band')}:{' '}
              {t(deliveryBand === '48h' ? 'cond_delivery_48h' : 'cond_delivery_2_5d')}
            </p>
            {provenance === 'auth' && (
              <Input
                label={t('quote_batch')}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            )}
            <Input
              label={t('quote_days_to_indore')}
              type="number"
              min={0}
              value={daysToIndore}
              onChange={(e) => setDaysToIndore(e.target.value)}
            />

            {error && <Note tone="urgent">{error}</Note>}

            <Button
              fullWidth
              loading={submitting}
              icon={<FiSend />}
              onClick={() => {
                const rate = Number(ratePaise);
                const qty = Number(qtyAvailable);
                const days = Number(daysToIndore);
                if (!rate || !qty || !expiryExact) {
                  setError(t('pile_expiry_exact_required'));
                  return;
                }
                if (provenance === 'auth' && !batch) {
                  setError(t('listing_batch_required'));
                  return;
                }
                setSubmitting(true);
                setError(null);
                const input: PostQuoteInput = {
                  ratePaiseForIndore: rate,
                  qtyAvailable: qty,
                  expiryBand,
                  expiryExact,
                  deliveryBand,
                  provenance,
                  batch: provenance === 'auth' ? batch : undefined,
                  daysToIndore: days,
                };
                callApi((token) => postQuote(token, askId, input))
                  .then(() => router.push('/seller/quotes'))
                  .catch((err: unknown) => {
                    setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                    setSubmitting(false);
                  });
              }}
            >
              {t('quote_submit')}
            </Button>
          </div>
        </Card>
      </main>
    </Gate>
  );
}
