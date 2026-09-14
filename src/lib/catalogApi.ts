import { apiFetch } from './apiClient';

// BR-111 — the one cascading picker: technical → company → product → pack.
// API-020–023.

export function getTechnicals(accessToken: string): Promise<string[]> {
  return apiFetch('/catalog/technicals', { accessToken });
}

export interface ManufacturerOption {
  manufacturerId: string;
  name: string;
}
export function getManufacturers(
  accessToken: string,
  technical: string,
): Promise<ManufacturerOption[]> {
  return apiFetch(`/catalog/manufacturers?technical=${encodeURIComponent(technical)}`, {
    accessToken,
  });
}

export interface ProductOption {
  productId: string;
  brand: string;
  hsn: string;
  class: string;
}
export function getProducts(
  accessToken: string,
  technical: string,
  manufacturerId?: string,
): Promise<ProductOption[]> {
  const qs = new URLSearchParams({ technical });
  if (manufacturerId) qs.set('manufacturer', manufacturerId);
  return apiFetch(`/catalog/products?${qs.toString()}`, { accessToken });
}

export interface SkuOption {
  skuId: string;
  packLabel: string;
  packSize: number;
  baseUnit: string;
  unitsPerBox: number;
  baseUnitsPerBox: number;
}
export function getSkus(accessToken: string, productId: string): Promise<SkuOption[]> {
  return apiFetch(`/catalog/products/${productId}/skus`, { accessToken });
}
