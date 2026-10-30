'use client';

import { useSearchParams } from 'next/navigation';
import { Note } from './Note';
import { useLocale } from '../providers/LocaleProvider';

/**
 * 30 Oct — on My asks, after an ask that went into one he already had open for the same pack and
 * conditions (BR-371), so he does not think a second ask was made. `?added=` is its box total now.
 */
export function AddedToOpenAskNote() {
  const { t } = useLocale();
  const added = Number(useSearchParams().get('added'));
  if (!Number.isInteger(added) || added < 1) return null;
  return (
    <div className="mb-4">
      <Note tone="wait">{t('ask_added_to_open', { qty: added })}</Note>
    </div>
  );
}
