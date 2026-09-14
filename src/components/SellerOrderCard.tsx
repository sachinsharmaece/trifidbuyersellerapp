import { useLocale } from '../providers/LocaleProvider';
import type { SellerPoDto } from '../lib/ordersApi';
import type { DictionaryKey } from '../lib/i18n';

const RUNG_KEY: Record<string, DictionaryKey> = {
  placed: 'rung_placed',
  payment: 'rung_payment',
  seller_confirmed: 'rung_seller_confirmed',
  leg1_dispatch: 'rung_leg1_dispatch',
  paperwork_at_indore: 'rung_paperwork_at_indore',
  leg2_dispatch: 'rung_leg2_dispatch',
  delivered: 'rung_delivered',
  closed: 'rung_closed',
  stopped: 'rung_stopped',
};

/**
 * BR-138 — a seller's own order card. `SellerPoDto` carries no buyerId, no
 * delivery location, and leg 2 is reduced to a bare boolean (orders.dto.ts).
 * As with FeedCard, this only reads the two named fields below rather than
 * spreading the object, so an accidental extra field on the wire cannot
 * leak through here either. See tests/wallSweep.test.tsx.
 */
export function SellerOrderCard({ order }: { order: SellerPoDto }) {
  const { t } = useLocale();
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <strong className="text-slate-900">{order.poNo}</strong>
      <div className="mt-1 text-sm text-slate-500">{t(RUNG_KEY[order.rung] ?? 'rung_placed')}</div>
    </div>
  );
}
