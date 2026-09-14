'use client';

import { useState } from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { AsyncBoundary } from '../../../components/AsyncBoundary';
import { SellerNav } from '../../../components/SellerNav';
import { Note } from '../../../components/Note';
import { UndoToast } from '../../../components/UndoToast';
import { Card } from '../../../components/ui/Card';
import { Table, Td } from '../../../components/ui/Table';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
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
    <Card>
      <Table className="mb-3">
        <tbody>
          {pile.requests.map((req) => (
            <tr key={req.index}>
              <Td>{t('pile_buyer_index', { index: req.index })}</Td>
              <Td>
                {req.boxes} {t('boxes_unit')}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mb-3 text-sm font-medium text-slate-700">
        {t('pile_total_qty', { qty: pile.totalQty })}
      </p>

      <div className="flex flex-col gap-3">
        <Input
          label={t('quote_expiry_exact')}
          placeholder="MM/YYYY"
          value={expiryExact}
          onChange={(e) => setExpiryExact(e.target.value)}
        />
        <Input label={t('quote_batch')} value={batch} onChange={(e) => setBatch(e.target.value)} />
        {error && <Note tone="urgent">{error}</Note>}

        <div className="flex flex-wrap items-end gap-2">
          <Button icon={<FiCheckCircle />} onClick={() => confirm(pile.totalQty)}>
            {t('pile_confirm_all')}
          </Button>
          <input
            type="number"
            min={0}
            max={pile.totalQty}
            value={canSendBoxes}
            onChange={(e) => setCanSendBoxes(e.target.value)}
            className="w-20 rounded-md border border-slate-300 px-2 py-2 text-sm"
          />
          <Button
            variant="secondary"
            icon={<FiCheck />}
            onClick={() => confirm(Number(canSendBoxes))}
          >
            {t('pile_confirm_partial')}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void callApi((token) => postRequotePile(token, pile.pileId)).then(onChanged)
            }
          >
            {t('pile_requote')}
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              void callApi((token) => postDeclinePile(token, pile.pileId)).then(onChanged)
            }
          >
            {t('pile_decline')}
          </Button>
        </div>
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
    </Card>
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
        <div className="flex flex-col gap-3">
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
      <main className="mx-auto max-w-lg p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('confirmations_title')}</h1>
          <LocaleToggle />
        </header>
        <ConfirmationsContent />
        <SellerNav />
      </main>
    </Gate>
  );
}
