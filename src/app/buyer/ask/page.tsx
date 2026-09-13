'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { CatalogPicker, type CatalogSelection } from '../../../components/CatalogPicker';
import { Note } from '../../../components/Note';
import { useLocale } from '../../../providers/LocaleProvider';
import { useSession } from '../../../providers/SessionProvider';
import { postAsk } from '../../../lib/demandApi';
import { ApiError } from '../../../lib/apiErrors';

export default function RaiseAskPage() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();

  const [selection, setSelection] = useState<CatalogSelection | null>(null);
  const [qty, setQty] = useState('');
  const [expiryBand, setExpiryBand] = useState<'under12' | 'over12'>('over12');
  const [deliveryBand, setDeliveryBand] = useState<'' | '48h' | '2-5d'>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('ask_raise_title')}</h1>
          <LocaleToggle />
        </header>
        <Note>{t('ask_no_price_note')}</Note>

        <CatalogPicker allowAllPacks onChange={setSelection} />

        <label>
          {t('ask_qty_label')}
          <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </label>

        <label>
          {t('ask_expiry_requirement')}
          <select
            value={expiryBand}
            onChange={(e) => setExpiryBand(e.target.value as 'under12' | 'over12')}
          >
            <option value="over12">{t('cond_expiry_over12')}</option>
            <option value="under12">{t('cond_expiry_under12')}</option>
          </select>
        </label>

        <label>
          {t('ask_delivery_requirement')}
          <select
            value={deliveryBand}
            onChange={(e) => setDeliveryBand(e.target.value as '' | '48h' | '2-5d')}
          >
            <option value="">{t('ask_any_delivery')}</option>
            <option value="48h">{t('cond_delivery_48h')}</option>
            <option value="2-5d">{t('cond_delivery_2_5d')}</option>
          </select>
        </label>

        {error && <Note tone="urgent">{error}</Note>}

        <button
          type="button"
          disabled={submitting || !selection || !qty}
          onClick={() => {
            if (!selection) return;
            const qtyNum = Number(qty);
            if (!qtyNum) return;
            setSubmitting(true);
            setError(null);
            callApi((token) =>
              postAsk(token, {
                skuId: selection.allPacks ? undefined : selection.skuId,
                productId: selection.allPacks ? selection.productId : undefined,
                allPacks: selection.allPacks,
                qty: qtyNum,
                conditionRequirement: {
                  expiryBand,
                  deliveryBand: deliveryBand || undefined,
                },
              }),
            )
              .then(() => router.push('/buyer/asks'))
              .catch((err: unknown) => {
                setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                setSubmitting(false);
              });
          }}
        >
          {t('ask_submit')}
        </button>
      </main>
    </Gate>
  );
}
