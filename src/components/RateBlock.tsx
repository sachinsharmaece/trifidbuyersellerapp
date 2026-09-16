'use client';

import { formatRupees } from '../lib/format';
import { useLocale } from '../providers/LocaleProvider';
import { ConditionChips, type ConditionSet } from './ConditionChips';

/**
 * The one place a rate renders — always a buyer-facing rate (DEC-045: the
 * buyer's rate is tax-inclusive, unlike a seller's own net rate). `conditions`
 * is required and non-nullable — IC-04's correction: a rate never appears
 * without its condition-set chips, so nothing on screen can be mistaken for a
 * plain, comparable price.
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
  const { t } = useLocale();
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      {label && <div className="text-xs text-slate-500">{label}</div>}
      <div className="text-xl font-bold text-slate-900">{formatRupees(ratePaise)}</div>
      <div className="mb-1.5 text-xs text-slate-400">{t('rate_includes_gst')}</div>
      <ConditionChips conditions={conditions} />
    </div>
  );
}
