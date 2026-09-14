'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { Note } from '../../../../../components/Note';
import { Card } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { useLocale } from '../../../../../providers/LocaleProvider';
import { useSession } from '../../../../../providers/SessionProvider';
import { patchListingLineRate } from '../../../../../lib/listingApi';
import { ApiError } from '../../../../../lib/apiErrors';

type ConfirmStage = 'none' | 'first' | 'second';

export default function RateChangePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();

  const [ratePaise, setRatePaise] = useState('');
  const [confirmStage, setConfirmStage] = useState<ConfirmStage>('none');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function submit(doubleConfirmed: boolean) {
    const rate = Number(ratePaise);
    if (!rate) return;
    setSubmitting(true);
    setError(null);
    callApi((token) => patchListingLineRate(token, id, { ratePaise: rate, doubleConfirmed }))
      .then(() => router.push('/seller/stock'))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === 'DOUBLE_CONFIRM_REQUIRED') {
          setConfirmStage('first');
          setSubmitting(false);
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
        setSubmitting(false);
      });
  }

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('rate_change_title')}</h1>
          <LocaleToggle />
        </header>

        <Card>
          {confirmStage === 'none' && (
            <div className="flex flex-col gap-4">
              <Input
                label={t('rate_change_new_rate')}
                type="number"
                value={ratePaise}
                onChange={(e) => setRatePaise(e.target.value)}
              />
              {error && <Note tone="urgent">{error}</Note>}
              <Button fullWidth loading={submitting} onClick={() => submit(false)}>
                {t('save')}
              </Button>
            </div>
          )}

          {confirmStage === 'first' && (
            <div className="flex flex-col gap-4">
              <Note tone="urgent">{t('rate_change_confirm_1')}</Note>
              <div className="flex gap-3">
                <Button fullWidth onClick={() => setConfirmStage('second')}>
                  {t('confirm')}
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setConfirmStage('none')}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}

          {confirmStage === 'second' && (
            <div className="flex flex-col gap-4">
              <Note tone="urgent">{t('rate_change_confirm_2')}</Note>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  fullWidth
                  loading={submitting}
                  onClick={() => submit(true)}
                >
                  {t('confirm')}
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setConfirmStage('none')}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </Gate>
  );
}
