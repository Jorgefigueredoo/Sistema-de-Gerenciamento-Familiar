import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * A sessão vive nos cookies; em Server Components a escrita de cookie é
 * ignorada (o middleware cuida do refresh do token).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component não pode escrever cookie — ok, o middleware faz.
          }
        },
      },
    },
  );
}
