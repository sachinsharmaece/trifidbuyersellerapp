'use client';

import { useCallback } from 'react';
import { Gate } from '../../../components/Gate';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { useAsyncData } from '../../../lib/useAsyncData';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { getMyArea } from '../../../lib/territoryApi';

/** API-027 — read-only. "He requests, staff decide, and he can always see what applies to him." */
export default function SellerAreaPage() {
  const { t } = useLocale();
  const { callApi } = useSession();

  const loader = useCallback(() => callApi((token) => getMyArea(token)), [callApi]);
  const { state, retry } = useAsyncData(loader, (data) => data.tehsils.length === 0, [loader]);

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('area_page_title')}</h1>
          <LocaleToggle />
        </header>
        <p className="hint">{t('area_page_hint')}</p>
        <AsyncBoundary
          state={state}
          onRetry={retry}
          emptyMessage="No area set yet — call the sales desk."
        >
          {(area) => (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Tehsil</th>
                    <th>District</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {area.tehsils.map((tehsil) => (
                    <tr key={tehsil.tehsilId}>
                      <td>{tehsil.name}</td>
                      <td>{tehsil.district}</td>
                      <td>{tehsil.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Dispatch cut-off time: {area.dispatchCutoffTime}</p>
            </>
          )}
        </AsyncBoundary>
      </main>
    </Gate>
  );
}
