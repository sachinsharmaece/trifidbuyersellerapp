'use client';

import { Note } from './Note';
import { ButtonLink } from './ui/Button';
import { useLocale } from '../providers/LocaleProvider';

/**
 * 2 Nov — the Buy button on an offer, or — while the offer takes no requests (its last group is
 * still being confirmed, the seller revised or declined it, or it is sold out; BR-136) — a note
 * saying so, instead of a button that would only be refused.
 */
export function OfferBuyAction({
  listingLineId,
  closed,
}: {
  listingLineId: string;
  closed: 'confirmed' | 'requoted' | 'declined' | 'sold_out' | null;
}) {
  const { t } = useLocale();
  if (closed) {
    return (
      <div className="mt-3">
        <Note tone="wait">{t(closed === 'sold_out' ? 'offer_sold_out' : 'offer_closed')}</Note>
      </div>
    );
  }
  return (
    <ButtonLink href={`/buyer/buy/${listingLineId}`} fullWidth className="mt-3">
      {t('buy_title')}
    </ButtonLink>
  );
}
