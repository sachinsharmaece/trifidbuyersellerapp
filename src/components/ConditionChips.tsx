import { useLocale } from '../providers/LocaleProvider';
import { Pill } from './Pill';
import type { DictionaryKey } from '../lib/i18n';

export interface ConditionSet {
  expiryBand: string;
  moqBand: string;
  deliveryBand: string;
  provenance: string;
  expiryExact?: string;
}

const EXPIRY_KEY: Record<string, DictionaryKey> = {
  under12: 'cond_expiry_under12',
  over12: 'cond_expiry_over12',
};
const DELIVERY_KEY: Record<string, DictionaryKey> = {
  '48h': 'cond_delivery_48h',
  '2-5d': 'cond_delivery_2_5d',
};
const PROVENANCE_KEY: Record<string, DictionaryKey> = {
  auth: 'cond_provenance_auth',
  company: 'cond_provenance_company',
};

/**
 * BR-101 — the four-field condition-set key, always shown together: a rate
 * without its conditions is not a comparable rate. Every caller must supply
 * all four fields (no partial condition set renders).
 */
export function ConditionChips({ conditions }: { conditions: ConditionSet }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill>{t(EXPIRY_KEY[conditions.expiryBand] ?? 'cond_expiry_over12')}</Pill>
      <Pill>{`${t('cond_moq_label')}: ${conditions.moqBand}`}</Pill>
      <Pill>{t(DELIVERY_KEY[conditions.deliveryBand] ?? 'cond_delivery_2_5d')}</Pill>
      <Pill>{t(PROVENANCE_KEY[conditions.provenance] ?? 'cond_provenance_company')}</Pill>
      {conditions.expiryExact && (
        <Pill tone="good">{t('cond_expiry_confirmed', { value: conditions.expiryExact })}</Pill>
      )}
    </div>
  );
}
