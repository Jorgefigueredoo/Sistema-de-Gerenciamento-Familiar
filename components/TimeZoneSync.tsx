'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TIMEZONE_COOKIE } from '@/lib/timezone-cookie';

/**
 * Conta ao servidor em que fuso o navegador está.
 *
 * O servidor não tem como saber isso sozinho — em produção ele roda em
 * UTC. Gravamos o fuso num cookie e recarregamos a rota uma única vez,
 * só quando ele muda (primeiro acesso, ou viagem para outro fuso).
 */
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    let timeZone: string | undefined;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!timeZone) return;

    const current = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${TIMEZONE_COOKIE}=`))
      ?.slice(TIMEZONE_COOKIE.length + 1);

    if (current === timeZone) return;

    // Um ano: o fuso de uma família não muda com frequência.
    document.cookie = `${TIMEZONE_COOKIE}=${timeZone}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
