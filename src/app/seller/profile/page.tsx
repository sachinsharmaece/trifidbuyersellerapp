'use client';

import { useState } from 'react';
import { FiLogOut, FiTrash2 } from 'react-icons/fi';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Note } from '../../../components/Note';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getScorecard, type SellerScorecardDto } from '../../../lib/conductApi';
import {
  getExclusions,
  postExclusion,
  deleteExclusion,
  type ExclusionListItem,
} from '../../../lib/exclusionApi';
import { ApiError } from '../../../lib/apiErrors';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-base font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function ScorecardSection() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<SellerScorecardDto>(
    () => callApi((token) => getScorecard(token)),
    () => false,
    [],
  );
  return (
    <Card title={t('scorecard_title')}>
      <AsyncBoundary state={state} onRetry={retry}>
        {(card) => (
          <dl className="grid grid-cols-2 gap-4">
            <Stat label={t('scorecard_trust_tier')} value={card.trustTier} />
            <Stat label={t('scorecard_supplies_completed')} value={card.suppliesCompleted} />
            <Stat label={t('scorecard_po_count')} value={card.poCount} />
            <Stat label={t('scorecard_failed_count')} value={card.failedCount} />
            <Stat label={t('scorecard_requote_total')} value={card.requoteTotal} />
          </dl>
        )}
      </AsyncBoundary>
    </Card>
  );
}

function ExclusionsSection() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { state, retry } = useAsyncData<ExclusionListItem[]>(
    () => callApi((token) => getExclusions(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <Card title={t('exclusions_title')}>
      <p className="mb-3 text-sm text-slate-500">{t('exclusions_hint')}</p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={t('exclusions_lookup_label')}
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setError(null);
            callApi((token) => postExclusion(token, gstin))
              .then(() => {
                setGstin('');
                retry();
              })
              .catch((err: unknown) =>
                setError(err instanceof ApiError ? err.message : 'Something went wrong.'),
              );
          }}
        >
          {t('exclusions_add')}
        </Button>
      </div>
      {error && (
        <div className="mt-3">
          <Note tone="urgent">{error}</Note>
        </div>
      )}

      <div className="mt-4">
        <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
          {(items) => (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.exclusionId}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{item.gstin}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<FiTrash2 />}
                    onClick={() =>
                      void callApi((token) => deleteExclusion(token, item.exclusionId)).then(retry)
                    }
                  >
                    {t('exclusions_remove')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </div>
    </Card>
  );
}

export default function SellerProfilePage() {
  const { t } = useLocale();
  const { logout, me } = useSession();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('profile_title')}</h1>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <Button variant="ghost" size="sm" icon={<FiLogOut />} onClick={() => void logout()}>
              {t('sign_out')}
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <Card>
            <dl>
              <Stat label={t('profile_mobile')} value={me?.mobile ?? ''} />
            </dl>
          </Card>

          <ScorecardSection />
          <ExclusionsSection />

          <Card title={t('help_title')}>
            <Note>{t('help_call_desk_body')}</Note>
          </Card>
        </div>

        <SellerNav />
      </main>
    </Gate>
  );
}
