'use client';

import { useEffect, useState } from 'react';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { Note } from '../../../components/Note';
import { UndoToast } from '../../../components/UndoToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { formatRupees } from '../../../lib/format';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import {
  getClaimBoard,
  postClaim,
  postUndoClaim,
  type ClaimBoardItem,
} from '../../../lib/demandApi';
import { ApiError } from '../../../lib/apiErrors';

/**
 * BR-140 — this feature ships off by default (`config.claim_board`). A 404
 * here means "not enabled," not a broken screen — shown as a plain note
 * rather than the generic error boundary.
 */
export default function ClaimBoardPage() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const [items, setItems] = useState<ClaimBoardItem[] | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [undo, setUndo] = useState<{ claimId: string; deadlineIso: string } | null>(null);

  function load() {
    callApi((token) => getClaimBoard(token))
      .then(setItems)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setEnabled(false);
          return;
        }
        setItems([]);
      });
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('claim_board_title')}</h1>
          <LocaleToggle />
        </header>

        {!enabled && <Note>{t('nothing_yet')}</Note>}
        {enabled && items === null && <Loader label={t('loading')} />}
        {enabled && (
          <div className="flex flex-col gap-3">
            {items?.map((item) => (
              <Card key={item.pileId}>
                <div className="text-lg font-bold text-slate-900">
                  {formatRupees(item.ratePaise)}
                </div>
                <div className="text-xs text-slate-400">{t('rate_excludes_gst')}</div>
                <div className="mb-3 text-sm text-slate-500">
                  {item.totalQty} {t('boxes_unit')}
                </div>
                <Button
                  fullWidth
                  onClick={() =>
                    callApi((token) => postClaim(token, item.pileId)).then((res) => {
                      setUndo({
                        claimId: res.claimId,
                        deadlineIso: new Date(Date.now() + 5000).toISOString(),
                      });
                      load();
                    })
                  }
                >
                  {t('claim_action')}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {undo && (
          <UndoToast
            message={t('undo_done', { seconds: 5 })}
            deadlineIso={undo.deadlineIso}
            onUndo={() =>
              callApi((token) => postUndoClaim(token, undo.claimId)).then(() => {
                setUndo(null);
                load();
              })
            }
          />
        )}
      </main>
    </Gate>
  );
}
