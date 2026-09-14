'use client';

import { useState } from 'react';
import { useLocale } from '../providers/LocaleProvider';
import { Clock } from './Clock';

/**
 * BR-137 — "undo instead of confirmation dialogs." The server has already
 * acted and scheduled its own deferred job (`confirmPile`/`getAgendaProducer`
 * in trifid-serverapp); this is a thin UI wrapper around that fact, not a
 * client-side deferred-commit mechanism of its own. `onUndo` must call the
 * matching undo endpoint before `deadlineIso` passes — a call after that
 * point is refused server-side (the job has already fired).
 */
export function UndoToast({
  message,
  deadlineIso,
  onUndo,
}: {
  message: string;
  deadlineIso: string;
  onUndo: () => void | Promise<void>;
}) {
  const { t } = useLocale();
  const [expired, setExpired] = useState(false);
  const [undoing, setUndoing] = useState(false);

  if (expired) return null;

  return (
    <div className="undo-toast" role="status">
      <span>{message}</span>
      <Clock targetIso={deadlineIso} onExpire={() => setExpired(true)} />
      <button
        type="button"
        disabled={undoing}
        onClick={() => {
          setUndoing(true);
          void Promise.resolve(onUndo()).finally(() => setExpired(true));
        }}
      >
        {t('undo')}
      </button>
    </div>
  );
}
