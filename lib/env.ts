import { SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, SUPABASE_URL } from '@/lib/supabase/config';

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? '';

/** Leitura centralizada das variáveis de ambiente, com erro legível. */

function required(name: string, value: string): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Copie .env.example para .env.local e preencha.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)',
      SUPABASE_ANON_KEY,
    );
  },
  get supabaseServiceRoleKey() {
    return required(
      'SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY)',
      SUPABASE_SERVICE_KEY,
    );
  },
  get vapidPrivateKey() {
    return required('VAPID_PRIVATE_KEY', VAPID_PRIVATE_KEY);
  },
  get vapidSubject() {
    return required('VAPID_SUBJECT', VAPID_SUBJECT);
  },
};
