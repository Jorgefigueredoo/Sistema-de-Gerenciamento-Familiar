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
        <span className="label">E-mail</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="field"
        />
      </label>

      <label className="block">
        <span className="label">Senha</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field pr-14"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            className="touch-target absolute inset-y-0 right-0 flex items-center rounded-r-2xl px-3 text-lg text-ink-400 transition hover:text-ink-600"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </label>

      <ErrorBanner message={error} />

      <Button type="submit" full loading={loading} className="mt-1">
        Entrar
      </Button>

      <Link
        href="/recuperar-senha"
        className="mx-auto rounded-lg px-2 py-1 text-sm font-extrabold text-ink-500 underline decoration-accent-400 decoration-2 underline-offset-4 transition hover:text-ink-900"
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
          <div className="surface-gradient mx-auto flex h-24 w-24 items-center justify-center rounded-5xl border-2 border-ink-900 text-5xl shadow-stickerLg">
            <span aria-hidden>🗓️</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink-900">
            Agenda da Família
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            A rotina da casa, do trabalho e da família em um lugar só.
          </p>
        </div>

        <div className="rounded-5xl border-2 border-hairline/70 bg-surface p-6 shadow-stickerLg">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-sunken" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Sistema privado. O acesso é criado por um administrador da família.
        </p>
      </div>
    </main>
  );
}
