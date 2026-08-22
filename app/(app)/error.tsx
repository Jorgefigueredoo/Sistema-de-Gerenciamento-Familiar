'use client';

import { Button } from '@/components/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-5xl border-2 border-red-300 bg-surface p-8 text-center shadow-sticker">
      <div
        aria-hidden
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-3xl"
      >
        😕
      </div>
      <h1 className="mt-4 text-lg font-extrabold text-ink-900">Algo deu errado</h1>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
        {error.message || 'Não conseguimos carregar esta tela.'}
      </p>
      <div className="mt-6 flex justify-center">
        <Button onClick={reset}>Tentar de novo</Button>
      </div>
    </div>
  );
}
