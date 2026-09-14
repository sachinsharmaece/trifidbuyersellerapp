import { RateBlock } from './RateBlock';
import { useLocale } from '../providers/LocaleProvider';
import type { BuyerFeedCard } from '../lib/listingApi';

/**
 * BR-060 — a buyer's feed card. `BuyerFeedCard` has no `sellerId` and no
 * seller-net field to begin with (listingApi.ts), but this component only
 * ever reads the four named fields below rather than spreading the whole
 * object — so even a backend bug that adds an extra identity field to the
 * JSON response cannot leak through this component. See
 * tests/wallSweep.test.tsx.
 */
export function FeedCard({ card }: { card: BuyerFeedCard }) {
  const { t } = useLocale();
  return (
    <div className="card">
      <div className="hint">
        {card.brand} — {card.technical}
      </div>
      <RateBlock ratePaise={card.lowestRatePaise} conditions={card.conditions} />
      <div className="hint">{t('feed_offers_count', { count: card.offerCount })}</div>
    </div>
  );
}
