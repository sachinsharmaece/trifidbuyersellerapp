'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { Note } from '../../../../../components/Note';
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
      <main>
        <header className="page-header">
          <h1>{t('rate_change_title')}</h1>
          <LocaleToggle />
        </header>

        {confirmStage === 'none' && (
          <div>
            <label>
              {t('rate_change_new_rate')}
              <input
                type="number"
                value={ratePaise}
                onChange={(e) => setRatePaise(e.target.value)}
              />
            </label>
            {error && <Note tone="urgent">{error}</Note>}
            <button type="button" disabled={submitting} onClick={() => submit(false)}>
              {t('save')}
            </button>
          </div>
        )}

        {confirmStage === 'first' && (
          <div>
            <Note tone="urgent">{t('rate_change_confirm_1')}</Note>
            <div className="btnrow">
              <button type="button" onClick={() => setConfirmStage('second')}>
                {t('confirm')}
              </button>
              <button type="button" onClick={() => setConfirmStage('none')}>
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {confirmStage === 'second' && (
          <div>
            <Note tone="urgent">{t('rate_change_confirm_2')}</Note>
            <div className="btnrow">
              <button type="button" disabled={submitting} onClick={() => submit(true)}>
                {t('confirm')}
              </button>
              <button type="button" onClick={() => setConfirmStage('none')}>
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </main>
    </Gate>
  );
}
