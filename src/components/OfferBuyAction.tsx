'use client';

import { Note } from './Note';
import { ButtonLink } from './ui/Button';
import { useLocale } from '../providers/LocaleProvider';

/**
 * 2 Nov — the Buy button on an offer, or — once the seller has already answered that offer (a
 * line has one request group for life, BR-135) — a note saying so, instead of a button that
 * would only be refused.
 */
export function OfferBuyAction({
  listingLineId,
  closed,
}: {
  listingLineId: string;
  closed: 'confirmed' | 'requoted' | 'declined' | null;
}) {
  const { t } = useLocale();
  if (closed) {
    return (
      <div className="mt-3">
        <Note tone="wait">{t('offer_closed')}</Note>
      </div>
    );
  }
  return (
    <ButtonLink href={`/buyer/buy/${listingLineId}`} fullWidth className="mt-3">
      {t('buy_title')}
    </ButtonLink>
  );
}
