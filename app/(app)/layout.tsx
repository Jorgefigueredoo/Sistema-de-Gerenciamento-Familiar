import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { requireSession } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const adminHref = session.permissions.includes('manage_users')
    ? '/admin/usuarios'
    : session.permissions.includes('manage_roles')
      ? '/admin/papeis'
      : null;

  return (
    <div className="min-h-full">
      <AppHeader
        name={session.profile.name || session.profile.email}
        roleName={session.profile.role?.name ?? null}
      />

      {/* pb generoso: a barra de baixo não pode cobrir a última tarefa */}
      <main className="mx-auto max-w-lg px-5 pb-32 pt-5">{children}</main>

      <BottomNav
        canCreate={session.permissions.includes('create_task')}
        adminHref={adminHref}
      />
    </div>
  );
}
