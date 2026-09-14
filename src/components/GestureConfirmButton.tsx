'use client';

import { useRef, useState } from 'react';

/**
 * A plain `<button onClick>` is the whole implementation and always works on
 * its own — that is the "button fallback" the brief asks for, not an
 * afterthought. The drag-to-fill bar layered on top is a pointer-event
 * enhancement only: dragging past the threshold fires the same `onConfirm`
 * a tap would, and releasing early does nothing (never a partial action).
 * No gesture library — a 2018 Android WebView gets pointer events for free
 * from the DOM spec, so nothing here needs polyfilling.
 */
export function GestureConfirmButton({
  label,
  onConfirm,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [dragPct, setDragPct] = useState(0);
  const startX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  function reset() {
    startX.current = null;
    setDragPct(0);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null || !trackRef.current) return;
    const width = trackRef.current.clientWidth || 1;
    const delta = e.clientX - startX.current;
    const pct = Math.max(0, Math.min(1, delta / width));
    setDragPct(pct);
    if (pct >= 0.9) {
      reset();
      onConfirm();
    }
  }

  return (
    <div
      ref={trackRef}
      className="relative touch-pan-y select-none"
      onPointerDown={(e) => {
        if (disabled) return;
        startX.current = e.clientX;
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={reset}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-md bg-brand-100"
        style={{ width: `${dragPct * 100}%` }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="relative w-full rounded-md bg-brand-500 px-4 py-3 text-base font-bold text-white hover:bg-brand-600 disabled:bg-brand-500/50"
      >
        {label}
      </button>
    </div>
  );
}
