'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { createClient } from '@/lib/supabase/client';

function translate(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos. Confira e tente de novo.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Esse e-mail ainda não foi confirmado. Peça para o administrador liberar o acesso.';
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Não conseguimos falar com o servidor. Verifique sua conexão.';
  }
  if (message.includes('rate limit') || message.includes('Too many')) {
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(translate(signInError.message));
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(translate(err instanceof Error ? err.message : 'Erro inesperado.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Senha</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 py-3 pl-4 pr-14 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 touch-target rounded-r-xl px-3 text-lg text-slate-400 hover:text-slate-600"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </label>

      <ErrorBanner message={error} />

      <Button type="submit" full loading={loading}>
        Entrar
      </Button>

      <Link
        href="/recuperar-senha"
        className="mx-auto text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
      >
        Esqueci minha senha
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl shadow-lg shadow-brand-600/25">
            <span aria-hidden>🗓️</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Agenda da Família
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entre para ver a rotina de hoje.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sistema privado. O acesso é criado por um administrador da família.
        </p>
      </div>
    </main>
  );
}
