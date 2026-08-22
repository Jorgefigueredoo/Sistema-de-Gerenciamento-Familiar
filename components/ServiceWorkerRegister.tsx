'use client';

import { useEffect } from 'react';

/**
 * Registra o service worker (só em produção — em dev ele atrapalha o
 * hot reload). É o que torna o app instalável e utilizável offline.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sem service worker o app continua funcionando normalmente.
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
