/**
 * Nome do cookie que carrega o fuso do navegador.
 *
 * Mora sozinho aqui porque os dois lados precisam dele: `lib/timezone.ts`
 * é `server-only` e o `TimeZoneSync` roda no navegador.
 */
export const TIMEZONE_COOKIE = 'tz';
