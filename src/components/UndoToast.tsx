'use client';

import { useState } from 'react';
import { useLocale } from '../providers/LocaleProvider';
import { Clock } from './Clock';
import { Button } from './ui/Button';

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
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-lg"
    >
      <span className="flex-1 text-sm">{message}</span>
      <Clock targetIso={deadlineIso} onExpire={() => setExpired(true)} />
      <Button
        variant="ghost"
        size="sm"
        loading={undoing}
        className="text-white hover:bg-white/10"
        onClick={() => {
          setUndoing(true);
          void Promise.resolve(onUndo()).finally(() => setExpired(true));
        }}
      >
        {t('undo')}
      </Button>
    </div>
  );
}
