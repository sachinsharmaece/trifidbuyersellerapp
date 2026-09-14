'use client';

import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { Pill } from '../../../components/Pill';
import { Table, Th, Td } from '../../../components/ui/Table';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { getMyQuotes, type MyQuoteItem } from '../../../lib/demandApi';

function QuotesContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<MyQuoteItem[]>(
    () => callApi((token) => getMyQuotes(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(quotes) => (
        <Table>
          <thead>
            <tr>
              <Th>{t('boxes_unit')}</Th>
              <Th>Status</Th>
              <Th>Rank</Th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.quoteId}>
                <Td>
                  {q.qtyAvailable} {t('boxes_unit')}
                </Td>
                <Td>
                  <Pill
                    tone={q.status === 'won' ? 'good' : q.status === 'lost' ? 'bad' : 'neutral'}
                  >
                    {q.status}
                  </Pill>
                </Td>
                <Td>
                  {q.rank !== undefined && q.ofCount !== undefined
                    ? t('quote_rank_of', { rank: q.rank, ofCount: q.ofCount })
                    : ''}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AsyncBoundary>
  );
}

export default function MyQuotesPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('my_rates_given_title')}</h1>
          <LocaleToggle />
        </header>
        <QuotesContent />
      </main>
    </Gate>
  );
}
