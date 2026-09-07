'use client';

import type { ReactNode } from 'react';
import type { AsyncState } from '../lib/useAsyncData';
import { useLocale } from '../providers/LocaleProvider';

interface AsyncBoundaryProps<T> {
  state: AsyncState<T>;
  onRetry: () => void;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
}

/** Mirrors trifid-adminapp's component of the same name — see its comment. */
export function AsyncBoundary<T>({
  state,
  onRetry,
  emptyMessage,
  children,
}: AsyncBoundaryProps<T>) {
  const { t } = useLocale();

  switch (state.status) {
    case 'loading':
      return (
        <p className="page-state" role="status">
          {t('loading')}
        </p>
      );
    case 'success':
      return <>{children(state.data)}</>;
    case 'empty':
      return <p className="page-state">{emptyMessage ?? 'Nothing here yet.'}</p>;
    case 'validation_error':
      return (
        <div className="page-state page-state--error" role="alert">
          <p>{state.message}</p>
        </div>
      );
    case 'authorization_error':
      return (
        <div className="page-state page-state--error" role="alert">
          <p>{state.message}</p>
        </div>
      );
    case 'authentication_error':
      // A parent Gate catches this via the session going anonymous and
      // redirects to /login; this is the fallback if rendered standalone.
      return (
        <div className="page-state page-state--error" role="alert">
          <p>Your session has expired. Please sign in again.</p>
        </div>
      );
    case 'network_error':
      return (
        <div className="page-state page-state--error" role="alert">
          <p>{t('network_error')}</p>
          <button type="button" onClick={onRetry}>
            {t('retry')}
          </button>
        </div>
      );
    case 'server_error':
      return (
        <div className="page-state page-state--error" role="alert">
          <p>{state.message}</p>
          {state.retryable && (
            <button type="button" onClick={onRetry}>
              {t('retry')}
            </button>
          )}
        </div>
      );
    default:
      return null;
  }
}
