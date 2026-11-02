import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { FiLoader } from 'react-icons/fi';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-500/50 disabled:shadow-none',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-brand-600 disabled:text-slate-400',
  danger:
    'bg-danger-500 text-white shadow-sm hover:bg-danger-600 focus-visible:outline-danger-600 disabled:bg-danger-500/50 disabled:shadow-none',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-brand-600 disabled:text-slate-300',
};

// Heights sized for a thumb: 36px for a small button, 44px (the touch-target minimum) otherwise.
const SIZE_CLASSES: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-11 px-4 py-2.5 text-sm gap-2',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function buttonClasses(variant: Variant, size: Size, fullWidth: boolean, className: string) {
  return `${BASE_CLASSES} ${fullWidth ? 'w-full' : ''} ${VARIANT_CLASSES[variant]} ${
    SIZE_CLASSES[size]
  } ${className}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

/** The one button in the app — every action goes through this. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, fullWidth, className)}
      {...rest}
    >
      {loading ? <FiLoader className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

/**
 * A link that looks like a Button — for "go to the next screen" actions. A real link (not a
 * button inside a link, which is invalid and announced twice by screen readers), so it can
 * also be long-pressed or opened in a new tab.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, size, fullWidth, className)}>
      {icon}
      {children}
    </Link>
  );
}
