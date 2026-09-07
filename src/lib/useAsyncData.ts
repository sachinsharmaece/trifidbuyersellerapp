import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './apiErrors';

/**
 * ARCHITECTURE.md §7.2 — every screen that loads data handles all eight
 * states: loading, success, empty, validation error, authorization error,
 * authentication error, server error, network failure. Mirrors
 * trifid-adminapp's src/lib/useAsyncData.ts — copied, not shared, per
 * API_CONTRACT.md §11.2 (no shared package between repositories).
 */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'validation_error'; message: string }
  | { status: 'authorization_error'; message: string }
  | { status: 'authentication_error' }
  | { status: 'server_error'; message: string; retryable: boolean }
  | { status: 'network_error' };

function toAsyncState<T>(error: unknown): AsyncState<T> {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return { status: 'network_error' };
      case 'VALIDATION_FAILED':
        return { status: 'validation_error', message: error.message };
      case 'NOT_VISIBLE':
        return { status: 'authorization_error', message: error.message };
      case 'REAUTH_REQUIRED':
      case 'SESSION_REPLACED':
        return { status: 'authentication_error' };
      default:
        return { status: 'server_error', message: error.message, retryable: error.retryable };
    }
  }
  return {
    status: 'server_error',
    message: 'Something went wrong. Please try again.',
    retryable: true,
  };
}

function sameDeps(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * `deps` is caller-supplied and variable-length, which Next.js's stricter
 * react-hooks lint (`react-hooks/exhaustive-deps`) will not accept as a
 * `useEffect`/`useCallback` dependency array literal. Instead this effect
 * has no dependency array at all — it runs after every render — and does
 * its own shallow-equality check against the previous `deps` (kept in a
 * ref) to decide whether to actually reload.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  isEmpty: (data: T) => boolean,
  deps: unknown[],
): { state: AsyncState<T>; retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);
  const previousDeps = useRef<unknown[] | null>(null);

  // No dependency array on purpose (see the function comment above): the
  // `sameDeps` guard inside is what actually prevents the "infinite chain of
  // updates" this rule warns about — passing `loader`/`isEmpty` here would
  // defeat the point, since callers rarely memoize them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const currentDeps = [...deps, retryCount];
    if (previousDeps.current && sameDeps(previousDeps.current, currentDeps)) {
      return;
    }
    previousDeps.current = currentDeps;

    setState({ status: 'loading' });
    loader()
      .then((data) => {
        setState(isEmpty(data) ? { status: 'empty' } : { status: 'success', data });
      })
      .catch((error: unknown) => {
        setState(toAsyncState<T>(error));
      });
  });

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  return { state, retry };
}
