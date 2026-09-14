import { useLocale } from '../providers/LocaleProvider';

export function Stepper({ current, total }: { current: number; total: number }) {
  const { t } = useLocale();
  return (
    <div className="stepper" role="status">
      {t('step_of', { current, total })}
    </div>
  );
}
