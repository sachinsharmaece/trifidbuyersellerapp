'use client';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatRupees } from '../lib/format';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { newIdempotencyKey } from '../lib/idempotency';
import { postAcceptPileOffer, postDeclinePileOffer, type PileOffer } from '../lib/demandApi';

/**
 * 2 Nov — BR-378. A deal the seller confirmed for him: his boxes, the expiry, his own rate, held for
 * 24 hours. "Confirm" places his order (its payment window starts then); "Not now" lets it go and the
 * boxes go back on the seller's listing.
 */
export function PileOfferCard({ offer, onChanged }: { offer: PileOffer; onChanged: () => void }) {
  const { t, locale } = useLocale();
  const { callApi } = useSession();
  const until = new Date(offer.holdUntil).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card>
      <div className="mb-1 text-sm font-medium text-slate-500">{t('pile_offer_title')}</div>
      <div className="font-medium text-slate-900">
        {offer.brand}
        {offer.packLabel ? ` · ${offer.packLabel}` : ''}
      </div>
      {offer.ratePaise !== null && (
        <>
          <div className="text-lg font-bold text-slate-900">{formatRupees(offer.ratePaise)}</div>
          <div className="text-xs text-slate-400">{t('rate_includes_gst')}</div>
        </>
      )}
      <div className="mb-1 text-sm text-slate-500">
        {offer.boxes} {t('boxes_unit')}
        {offer.expiryExact ? ` · ${t('pile_offer_expiry', { expiry: offer.expiryExact })}` : ''}
      </div>
      {offer.boxes < offer.askedBoxes && (
        <p className="mb-1 text-sm text-slate-600">
          {t('pile_offer_short', { asked: offer.askedBoxes, boxes: offer.boxes })}
        </p>
      )}
      <p className="mb-1 text-sm text-slate-600">{t('pile_offer_take_note')}</p>
      <p className="mb-3 text-xs text-slate-500">{t('pile_offer_hold', { until })}</p>
      <div className="flex gap-3">
        <Button
          fullWidth
          onClick={() =>
            void callApi((token) =>
              postAcceptPileOffer(token, offer.requestId, newIdempotencyKey()),
            ).then(onChanged)
          }
        >
          {t('confirm')}
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void callApi((token) =>
              postDeclinePileOffer(token, offer.requestId, newIdempotencyKey()),
            ).then(onChanged)
          }
        >
          {t('quote_walk_away')}
        </Button>
      </div>
    </Card>
  );
}
