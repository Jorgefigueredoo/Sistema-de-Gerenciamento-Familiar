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
  onDark = false,
}: {
  compact?: boolean;
  placement?: 'up' | 'down';
  /** O gatilho está sobre a tinta escura da Sidebar, não sobre papel. */
  onDark?: boolean;
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
        className={`pressable touch-target flex cursor-pointer list-none items-center rounded-xl transition
          ${
            onDark
              ? 'text-white/55 hover:bg-white/10 hover:text-white'
              : 'text-ink-500 hover:bg-veil/[0.07] hover:text-ink-800'
          }
          ${compact ? 'justify-center px-2 text-lg' : 'w-full gap-2 px-3 py-2 text-xs font-extrabold'}`}
        aria-label="Alterar tema"
      >
        <span aria-hidden>{selected.icon}</span>
        {!compact && <span>Tema: {selected.label}</span>}
      </summary>

      <div
        className={`absolute right-0 z-50 w-64 rounded-3xl border-2 border-hairline/70 bg-surface p-2 shadow-lift backdrop-blur-xl
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
                ${active ? 'bg-ink-900 text-paper-50' : 'text-ink-600 hover:bg-veil/[0.07]'}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border-2 border-hairline bg-surface text-base" aria-hidden>
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
