import Link from 'next/link';
import { requireSession } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const tabs = [
    { href: '/admin/usuarios', label: '👥 Pessoas', permission: 'manage_users' },
    { href: '/admin/papeis', label: '🔑 Papéis', permission: 'manage_roles' },
  ].filter((tab) => session.permissions.includes(tab.permission as never));

  return (
    <>
      {tabs.length > 1 && (
        <nav className="mb-6 flex gap-1 rounded-2xl bg-sunken/80 p-1" aria-label="Administração">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-bold text-ink-500 transition hover:bg-surface hover:text-ink-900 hover:shadow-sticker"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}

      {children}
    </>
  );
}
