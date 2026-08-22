'use client';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary:
    'surface-gradient border-2 border-ink-900 text-paper-50 shadow-sticker hover:shadow-stickerLg disabled:shadow-none',
  secondary:
    'border-2 border-hairline bg-surface text-ink-700 shadow-sticker hover:border-ink-900 hover:text-ink-900',
  ghost: 'text-ink-600 hover:bg-veil/[0.07]',
  danger: 'border-2 border-red-300 bg-red-100 text-red-800 shadow-sticker hover:bg-red-200',
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
      className={`pressable touch-target inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3.5
        text-sm font-extrabold tracking-tight
        disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
        focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300
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
