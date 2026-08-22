'use client';

/**
 * Checkbox redondo com o "tique" desenhado em SVG.
 * O input nativo continua lá (invisível) para teclado e leitor de tela.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  color = 'bg-brand-500',
  size = 'md',
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  /** Classe de fundo quando marcado — normalmente a cor da categoria. */
  color?: string;
  size?: 'md' | 'sm';
}) {
  const box = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <label className={`relative shrink-0 cursor-pointer ${box}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />

      <span
        aria-hidden
        className={`pointer-events-none flex h-full w-full items-center justify-center rounded-full border-2
          transition duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-accent-300
          ${checked ? `${color} border-transparent` : 'border-hairline bg-surface peer-hover:border-ink-900'}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 transition duration-200 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        >
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}
