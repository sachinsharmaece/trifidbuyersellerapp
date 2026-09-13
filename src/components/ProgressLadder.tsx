import { useLocale } from '../providers/LocaleProvider';
import type { DictionaryKey } from '../lib/i18n';
import { ORDER_RUNGS, type OrderRung } from '../lib/ordersApi';

const RUNG_KEY: Record<OrderRung, DictionaryKey> = {
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

// The normal path never visits `stopped` — it is only ever the current rung
// on a cancelled/supply_failed/disputed order, never a step to walk past.
const NORMAL_RUNGS = ORDER_RUNGS.filter((rung) => rung !== 'stopped');

/**
 * BR-030's six-stage chain, rendered at screen granularity — includes the
 * Round-2 correction, "Paperwork at Indore" as its own rung rather than
 * folded into leg 1 or leg 2.
 */
export function ProgressLadder({ rung }: { rung: OrderRung }) {
  const { t } = useLocale();

  if (rung === 'stopped') {
    return (
      <ol className="progress-ladder" aria-label={t('rung_stopped')}>
        <li className="progress-ladder__rung progress-ladder__rung--stopped">
          {t('rung_stopped')}
        </li>
      </ol>
    );
  }

  const currentIndex = NORMAL_RUNGS.indexOf(rung);
  return (
    <ol className="progress-ladder">
      {NORMAL_RUNGS.map((step, index) => (
        <li
          key={step}
          className={
            index < currentIndex
              ? 'progress-ladder__rung progress-ladder__rung--done'
              : index === currentIndex
                ? 'progress-ladder__rung progress-ladder__rung--current'
                : 'progress-ladder__rung'
          }
          aria-current={index === currentIndex ? 'step' : undefined}
        >
          {t(RUNG_KEY[step])}
        </li>
      ))}
    </ol>
  );
}
