'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Painel que sobe pela parte de baixo no celular e vira modal centrado
 * no desktop. No celular fica ao alcance do polegar, bem melhor do que
 * um modal no meio da tela.
 */
export function BottomSheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="safe-bottom relative max-h-[88vh] w-full max-w-lg animate-slide-up overflow-y-auto
          rounded-t-5xl border-2 border-hairline/70 bg-surface p-5 pb-8 shadow-lift sm:rounded-5xl sm:pb-5"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-200 sm:hidden" aria-hidden />

        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="pressable -mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              border-2 border-hairline bg-surface text-lg leading-none text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
