import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

/** A styled wrapper around plain `<table>` markup — see trifid-adminapp's identical component. */
export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className={`w-full border-collapse text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function Th({ className = '', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600 ${className}`}
      {...rest}
    />
  );
}

export function Td({ className = '', ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`border-b border-slate-100 px-3 py-2 text-slate-800 ${className}`} {...rest} />
  );
}
