'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { BuyerNav } from '../../../components/BuyerNav';
import { Pill } from '../../../components/Pill';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
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
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {t('ask_qty_label')}: {ask.qty}
        </span>
        <Pill>{ask.state}</Pill>
      </div>
      <div className="flex flex-col gap-2">
        {liveQuotes.map((quote) => (
          <div key={quote.quoteId} className="rounded-md border border-slate-200 p-3">
            <div className="text-lg font-bold text-slate-900">
              {quote.ratePaiseForIndore !== undefined
                ? formatRupees(quote.ratePaiseForIndore)
                : t('loading')}
            </div>
            <div className="mb-2 text-sm text-slate-500">
              {quote.qtyAvailable} {t('boxes_unit')}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
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
      </div>
      {liveQuotes.length > 0 && (
        <div className="mt-3 flex gap-3">
          <Button
            fullWidth
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
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void callApi((token) => postDeclineAsk(token, ask.askId)).then(onChanged)
            }
          >
            {t('quote_walk_away')}
          </Button>
        </div>
      )}
    </Card>
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
        <div className="flex flex-col gap-3">
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
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('my_asks_title')}</h1>
          <LocaleToggle />
        </header>
        <Link href="/buyer/ask" className="mb-4 inline-block text-sm text-brand-600 underline">
          {t('ask_raise_title')}
        </Link>
        <AsksContent />
        <BuyerNav />
      </main>
    </Gate>
  );
}
