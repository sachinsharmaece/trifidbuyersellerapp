'use client';

import { useState } from 'react';
import { Pill } from './Pill';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatRupees } from '../lib/format';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import { newIdempotencyKey } from '../lib/idempotency';
import { postAcceptFill, postDeclineAsk, type MyAskItem } from '../lib/demandApi';

/**
 * One of the buyer's asks on My asks: the rates quoted on it, and what he can do with them.
 * 2 Nov — shows how many boxes are already ordered when a short fill left it open (BR-127), and
 * offers to keep looking for the rest when the quotes he ticks cover fewer boxes than are wanted.
 */
export function AskCard({ ask, onChanged }: { ask: MyAskItem; onChanged: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [picked, setPicked] = useState<string[]>([]);
  const [keepLooking, setKeepLooking] = useState(true);

  const liveQuotes = ask.quotes.filter((q) => q.status === 'live');
  // 2 Nov — quotes ticked that cover fewer boxes than are still wanted leave the rest of the ask
  // open (BR-127), unless he unticks "keep looking".
  const pickedBoxes = liveQuotes
    .filter((q) => picked.includes(q.quoteId))
    .reduce((sum, q) => sum + q.qtyAvailable, 0);
  const left = ask.qty - pickedBoxes;

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {t('ask_qty_label')}: {ask.qty}
        </span>
        <Pill>{ask.state}</Pill>
      </div>
      {ask.filledQty > 0 && (
        <p className="mb-2 text-sm text-slate-600">
          {t('ask_filled_progress', {
            filled: ask.filledQty,
            total: ask.filledQty + ask.qty,
            left: ask.qty,
          })}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {liveQuotes.map((quote) => (
          <div key={quote.quoteId} className="rounded-md border border-slate-200 p-3">
            <div className="text-lg font-bold text-slate-900">
              {quote.ratePaiseForIndore !== undefined
                ? formatRupees(quote.ratePaiseForIndore)
                : t('loading')}
            </div>
            {quote.ratePaiseForIndore !== undefined && (
              <div className="text-xs text-slate-400">{t('rate_includes_gst')}</div>
            )}
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
      {picked.length > 0 && left > 0 && (
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={keepLooking}
            onChange={(e) => setKeepLooking(e.target.checked)}
          />
          {t('quote_keep_looking', { left })}
        </label>
      )}
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
                    ...(left > 0 ? { keepRemainderOpen: keepLooking } : {}),
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
