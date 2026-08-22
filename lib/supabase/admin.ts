import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from '@/lib/env';

/**
 * Cliente com a chave service_role: ignora RLS.
 * Usar SOMENTE no servidor e SOMENTE depois de checar a permissão de quem
 * está chamando (ex.: manage_users antes de criar um usuário no Auth).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
