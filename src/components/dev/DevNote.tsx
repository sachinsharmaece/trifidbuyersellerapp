'use client';

import { useState } from 'react';
import { env } from '../../lib/env';
import { useLocale } from '../../providers/LocaleProvider';
import { devNotes, type DevNoteContent, type DevNoteKey } from '../../lib/devNotes';

/**
 * Client-walkthrough scaffolding — renders nothing unless
 * NEXT_PUBLIC_SHOW_DEV_NOTES is set. See lib/devNotes.ts for removal steps.
 */
export function DevNote({ screen }: { screen: DevNoteKey }) {
  const [open, setOpen] = useState(false);
  const { locale } = useLocale();

  if (!env.showDevNotes) return null;

  const note: DevNoteContent = devNotes[screen];
  const lang = locale === 'hi' ? 'hi' : 'en';

  return (
    <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50/60 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-medium text-brand-700"
      >
        <span>{locale === 'hi' ? 'ℹ️ यह स्क्रीन क्या करती है' : 'ℹ️ What this screen does'}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-brand-200 px-3 py-3 text-slate-700">
          <p>{note.purpose[lang]}</p>
          {note.tradeContext && <p className="text-slate-600">{note.tradeContext[lang]}</p>}
          {note.notBuiltYet && (
            <p className="rounded-md bg-warning-50 px-2 py-1.5 text-warning-700">
              {locale === 'hi' ? '⚠️ अभी नहीं बना — ' : '⚠️ Not built yet — '}
              {note.notBuiltYet[lang]}
            </p>
          )}
          {note.question && (
            <p className="rounded-md bg-slate-100 px-2 py-1.5 text-slate-700">
              ❓ {note.question[lang]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
