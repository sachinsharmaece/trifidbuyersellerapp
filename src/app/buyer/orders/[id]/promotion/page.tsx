'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../../../components/AsyncBoundary';
import { GestureConfirmButton } from '../../../../../components/GestureConfirmButton';
import { Clock } from '../../../../../components/Clock';
import { Note } from '../../../../../components/Note';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { useLocale } from '../../../../../providers/LocaleProvider';
import { useSession } from '../../../../../providers/SessionProvider';
import { useAsyncData } from '../../../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../../../lib/idempotency';
import {
  getPromotionOffer,
  postAcceptPromotion,
  postRejectPromotion,
  type PromotionOfferDto,
} from '../../../../../lib/ordersApi';
import { ApiError } from '../../../../../lib/apiErrors';

/** IC-14 — WF-11's promoted-fallback screen. The buyer's own price never
 * appears here because it never changed; only who supplies it did. */
function PromotionContent({ soId }: { soId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { state, retry } = useAsyncData<PromotionOfferDto | null>(
    () => callApi((token) => getPromotionOffer(token, soId)),
    () => false,
    [soId],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {(offer) =>
        !offer ? (
          <Card>
            <p className="text-sm text-slate-500">{t('nothing_yet')}</p>
            <Button fullWidth className="mt-3" onClick={() => router.push(`/buyer/orders/${soId}`)}>
              {t('back')}
            </Button>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              {t('promoted_fallback_title')}
            </h2>
            <p className="mb-4 text-sm text-slate-700">{t('promoted_fallback_body')}</p>
            <Note tone="urgent">
              <Clock targetIso={offer.expiresAt} />
            </Note>
            {error && (
              <div className="mt-3">
                <Note tone="urgent">{error}</Note>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3">
              <GestureConfirmButton
                label={t('confirm')}
                disabled={submitting}
                onConfirm={() => {
                  setSubmitting(true);
                  setError(null);
                  callApi((token) => postAcceptPromotion(token, soId, newIdempotencyKey()))
                    .then(() => router.push(`/buyer/orders/${soId}`))
                    .catch((err: unknown) => {
                      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                      setSubmitting(false);
                    });
                }}
              />
              <Button
                variant="secondary"
                fullWidth
                loading={submitting}
                onClick={() => {
                  setSubmitting(true);
                  setError(null);
                  callApi((token) => postRejectPromotion(token, soId))
                    .then(() => router.push(`/buyer/orders/${soId}`))
                    .catch((err: unknown) => {
                      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                      setSubmitting(false);
                    });
                }}
              >
                {t('quote_walk_away')}
              </Button>
            </div>
          </Card>
        )
      }
    </AsyncBoundary>
  );
}

export default function PromotionOfferPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('promoted_fallback_title')}</h1>
          <LocaleToggle />
        </header>
        <PromotionContent soId={id} />
      </main>
    </Gate>
  );
}
