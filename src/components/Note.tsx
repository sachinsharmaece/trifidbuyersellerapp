import type { ReactNode } from 'react';

export type NoteTone = 'default' | 'urgent' | 'wait';

const CLASS_BY_TONE: Record<NoteTone, string> = {
  default: 'note',
  urgent: 'note note-urgent',
  wait: 'note note-wait',
};

export function Note({ tone = 'default', children }: { tone?: NoteTone; children: ReactNode }) {
  return (
    <p className={CLASS_BY_TONE[tone]} role={tone === 'urgent' ? 'alert' : undefined}>
      {children}
    </p>
  );
}
