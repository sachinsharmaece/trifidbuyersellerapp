'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { Note } from '../../../../../components/Note';
import { useLocale } from '../../../../../providers/LocaleProvider';
import { useSession } from '../../../../../providers/SessionProvider';
import {
  postComplaint,
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
} from '../../../../../lib/ordersApi';
import { ApiError } from '../../../../../lib/apiErrors';
import type { DictionaryKey } from '../../../../../lib/i18n';

const CATEGORY_KEY: Record<ComplaintCategory, DictionaryKey> = {
  transit_damage: 'complaint_cat_transit_damage',
  hidden_defect_sealed_case: 'complaint_cat_hidden_defect_sealed_case',
  wrong_declared_by_seller: 'complaint_cat_wrong_declared_by_seller',
  wrong_missed_by_dock: 'complaint_cat_wrong_missed_by_dock',
  short_count_on_arrival: 'complaint_cat_short_count_on_arrival',
};

function ComplaintForm({ soId }: { soId: string }) {
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<ComplaintCategory>('transit_damage');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div>
      <Note tone="urgent">{t('complaint_stops_clock')}</Note>
      <label>
        {t('complaint_category_label')}
        <select value={category} onChange={(e) => setCategory(e.target.value as ComplaintCategory)}>
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(CATEGORY_KEY[cat])}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('complaint_note_label')}
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error && <Note tone="urgent">{error}</Note>}
      <button
        type="button"
        disabled={submitting}
        onClick={() => {
          setSubmitting(true);
          setError(null);
          callApi((token) => postComplaint(token, soId, { category, note: note || undefined }))
            .then(() => router.push(`/buyer/orders/${soId}`))
            .catch((err: unknown) => {
              setError(err instanceof ApiError ? err.message : 'Something went wrong.');
              setSubmitting(false);
            });
        }}
      >
        {t('complaint_submit')}
      </button>
    </div>
  );
}

export default function ComplaintPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('complaint_title')}</h1>
          <LocaleToggle />
        </header>
        <ComplaintForm soId={id} />
      </main>
    </Gate>
  );
}
