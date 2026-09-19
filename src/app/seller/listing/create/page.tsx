'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { CatalogPicker, type CatalogSelection } from '../../../../components/CatalogPicker';
import { DevNote } from '../../../../components/dev/DevNote';
import { Note } from '../../../../components/Note';
import { Card } from '../../../../components/ui/Card';
import { Input, Select } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useLocale } from '../../../../providers/LocaleProvider';
import { useSession } from '../../../../providers/SessionProvider';
import { postListing, type CreateListingInput } from '../../../../lib/listingApi';
import { ApiError } from '../../../../lib/apiErrors';

type ScopeChoice = 'my_area' | 'all_india' | 'all_except_mine';

export default function CreateListingPage() {
  const { t } = useLocale();
  const { callApi } = useSession();
  const router = useRouter();

  const [selection, setSelection] = useState<CatalogSelection | null>(null);
  const [scopeType, setScopeType] = useState<ScopeChoice>('my_area');
  const [ratePaise, setRatePaise] = useState('');
  const [qty, setQty] = useState('');
  const [moqExact, setMoqExact] = useState('1');
  const [expiryBand, setExpiryBand] = useState<'under12' | 'over12'>('over12');
  const [provenance, setProvenance] = useState<'auth' | 'company'>('auth');
  const [deliveryBand, setDeliveryBand] = useState<'48h' | '2-5d'>('48h');
  const [batch, setBatch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Gate>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{t('create_listing_title')}</h1>
          <LocaleToggle />
        </header>

        <DevNote screen="seller_create_listing" />
        <Card>
          <div className="flex flex-col gap-4">
            <CatalogPicker onChange={setSelection} />

            <Select
              label={t('listing_scope_label')}
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as ScopeChoice)}
            >
              <option value="my_area">{t('listing_scope_my_area')}</option>
              <option value="all_india">{t('listing_scope_all_india')}</option>
              <option value="all_except_mine">{t('listing_scope_all_except_mine')}</option>
            </Select>

            <Input
              label={t('listing_rate_label')}
              hint={t('rate_excludes_gst')}
              type="number"
              value={ratePaise}
              onChange={(e) => setRatePaise(e.target.value)}
            />
            <Input
              label={t('listing_qty_label')}
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <Input
              label={t('listing_moq_label')}
              hint={t('listing_moq_hint')}
              type="number"
              min={1}
              value={moqExact}
              onChange={(e) => setMoqExact(e.target.value)}
            />

            <Select
              label={t('quote_expiry_band')}
              value={expiryBand}
              onChange={(e) => setExpiryBand(e.target.value as 'under12' | 'over12')}
            >
              <option value="over12">{t('cond_expiry_over12')}</option>
              <option value="under12">{t('cond_expiry_under12')}</option>
            </Select>
            <Select
              label={t('quote_provenance')}
              value={provenance}
              onChange={(e) => setProvenance(e.target.value as 'auth' | 'company')}
            >
              <option value="auth">{t('cond_provenance_auth')}</option>
              <option value="company">{t('cond_provenance_company')}</option>
            </Select>
            <Select
              label={t('quote_delivery_band')}
              value={deliveryBand}
              onChange={(e) => setDeliveryBand(e.target.value as '48h' | '2-5d')}
            >
              <option value="48h">{t('cond_delivery_48h')}</option>
              <option value="2-5d">{t('cond_delivery_2_5d')}</option>
            </Select>
            {provenance === 'auth' && (
              <Input
                label={t('quote_batch')}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            )}

            {error && <Note tone="urgent">{error}</Note>}

            <Button
              fullWidth
              loading={submitting}
              disabled={!selection || selection.allPacks}
              icon={<FiSend />}
              onClick={() => {
                if (!selection || selection.allPacks || !selection.skuId) return;
                const rate = Number(ratePaise);
                const qtyNum = Number(qty);
                const moq = Number(moqExact) || 1;
                if (!rate || !qtyNum) return;
                if (provenance === 'auth' && !batch) {
                  setError(t('listing_batch_required'));
                  return;
                }
                setSubmitting(true);
                setError(null);
                const input: CreateListingInput = {
                  productId: selection.productId,
                  scopeType,
                  lines: [
                    {
                      skuId: selection.skuId,
                      ratePaise: rate,
                      expiryBand,
                      moqExact: moq,
                      deliveryBand,
                      provenance,
                      batch: provenance === 'auth' ? batch : undefined,
                      qty: qtyNum,
                    },
                  ],
                };
                callApi((token) => postListing(token, input))
                  .then(() => router.push('/seller/stock'))
                  .catch((err: unknown) => {
                    setError(err instanceof ApiError ? err.message : 'Something went wrong.');
                    setSubmitting(false);
                  });
              }}
            >
              {t('listing_submit')}
            </Button>
          </div>
        </Card>
      </main>
    </Gate>
  );
}
