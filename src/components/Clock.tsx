'use client';

import { useEffect, useState } from 'react';

function remainingMs(targetIso: string): number {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * A countdown anchored to a server-supplied deadline (`payDeadline`,
 * `undoWindowMs`'s resulting timestamp, and so on) — never a client-started
 * timer that could drift from what the server actually enforces.
 */
export function Clock({
  targetIso,
  onExpire,
  tickMs = 1000,
}: {
  targetIso: string;
  onExpire?: () => void;
  tickMs?: number;
}) {
  const [remaining, setRemaining] = useState(() => remainingMs(targetIso));

  useEffect(() => {
    // Re-syncs to a new `targetIso` prop and starts the interval that ticks
    // it down — an external-clock sync, not a derived-from-render value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(remainingMs(targetIso));
    const interval = setInterval(() => {
      const next = remainingMs(targetIso);
      setRemaining(next);
      if (next <= 0) clearInterval(interval);
    }, tickMs);
    return () => clearInterval(interval);
  }, [targetIso, tickMs]);

  useEffect(() => {
    if (remaining <= 0) onExpire?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining <= 0]);

  return <span className="clock">{formatDuration(remaining)}</span>;
}
