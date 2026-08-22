'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { createClient } from '@/lib/supabase/client';

export default function NewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As duas senhas não são iguais.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.replace('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Nova senha</h1>
        <p className="mt-1.5 text-sm text-ink-500">Escolha uma senha que você lembre.</p>

        <div className="mt-6 rounded-5xl border-2 border-hairline/70 bg-surface p-6 shadow-stickerLg">
          {checking ? (
            <div className="h-40 animate-pulse rounded-2xl bg-sunken" />
          ) : !hasSession ? (
            <ErrorBanner message="Este link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”." />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block">
                <span className="label">Senha nova</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                />
              </label>

              <label className="block">
                <span className="label">Repita a senha</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="field"
                />
              </label>

              <ErrorBanner message={error} />

              <Button type="submit" full loading={loading}>
                Salvar senha
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
