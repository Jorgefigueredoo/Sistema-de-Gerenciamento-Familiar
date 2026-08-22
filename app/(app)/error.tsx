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
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-3xl" aria-hidden>
        😕
      </p>
      <h1 className="mt-2 text-lg font-bold text-red-800">Algo deu errado</h1>
      <p className="mt-1 text-sm text-red-700">
        {error.message || 'Não conseguimos carregar esta tela.'}
      </p>
      <div className="mt-4 flex justify-center">
        <Button onClick={reset}>Tentar de novo</Button>
      </div>
    </div>
  );
}
