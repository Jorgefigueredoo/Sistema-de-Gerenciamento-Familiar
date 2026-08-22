'use client';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary:
    'surface-gradient text-white shadow-glow hover:brightness-110 disabled:shadow-none disabled:brightness-100',
  secondary: 'border border-ink-200 bg-white text-ink-700 shadow-soft hover:border-ink-300',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  full?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  full = false,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`pressable touch-target inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3
        text-sm font-bold tracking-tight
        disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
        focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200
        ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
