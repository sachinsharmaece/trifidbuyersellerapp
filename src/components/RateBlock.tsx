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
    <div className="rate-block">
      {label && <div className="rate-block__label">{label}</div>}
      <div className="rate-block__rate">{formatRupees(ratePaise)}</div>
      <ConditionChips conditions={conditions} />
    </div>
  );
}
