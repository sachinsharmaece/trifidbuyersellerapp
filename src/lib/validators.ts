/**
 * Copied from trifid-serverapp/src/shared/validators.ts (API_CONTRACT.md
 * §11.2 — no shared package between repositories). Used here only for
 * instant client-side feedback; the server re-validates independently.
 */
const GSTIN_SHAPE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GSTIN_CODE_POINTS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function isValidGstin(gstin: string): boolean {
  if (!GSTIN_SHAPE.test(gstin)) return false;

  let factor = 2;
  let sum = 0;
  const mod = 36;
  for (let i = gstin.length - 2; i >= 0; i -= 1) {
    const codePoint = GSTIN_CODE_POINTS.indexOf(gstin[i]!);
    let digit = factor * codePoint;
    digit = Math.floor(digit / mod) + (digit % mod);
    sum += digit;
    factor = factor === 2 ? 1 : 2;
  }
  const checksumChar = GSTIN_CODE_POINTS[(mod - (sum % mod)) % mod];
  return checksumChar === gstin[14];
}

const IFSC_SHAPE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function isValidIfsc(ifsc: string): boolean {
  return IFSC_SHAPE.test(ifsc);
}
