'use client';

import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { Pill } from '../../../components/Pill';
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
        <table>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.quoteId}>
                <td>
                  {q.qtyAvailable} {t('boxes_unit')}
                </td>
                <td>
                  <Pill
                    tone={q.status === 'won' ? 'good' : q.status === 'lost' ? 'bad' : 'neutral'}
                  >
                    {q.status}
                  </Pill>
                </td>
                <td>
                  {q.rank !== undefined && q.ofCount !== undefined
                    ? t('quote_rank_of', { rank: q.rank, ofCount: q.ofCount })
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AsyncBoundary>
  );
}

export default function MyQuotesPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('my_rates_given_title')}</h1>
          <LocaleToggle />
        </header>
        <QuotesContent />
      </main>
    </Gate>
  );
}
