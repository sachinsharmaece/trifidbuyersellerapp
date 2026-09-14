'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
import { Pill } from '../../../components/Pill';
import { formatRupees } from '../../../lib/format';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../lib/idempotency';
import { getMyAsks, postAcceptFill, postDeclineAsk, type MyAskItem } from '../../../lib/demandApi';

function AskCard({ ask, onChanged }: { ask: MyAskItem; onChanged: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [picked, setPicked] = useState<string[]>([]);

  const liveQuotes = ask.quotes.filter((q) => q.status === 'live');

  return (
    <div className="card">
      <div className="hint">
        {t('ask_qty_label')}: {ask.qty}
      </div>
      <Pill>{ask.state}</Pill>
      {liveQuotes.map((quote) => (
        <div key={quote.quoteId} className="rate-block">
          <div className="rate-block__rate">
            {quote.ratePaiseForIndore !== undefined
              ? formatRupees(quote.ratePaiseForIndore)
              : t('loading')}
          </div>
          <div className="hint">
            {quote.qtyAvailable} {t('boxes_unit')}
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={picked.includes(quote.quoteId)}
              onChange={(e) =>
                setPicked((prev) =>
                  e.target.checked
                    ? [...prev, quote.quoteId]
                    : prev.filter((id) => id !== quote.quoteId),
                )
              }
            />
            {t('quote_accept')}
          </label>
        </div>
      ))}
      {liveQuotes.length > 0 && (
        <div className="btnrow">
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() =>
              void callApi((token) =>
                postAcceptFill(
                  token,
                  ask.askId,
                  {
                    option: picked.length === liveQuotes.length ? 'full' : 'partial',
                    quoteIds: picked,
                  },
                  newIdempotencyKey(),
                ),
              ).then(onChanged)
            }
          >
            {t('confirm')}
          </button>
          <button
            type="button"
            onClick={() =>
              void callApi((token) => postDeclineAsk(token, ask.askId)).then(onChanged)
            }
          >
            {t('quote_walk_away')}
          </button>
        </div>
      )}
    </div>
  );
}

function AsksContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<MyAskItem[]>(
    () => callApi((token) => getMyAsks(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(asks) => (
        <div>
          {asks.map((ask) => (
            <AskCard key={ask.askId} ask={ask} onChanged={retry} />
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function MyAsksPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('my_asks_title')}</h1>
          <LocaleToggle />
        </header>
        <p>
          <Link href="/buyer/ask">{t('ask_raise_title')}</Link>
        </p>
        <AsksContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
