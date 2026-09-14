import { formatRupees } from '../lib/format';
import { ConditionChips, type ConditionSet } from './ConditionChips';

/**
 * The one place a rate renders. `conditions` is required and non-nullable —
 * IC-04's correction: a rate never appears without its condition-set chips,
 * so nothing on screen can be mistaken for a plain, comparable price.
 */
export function RateBlock({
  ratePaise,
  conditions,
  label,
}: {
  ratePaise: number;
  conditions: ConditionSet;
  label?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      {label && <div className="text-xs text-slate-500">{label}</div>}
      <div className="mb-1.5 text-xl font-bold text-slate-900">{formatRupees(ratePaise)}</div>
      <ConditionChips conditions={conditions} />
    </div>
  );
}
