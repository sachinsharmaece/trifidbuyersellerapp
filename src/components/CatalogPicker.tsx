'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '../providers/LocaleProvider';
import { useSession } from '../providers/SessionProvider';
import {
  getManufacturers,
  getProducts,
  getSkus,
  getTechnicals,
  type ManufacturerOption,
  type ProductOption,
  type SkuOption,
} from '../lib/catalogApi';

export interface CatalogSelection {
  technical: string;
  manufacturerId?: string;
  productId: string;
  skuId?: string; // absent when `allPacks` is chosen.
  allPacks: boolean;
}

/**
 * BR-111 — the one cascading picker used everywhere a technical/product/pack
 * is chosen: technical → company (optional filter) → product → pack. Reuses
 * the same `/catalog/*` endpoints the admin app's product setup uses.
 * `allowAllPacks` is only true on the buyer's ask screen (BR-121 — an ask
 * can cover every pack of a product); a seller listing or quote always names
 * one SKU.
 */
export function CatalogPicker({
  allowAllPacks = false,
  onChange,
}: {
  allowAllPacks?: boolean;
  onChange: (selection: CatalogSelection | null) => void;
}) {
  const { t } = useLocale();
  const { callApi } = useSession();

  const [technicals, setTechnicals] = useState<string[]>([]);
  const [technical, setTechnical] = useState('');
  const [manufacturers, setManufacturers] = useState<ManufacturerOption[]>([]);
  const [manufacturerId, setManufacturerId] = useState('');
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState('');
  const [skus, setSkus] = useState<SkuOption[]>([]);
  const [skuId, setSkuId] = useState('');
  const [wantsAllPacks, setWantsAllPacks] = useState(false);

  useEffect(() => {
    void callApi((token) => getTechnicals(token)).then(setTechnicals);
  }, [callApi]);

  useEffect(() => {
    // Cascading reset: a new `technical` invalidates every step downstream
    // of it, so their selections are cleared here rather than left stale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManufacturerId('');
    setProducts([]);
    setProductId('');
    if (!technical) {
      setManufacturers([]);
      return;
    }
    void callApi((token) => getManufacturers(token, technical)).then(setManufacturers);
  }, [technical, callApi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProductId('');
    if (!technical) {
      setProducts([]);
      return;
    }
    void callApi((token) => getProducts(token, technical, manufacturerId || undefined)).then(
      setProducts,
    );
  }, [technical, manufacturerId, callApi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkuId('');
    setWantsAllPacks(false);
    if (!productId) {
      setSkus([]);
      return;
    }
    void callApi((token) => getSkus(token, productId)).then(setSkus);
  }, [productId, callApi]);

  useEffect(() => {
    if (!productId || (!skuId && !wantsAllPacks)) {
      onChange(null);
      return;
    }
    onChange({
      technical,
      manufacturerId: manufacturerId || undefined,
      productId,
      skuId: wantsAllPacks ? undefined : skuId,
      allPacks: wantsAllPacks,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technical, manufacturerId, productId, skuId, wantsAllPacks]);

  return (
    <div className="catalog-picker">
      <label>
        {t('pick_technical')}
        <select value={technical} onChange={(e) => setTechnical(e.target.value)}>
          <option value="">{t('pick_choose')}</option>
          {technicals.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </label>

      {technical && manufacturers.length > 0 && (
        <label>
          {t('pick_company')}
          <select value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
            <option value="">{t('pick_any_company')}</option>
            {manufacturers.map((m) => (
              <option key={m.manufacturerId} value={m.manufacturerId}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {technical && products.length > 0 && (
        <label>
          {t('pick_product')}
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">{t('pick_choose')}</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.brand}
              </option>
            ))}
          </select>
        </label>
      )}

      {productId && skus.length > 0 && (
        <label>
          {t('pick_pack')}
          <select
            value={wantsAllPacks ? 'all' : skuId}
            onChange={(e) => {
              if (e.target.value === 'all') {
                setWantsAllPacks(true);
                setSkuId('');
              } else {
                setWantsAllPacks(false);
                setSkuId(e.target.value);
              }
            }}
          >
            <option value="">{t('pick_choose')}</option>
            {allowAllPacks && <option value="all">{t('pick_all_packs')}</option>}
            {skus.map((sku) => (
              <option key={sku.skuId} value={sku.skuId}>
                {sku.packLabel}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
