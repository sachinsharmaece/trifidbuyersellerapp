import { FiCheckCircle, FiCircle, FiAlertCircle } from 'react-icons/fi';
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
      <div
        aria-label={t('rung_stopped')}
        className="flex items-center gap-2 rounded-md bg-danger-50 px-3 py-2 text-sm font-medium text-danger-600"
      >
        <FiAlertCircle aria-hidden />
        {t('rung_stopped')}
      </div>
    );
  }

  const currentIndex = NORMAL_RUNGS.indexOf(rung);
  return (
    <ol className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
      {NORMAL_RUNGS.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className={`flex items-center gap-2 py-0.5 text-sm ${
              done
                ? 'text-success-600'
                : current
                  ? 'font-semibold text-brand-600'
                  : 'text-slate-400'
            }`}
          >
            {done ? (
              <FiCheckCircle aria-hidden />
            ) : (
              <FiCircle aria-hidden className={current ? 'text-brand-500' : ''} />
            )}
            {t(RUNG_KEY[step])}
          </li>
        );
      })}
    </ol>
  );
}
