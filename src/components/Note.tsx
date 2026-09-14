import type { ReactNode } from 'react';

export type NoteTone = 'default' | 'urgent' | 'wait';

const TONE_CLASSES: Record<NoteTone, string> = {
  default: 'bg-brand-50 text-brand-700',
  urgent: 'bg-danger-50 text-danger-600',
  wait: 'bg-warning-50 text-warning-600',
};

export function Note({ tone = 'default', children }: { tone?: NoteTone; children: ReactNode }) {
  return (
    <p
      className={`rounded-md px-3 py-2 text-sm ${TONE_CLASSES[tone]}`}
      role={tone === 'urgent' ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}
