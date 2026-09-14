import type { ReactNode } from 'react';

export type PillTone = 'neutral' | 'good' | 'warn' | 'bad';

/** A small status/tag badge — the one place tone-to-colour mapping lives. */
export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}
