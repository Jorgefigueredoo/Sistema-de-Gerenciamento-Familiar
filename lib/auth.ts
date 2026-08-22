import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PermissionKey, ProfileWithRole, SessionContext } from '@/types';

/**
 * Quem está logado e o que essa pessoa pode fazer.
 * Retorna null se não houver sessão válida.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const [{ data: profile }, { data: permissions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email, role_id, created_at, role:roles(id, name, description)')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.rpc('my_permissions'),
  ]);

  if (!profile) return null;

  return {
    userId: user.id,
    profile: profile as unknown as ProfileWithRole,
    permissions: (permissions as string[] | null) ?? [],
  };
}

/** Igual ao anterior, mas manda para /login se não estiver autenticado. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSessionContext();
  if (!session) redirect('/login');
  return session;
}

/** Exige uma permissão específica; sem ela, volta para a tela inicial. */
export async function requirePermission(permission: PermissionKey): Promise<SessionContext> {
  const session = await requireSession();
  if (!session.permissions.includes(permission)) {
    redirect('/?erro=sem-permissao');
  }
  return session;
}
