import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sem conexão' };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-soft">
        <span className="text-4xl" aria-hidden>
          📡
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">Você está offline</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-500">
        A agenda precisa de internet para buscar as tarefas de hoje. Assim que a conexão voltar,
        é só recarregar.
      </p>
    </main>
  );
}
