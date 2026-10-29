'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { getProductOffers } from '../../../lib/listingApi';
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
  // 29 Oct — a pack already on offer to him is bought from its offers (Purchase → Confirmations);
  // an ask is only for what is not listed (Purchase → Demand).
  const pickedProductId = selection?.productId ?? '';
  const pickedSkuId = selection?.allPacks ? '' : (selection?.skuId ?? '');
  const pickedKey = `${pickedProductId}|${pickedSkuId}`;
  // The selection last found on offer; a stale answer for an earlier pick never matches.
  const [listedKey, setListedKey] = useState<string | null>(null);
  const listed = pickedProductId !== '' && listedKey === pickedKey;
  useEffect(() => {
    if (!pickedProductId) return;
    let live = true;
    callApi((token) => getProductOffers(token, pickedProductId))
      .then((offers) => {
        if (!live) return;
        const onOffer = offers.offers.some((o) => !pickedSkuId || o.skuId === pickedSkuId);
        setListedKey(onOffer ? pickedKey : null);
      })
      .catch(() => undefined); // The server still takes the ask; this is only a pointer.
    return () => {
      live = false;
    };
  }, [callApi, pickedProductId, pickedSkuId, pickedKey]);

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

          {listed && (
            <Note tone="wait">
              {t('ask_listed_note')}{' '}
              <Link className="font-medium underline" href={`/buyer/product/${pickedProductId}`}>
                {t('ask_listed_view')}
              </Link>
            </Note>
          )}

          {error && <Note tone="urgent">{error}</Note>}

          <Button
            fullWidth
            icon={<FiSend />}
            loading={submitting}
            disabled={!selection || !qty || listed}
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
