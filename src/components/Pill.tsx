import type { ReactNode } from 'react';

export type PillTone = 'neutral' | 'good' | 'warn' | 'bad';

const TONE_CLASSES: Record<PillTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  good: 'bg-success-50 text-success-600',
  warn: 'bg-warning-50 text-warning-600',
  bad: 'bg-danger-50 text-danger-600',
};

/**
 * A small status/tag badge — the one place tone-to-colour mapping lives.
 * `data-testid="pill"` is the stable hook tests query on (not a CSS class —
 * Tailwind utility classes are an implementation detail, not a test seam).
 */
export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      data-testid="pill"
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
