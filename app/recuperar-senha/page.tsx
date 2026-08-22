'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { createClient } from '@/lib/supabase/client';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${siteUrl}/auth/callback?next=/nova-senha` },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enviamos um link para você criar uma senha nova.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {sent ? (
            <div className="text-center">
              <p className="text-3xl" aria-hidden>
                📬
              </p>
              <p className="mt-2 font-semibold text-slate-800">Link enviado</p>
              <p className="mt-1 text-sm text-slate-500">
                Se existe uma conta com <strong>{email}</strong>, o link chegou por e-mail.
                Confira também a caixa de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>

              <ErrorBanner message={error} />

              <Button type="submit" full loading={loading}>
                Enviar link
              </Button>
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-brand-600 hover:underline"
        >
          ← Voltar para o login
        </Link>
      </div>
    </main>
  );
}
