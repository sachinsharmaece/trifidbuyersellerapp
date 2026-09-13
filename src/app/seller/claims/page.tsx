'use client';

import { useEffect, useState } from 'react';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { Note } from '../../../components/Note';
import { UndoToast } from '../../../components/UndoToast';
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
      <main>
        <header className="page-header">
          <h1>{t('claim_board_title')}</h1>
          <LocaleToggle />
        </header>

        {!enabled && <Note>{t('nothing_yet')}</Note>}
        {enabled && items === null && <p className="page-state">{t('loading')}</p>}
        {enabled &&
          items?.map((item) => (
            <div key={item.pileId} className="card">
              <div>{formatRupees(item.ratePaise)}</div>
              <div className="hint">
                {item.totalQty} {t('boxes_unit')}
              </div>
              <button
                type="button"
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
              </button>
            </div>
          ))}

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
