'use client';

import { useTheme, type Theme } from '@/components/ThemeProvider';

const OPTIONS: { value: Theme; label: string; icon: string; description: string }[] = [
  { value: 'light', label: 'Claro', icon: '☀️', description: 'Sempre claro' },
  { value: 'dark', label: 'Escuro', icon: '🌙', description: 'Mais confortável à noite' },
  { value: 'system', label: 'Sistema', icon: '🖥️', description: 'Acompanha o aparelho' },
];

export function ThemeSwitcher({
  compact = false,
  placement = 'up',
}: {
  compact?: boolean;
  placement?: 'up' | 'down';
}) {
  const { theme, setTheme } = useTheme();
  const selected = OPTIONS.find((option) => option.value === theme)!;

  function choose(nextTheme: Theme, target: HTMLButtonElement) {
    setTheme(nextTheme);
    target.closest('details')?.removeAttribute('open');
  }

  return (
    <details className="relative">
      <summary
        className={`pressable touch-target flex cursor-pointer list-none items-center rounded-xl text-ink-500 transition hover:bg-ink-100 hover:text-ink-800
          ${compact ? 'justify-center px-2 text-lg' : 'w-full gap-2 px-3 py-2 text-xs font-bold'}`}
        aria-label="Alterar tema"
      >
        <span aria-hidden>{selected.icon}</span>
        {!compact && <span>Tema: {selected.label}</span>}
      </summary>

      <div
        className={`absolute right-0 z-50 w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-lift backdrop-blur-xl
          ${placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
      >
        <p className="px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
          Aparência
        </p>
        {OPTIONS.map((option) => {
          const active = option.value === theme;
          return (
            <button
              key={option.value}
              type="button"
              onClick={(event) => choose(option.value, event.currentTarget)}
              className={`pressable flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition
                ${active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-base shadow-soft" aria-hidden>
                {option.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{option.label}</span>
                <span className="block text-[11px] font-medium opacity-70">{option.description}</span>
              </span>
              {active && <span className="text-sm" aria-label="Selecionado">✓</span>}
            </button>
          );
        })}
      </div>
    </details>
  );
}
