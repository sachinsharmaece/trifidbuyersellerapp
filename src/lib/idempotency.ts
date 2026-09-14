/**
 * API_CONTRACT.md §1 — a fresh key per distinct action. `crypto.randomUUID`
 * is not on every 2018-era Android WebView (ARCHITECTURE.md §M2's device
 * floor), so this falls back to a `Math.random`-based id rather than
 * assuming it.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
