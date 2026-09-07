const STORAGE_KEY = 'trifid_device_fingerprint';

/**
 * A random, non-secret device identifier used only to tell API-002's
 * NEW_DEVICE step-up apart from a returning device — not an auth token, so
 * localStorage is the right place for it (TD-006's "never localStorage" rule
 * is about the refresh token, not this).
 */
export function getDeviceFingerprint(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const generated = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    // Private browsing / storage blocked — fall back to a per-session value.
    return crypto.randomUUID();
  }
}
