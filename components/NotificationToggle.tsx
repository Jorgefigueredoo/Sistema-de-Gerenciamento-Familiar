'use client';

import { useEffect, useState } from 'react';
import { subscribeToPush, unsubscribeFromPush } from '@/app/actions/notifications';

type Status = 'checking' | 'off' | 'on' | 'busy' | 'unsupported';

/** Chave pública VAPID → formato que `pushManager.subscribe` espera. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

/**
 * Sino de lembretes: ativa/desativa notificação push neste aparelho.
 * Mesmo espírito do ThemeSwitcher — botão compacto no header/sidebar.
 */
export function NotificationToggle({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  /** O botão está sobre a tinta escura da Sidebar, não sobre papel. */
  onDark?: boolean;
}) {
  const [status, setStatus] = useState<Status>('checking');
  const [error, setError] = useState<string | null>(null);
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!publicKey || !('PushManager' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? 'on' : 'off'))
      .catch(() => setStatus('off'));
  }, [publicKey]);

  // Servidor e primeira renderização do cliente concordam em "checking" — o
  // sumiço por falta de suporte só acontece depois, sem gerar mismatch de hidratação.
  if (!publicKey || status === 'unsupported') return null;

  async function toggle() {
    if (status === 'busy' || status === 'checking' || !publicKey) return;
    setError(null);
    setStatus('busy');

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        await unsubscribeFromPush(existing.endpoint);
        await existing.unsubscribe();
        setStatus('off');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permita notificações nas configurações do navegador para ativar os lembretes.');
        setStatus('off');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const result = await subscribeToPush(
        subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } },
      );

      if (!result.ok) {
        await subscription.unsubscribe();
        setError(result.error);
        setStatus('off');
        return;
      }

      setStatus('on');
    } catch {
      setError('Não foi possível ativar os lembretes agora. Tente de novo.');
      setStatus('off');
    }
  }

  const label = status === 'on' ? 'Desativar lembretes' : 'Ativar lembretes de tarefas';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={status === 'busy' || status === 'checking'}
        aria-label={label}
        aria-pressed={status === 'on'}
        title={label}
        className={`pressable touch-target flex items-center justify-center rounded-xl text-lg transition
          disabled:cursor-not-allowed disabled:opacity-60
          ${compact ? 'px-2' : 'w-full gap-2 px-3 py-2 text-xs font-extrabold'}
          ${
            onDark
              ? 'text-white/55 hover:bg-white/10 hover:text-white'
              : 'text-ink-500 hover:bg-veil/[0.07] hover:text-ink-800'
          }`}
      >
        <span aria-hidden>{status === 'on' ? '🔔' : '🔕'}</span>
        {!compact && <span>Lembretes: {status === 'on' ? 'Ativados' : 'Desativados'}</span>}
      </button>

      {error && (
        <div
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-3xl border-2 border-red-300 bg-red-100 p-3 text-xs font-bold text-red-800 shadow-lift"
        >
          {error}
        </div>
      )}
    </div>
  );
}
