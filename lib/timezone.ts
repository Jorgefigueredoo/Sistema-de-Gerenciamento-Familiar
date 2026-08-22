import 'server-only';
import { cookies } from 'next/headers';
import { TIMEZONE_COOKIE } from '@/lib/timezone-cookie';

/** Casa é no Brasil: palpite melhor que UTC antes do cookie existir. */
const FALLBACK = 'America/Sao_Paulo';

/** O valor vem de um cookie, então é entrada não confiável. */
function isValidTimeZone(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fuso de quem está olhando a tela.
 *
 * Páginas e Server Actions rodam no servidor, e em produção esse servidor
 * é UTC. Sem isto, às 16:37 de Brasília o app diz "boa noite" (19:37 UTC)
 * e, pior, depois das 21h ele vira o dia antes da hora: a agenda marcaria
 * o dia errado como hoje e tarefas novas nasceriam com a data trocada.
 *
 * O navegador grava o fuso em um cookie (veja `TimeZoneSync`) e aqui o
 * servidor lê de volta.
 */
export function getTimeZone(): string {
  const value = cookies().get(TIMEZONE_COOKIE)?.value;
  return isValidTimeZone(value) ? value : FALLBACK;
}
