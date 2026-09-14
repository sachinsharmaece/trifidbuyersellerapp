'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { Gate } from '../../../../../components/Gate';
import { LocaleToggle } from '../../../../../components/LocaleToggle';
import { Note } from '../../../../../components/Note';
import { Card } from '../../../../../components/ui/Card';
import { Select, Textarea } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
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
    <Card>
      <Note tone="urgent">{t('complaint_stops_clock')}</Note>
      <div className="mt-4 flex flex-col gap-4">
        <Select
          label={t('complaint_category_label')}
          value={category}
          onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
        >
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(CATEGORY_KEY[cat])}
            </option>
          ))}
        </Select>
        <Textarea
          label={t('complaint_note_label')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <Note tone="urgent">{error}</Note>}
        <Button
          fullWidth
          loading={submitting}
          icon={<FiSend />}
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
        </Button>
      </div>
    </Card>
  );
}

export default function ComplaintPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { t } = useLocale();

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('complaint_title')}</h1>
          <LocaleToggle />
        </header>
        <ComplaintForm soId={id} />
      </main>
    </Gate>
  );
}
