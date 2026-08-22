import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { TimeZoneSync } from '@/components/TimeZoneSync';
import { requireSession } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const name = session.profile.name || session.profile.email;
  const roleName = session.profile.role?.name ?? null;
  const canCreate = session.permissions.includes('create_task');

  const adminHref = session.permissions.includes('manage_users')
    ? '/admin/usuarios'
    : session.permissions.includes('manage_roles')
      ? '/admin/papeis'
      : null;

  return (
    <div className="min-h-full lg:pl-64">
      <Sidebar
        name={name}
        roleName={roleName}
        canCreate={canCreate}
        adminHref={adminHref}
      />

      <AppHeader name={name} roleName={roleName} />

      {/* pb generoso no celular: a barra flutuante não pode cobrir a última tarefa */}
      <main className="mx-auto max-w-2xl px-5 pb-32 pt-5 lg:px-8 lg:pb-16 lg:pt-10">
        {children}
      </main>

      <BottomNav canCreate={canCreate} adminHref={adminHref} />

      {/* Conta ao servidor em que fuso este navegador está. */}
      <TimeZoneSync />
    </div>
  );
}
