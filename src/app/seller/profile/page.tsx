'use client';

import { useState } from 'react';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Note } from '../../../components/Note';
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

function ScorecardSection() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<SellerScorecardDto>(
    () => callApi((token) => getScorecard(token)),
    () => false,
    [],
  );
  return (
    <AsyncBoundary state={state} onRetry={retry}>
      {(card) => (
        <dl>
          <dt>{t('scorecard_trust_tier')}</dt>
          <dd>{card.trustTier}</dd>
          <dt>{t('scorecard_supplies_completed')}</dt>
          <dd>{card.suppliesCompleted}</dd>
          <dt>{t('scorecard_po_count')}</dt>
          <dd>{card.poCount}</dd>
          <dt>{t('scorecard_failed_count')}</dt>
          <dd>{card.failedCount}</dd>
          <dt>{t('scorecard_requote_total')}</dt>
          <dd>{card.requoteTotal}</dd>
        </dl>
      )}
    </AsyncBoundary>
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
    <div>
      <p className="hint">{t('exclusions_hint')}</p>
      <label>
        {t('exclusions_lookup_label')}
        <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} />
      </label>
      {error && <Note tone="urgent">{error}</Note>}
      <button
        type="button"
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
      </button>

      <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
        {(items) => (
          <ul>
            {items.map((item) => (
              <li key={item.exclusionId}>
                {item.gstin}{' '}
                <button
                  type="button"
                  onClick={() =>
                    void callApi((token) => deleteExclusion(token, item.exclusionId)).then(retry)
                  }
                >
                  {t('exclusions_remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}

export default function SellerProfilePage() {
  const { t } = useLocale();
  const { logout, me } = useSession();

  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('profile_title')}</h1>
          <div className="page-header__actions">
            <LocaleToggle />
            <button type="button" onClick={() => void logout()}>
              {t('sign_out')}
            </button>
          </div>
        </header>
        <dl>
          <dt>{t('profile_mobile')}</dt>
          <dd>{me?.mobile}</dd>
        </dl>

        <h2>{t('scorecard_title')}</h2>
        <ScorecardSection />

        <h2>{t('exclusions_title')}</h2>
        <ExclusionsSection />

        <h2>{t('help_title')}</h2>
        <Note>{t('help_call_desk_body')}</Note>

        <SellerNav />
      </main>
    </Gate>
  );
}
