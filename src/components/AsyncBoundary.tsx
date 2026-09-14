'use client';

import type { ReactNode } from 'react';
import type { AsyncState } from '../lib/useAsyncData';
import { useLocale } from '../providers/LocaleProvider';
import { Loader } from './ui/Loader';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';

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
      return <Loader label={t('loading')} />;
    case 'success':
      return <>{children(state.data)}</>;
    case 'empty':
      return <EmptyState message={emptyMessage ?? 'Nothing here yet.'} />;
    case 'validation_error':
      return <ErrorState message={state.message} />;
    case 'authorization_error':
      return <ErrorState message={state.message} />;
    case 'authentication_error':
      // A parent Gate catches this via the session going anonymous and
      // redirects to /login; this is the fallback if rendered standalone.
      return <ErrorState message="Your session has expired. Please sign in again." />;
    case 'network_error':
      return (
        <ErrorState
          message={t('network_error')}
          onRetry={onRetry}
          retryLabel={t('retry')}
          network
        />
      );
    case 'server_error':
      return (
        <ErrorState
          message={state.message}
          onRetry={state.retryable ? onRetry : undefined}
          retryLabel={t('retry')}
        />
      );
    default:
      return null;
  }
}
