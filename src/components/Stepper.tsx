import { useLocale } from '../providers/LocaleProvider';

export function Stepper({ current, total }: { current: number; total: number }) {
  const { t } = useLocale();
  return (
    <div className="mb-2 text-sm text-slate-500" role="status">
      {t('step_of', { current, total })}
    </div>
  );
}
