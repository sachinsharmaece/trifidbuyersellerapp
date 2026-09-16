'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { Gate } from '../../../components/Gate';
import { LocaleToggle } from '../../../components/LocaleToggle';
import { CatalogPicker, type CatalogSelection } from '../../../components/CatalogPicker';
import { DevNote } from '../../../components/dev/DevNote';
import { Note } from '../../../components/Note';
import { Input, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
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
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('ask_raise_title')}</h1>
          <LocaleToggle />
        </header>
        <DevNote screen="buyer_ask" />
        <div className="flex flex-col gap-4">
          <Note>{t('ask_no_price_note')}</Note>

          <CatalogPicker allowAllPacks onChange={setSelection} />

          <Input
            label={t('ask_qty_label')}
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          <Select
            label={t('ask_expiry_requirement')}
            value={expiryBand}
            onChange={(e) => setExpiryBand(e.target.value as 'under12' | 'over12')}
          >
            <option value="over12">{t('cond_expiry_over12')}</option>
            <option value="under12">{t('cond_expiry_under12')}</option>
          </Select>

          <Select
            label={t('ask_delivery_requirement')}
            value={deliveryBand}
            onChange={(e) => setDeliveryBand(e.target.value as '' | '48h' | '2-5d')}
          >
            <option value="">{t('ask_any_delivery')}</option>
            <option value="48h">{t('cond_delivery_48h')}</option>
            <option value="2-5d">{t('cond_delivery_2_5d')}</option>
          </Select>

          {error && <Note tone="urgent">{error}</Note>}

          <Button
            fullWidth
            icon={<FiSend />}
            loading={submitting}
            disabled={!selection || !qty}
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
          </Button>
        </div>
      </main>
    </Gate>
  );
}
