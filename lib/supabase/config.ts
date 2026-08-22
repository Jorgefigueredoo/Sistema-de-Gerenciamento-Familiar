/**
 * O Supabase renomeou as chaves de API: o que era "anon key" virou
 * "publishable key" (sb_publishable_...), e "service_role" virou
 * "secret key" (sb_secret_...). As duas gerações funcionam, então
 * aceitamos os dois nomes de variável e você cola o que o painel mostrar.
 *
 * Importante: variáveis NEXT_PUBLIC_ são substituídas no build, por isso
 * precisam aparecer escritas por extenso — nada de process.env[nome].
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  '';

/** Só no servidor: ignora RLS. Nunca exponha para o navegador. */
export const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? '';
