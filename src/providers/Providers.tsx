'use client';

import type { ReactNode } from 'react';
import { LocaleProvider } from './LocaleProvider';
import { SessionProvider } from './SessionProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SessionProvider>{children}</SessionProvider>
    </LocaleProvider>
  );
}
