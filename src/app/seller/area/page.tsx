'use client';

import { useCallback } from 'react';
import { Gate } from '../../../components/Gate';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { DevNote } from '../../../components/dev/DevNote';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td } from '../../../components/ui/Table';
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
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('area_page_title')}</h1>
          <LocaleToggle />
        </header>
        <DevNote screen="seller_area" />
        <p className="mb-4 text-sm text-slate-500">{t('area_page_hint')}</p>
        <Card>
          <AsyncBoundary
            state={state}
            onRetry={retry}
            emptyMessage="No area set yet — call the sales desk."
          >
            {(area) => (
              <>
                <Table className="mb-4">
                  <thead>
                    <tr>
                      <Th>Tehsil</Th>
                      <Th>District</Th>
                      <Th>State</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.tehsils.map((tehsil) => (
                      <tr key={tehsil.tehsilId}>
                        <Td>{tehsil.name}</Td>
                        <Td>{tehsil.district}</Td>
                        <Td>{tehsil.state}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="text-sm text-slate-700">
                  Dispatch cut-off time: {area.dispatchCutoffTime}
                </p>
              </>
            )}
          </AsyncBoundary>
        </Card>
      </main>
    </Gate>
  );
}
