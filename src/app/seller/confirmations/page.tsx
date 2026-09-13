'use client';

import { useState } from 'react';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Note } from '../../../components/Note';
import { UndoToast } from '../../../components/UndoToast';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { useAsyncData } from '../../../lib/useAsyncData';
import { newIdempotencyKey } from '../../../lib/idempotency';
import {
  getConfirmations,
  postConfirmPile,
  postUndoPileConfirm,
  postRequotePile,
  postDeclinePile,
  type PileQueueItem,
} from '../../../lib/demandApi';
import { ApiError } from '../../../lib/apiErrors';

function PileCard({ pile, onChanged }: { pile: PileQueueItem; onChanged: () => void }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [canSendBoxes, setCanSendBoxes] = useState(String(pile.totalQty));
  const [expiryExact, setExpiryExact] = useState('');
  const [batch, setBatch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ pileId: string; deadlineIso: string } | null>(null);

  function confirm(boxes: number) {
    if (!expiryExact) {
      setError(t('pile_expiry_exact_required'));
      return;
    }
    setError(null);
    callApi((token) =>
      postConfirmPile(
        token,
        pile.pileId,
        { canSendBoxes: boxes, expiryExact, batch: batch || undefined },
        newIdempotencyKey(),
      ),
    )
      .then((result) => {
        setUndo({
          pileId: pile.pileId,
          deadlineIso: new Date(Date.now() + result.undoWindowMs).toISOString(),
        });
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : 'Something went wrong.'),
      );
  }

  return (
    <div className="card">
      <table>
        <tbody>
          {pile.requests.map((req) => (
            <tr key={req.index}>
              <td>{t('pile_buyer_index', { index: req.index })}</td>
              <td>
                {req.boxes} {t('boxes_unit')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{t('pile_total_qty', { qty: pile.totalQty })}</p>

      <label>
        {t('quote_expiry_exact')}
        <input
          type="text"
          placeholder="MM/YYYY"
          value={expiryExact}
          onChange={(e) => setExpiryExact(e.target.value)}
        />
      </label>
      <label>
        {t('quote_batch')}
        <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} />
      </label>
      {error && <Note tone="urgent">{error}</Note>}

      <div className="btnrow">
        <button type="button" onClick={() => confirm(pile.totalQty)}>
          {t('pile_confirm_all')}
        </button>
        <input
          type="number"
          min={0}
          max={pile.totalQty}
          value={canSendBoxes}
          onChange={(e) => setCanSendBoxes(e.target.value)}
          style={{ width: '80px' }}
        />
        <button type="button" onClick={() => confirm(Number(canSendBoxes))}>
          {t('pile_confirm_partial')}
        </button>
        <button
          type="button"
          onClick={() =>
            void callApi((token) => postRequotePile(token, pile.pileId)).then(onChanged)
          }
        >
          {t('pile_requote')}
        </button>
        <button
          type="button"
          onClick={() =>
            void callApi((token) => postDeclinePile(token, pile.pileId)).then(onChanged)
          }
        >
          {t('pile_decline')}
        </button>
      </div>

      {undo && (
        <UndoToast
          message={t('undo_done', { seconds: 5 })}
          deadlineIso={undo.deadlineIso}
          onUndo={() =>
            callApi((token) => postUndoPileConfirm(token, undo.pileId)).then(() => {
              setUndo(null);
              onChanged();
            })
          }
        />
      )}
    </div>
  );
}

function ConfirmationsContent() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const { state, retry } = useAsyncData<PileQueueItem[]>(
    () => callApi((token) => getConfirmations(token)),
    (items) => items.length === 0,
    [],
  );

  return (
    <AsyncBoundary state={state} onRetry={retry} emptyMessage={t('nothing_yet')}>
      {(piles) => (
        <div>
          {piles.map((pile) => (
            <PileCard key={pile.pileId} pile={pile} onChanged={retry} />
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}

export default function ConfirmationsPage() {
  const { t } = useLocale();
  return (
    <Gate>
      <main className="with-bottom-nav">
        <header className="page-header">
          <h1>{t('confirmations_title')}</h1>
          <LocaleToggle />
        </header>
        <ConfirmationsContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
