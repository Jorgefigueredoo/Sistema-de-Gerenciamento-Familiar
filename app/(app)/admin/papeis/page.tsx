import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { RolesManager, type RoleRow } from '@/components/admin/RolesManager';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Permission, Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  await requirePermission('manage_roles');
  const supabase = createClient();

  const [rolesResult, permissionsResult, linksResult, profilesResult] = await Promise.all([
    supabase.from('roles').select('*').order('name', { ascending: true }),
    supabase.from('permissions').select('*').order('key', { ascending: true }),
    supabase.from('role_permissions').select('role_id, permission_id'),
    supabase.from('profiles').select('role_id'),
  ]);

  const error =
    rolesResult.error?.message ??
    permissionsResult.error?.message ??
    linksResult.error?.message ??
    null;

  const links = linksResult.data ?? [];
  const peopleByRole = new Map<string, number>();
  for (const profile of profilesResult.data ?? []) {
    if (!profile.role_id) continue;
    peopleByRole.set(profile.role_id, (peopleByRole.get(profile.role_id) ?? 0) + 1);
  }

  const roles: RoleRow[] = ((rolesResult.data ?? []) as Role[]).map((role) => ({
    ...role,
    permissionIds: links.filter((l) => l.role_id === role.id).map((l) => l.permission_id),
    peopleCount: peopleByRole.get(role.id) ?? 0,
  }));

  const permissions = (permissionsResult.data ?? []) as Permission[];

  return (
    <>
      <PageTitle
        title="Papéis e permissões"
        subtitle="Toque em um papel para marcar o que ele pode fazer"
      />

      <ErrorBanner
        message={error ? `Não foi possível carregar: ${error}` : null}
        className="mb-4"
      />

      <RolesManager roles={roles} permissions={permissions} />
    </>
  );
}
