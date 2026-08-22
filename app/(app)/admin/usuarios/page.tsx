import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { UsersManager, type UserRow } from '@/components/admin/UsersManager';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await requirePermission('manage_users');
  const supabase = createClient();

  const [profilesResult, rolesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email, role_id, role:roles!profiles_role_id_fkey(name)')
      .order('name', { ascending: true }),
    supabase.from('roles').select('*').order('name', { ascending: true }),
  ]);

  const error = profilesResult.error?.message ?? rolesResult.error?.message ?? null;

  type ProfileRow = {
    id: string;
    name: string;
    email: string;
    role_id: string | null;
    role: { name: string } | null;
  };

  const users: UserRow[] = ((profilesResult.data ?? []) as unknown as ProfileRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role_id: p.role_id,
    roleName: p.role?.name ?? null,
  }));

  const roles = (rolesResult.data ?? []) as Role[];

  return (
    <>
      <PageTitle
        title="Pessoas"
        subtitle={`${users.length} pessoa${users.length === 1 ? '' : 's'} com acesso`}
      />

      <ErrorBanner
        message={error ? `Não foi possível carregar: ${error}` : null}
        className="mb-4"
      />

      <UsersManager users={users} roles={roles} currentUserId={session.userId} />
    </>
  );
}
