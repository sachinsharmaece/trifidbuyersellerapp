'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gate } from '../../../../components/Gate';
import { LocaleToggle } from '../../../../components/LocaleToggle';
import { CatalogPicker, type CatalogSelection } from '../../../../components/CatalogPicker';
import { Note } from '../../../../components/Note';
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
  const [batch, setBatch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryBand = provenance === 'auth' ? '48h' : '2-5d';

  return (
    <Gate>
      <main>
        <header className="page-header">
          <h1>{t('create_listing_title')}</h1>
          <LocaleToggle />
        </header>

        <CatalogPicker onChange={setSelection} />

        <label>
          {t('listing_scope_label')}
          <select value={scopeType} onChange={(e) => setScopeType(e.target.value as ScopeChoice)}>
            <option value="my_area">{t('listing_scope_my_area')}</option>
            <option value="all_india">{t('listing_scope_all_india')}</option>
            <option value="all_except_mine">{t('listing_scope_all_except_mine')}</option>
          </select>
        </label>

        <label>
          {t('listing_rate_label')}
          <input type="number" value={ratePaise} onChange={(e) => setRatePaise(e.target.value)} />
        </label>
        <label>
          {t('listing_qty_label')}
          <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </label>
        <label>
          {t('listing_moq_label')}
          <input
            type="number"
            min={1}
            value={moqExact}
            onChange={(e) => setMoqExact(e.target.value)}
          />
        </label>
        <p className="hint">{t('listing_moq_hint')}</p>

        <label>
          {t('quote_expiry_band')}
          <select
            value={expiryBand}
            onChange={(e) => setExpiryBand(e.target.value as 'under12' | 'over12')}
          >
            <option value="over12">{t('cond_expiry_over12')}</option>
            <option value="under12">{t('cond_expiry_under12')}</option>
          </select>
        </label>
        <label>
          {t('quote_provenance')}
          <select
            value={provenance}
            onChange={(e) => setProvenance(e.target.value as 'auth' | 'company')}
          >
            <option value="auth">{t('cond_provenance_auth')}</option>
            <option value="company">{t('cond_provenance_company')}</option>
          </select>
        </label>
        {provenance === 'auth' && (
          <label>
            {t('quote_batch')}
            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} />
          </label>
        )}

        {error && <Note tone="urgent">{error}</Note>}

        <button
          type="button"
          disabled={submitting || !selection || selection.allPacks}
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
        </button>
      </main>
    </Gate>
  );
}
