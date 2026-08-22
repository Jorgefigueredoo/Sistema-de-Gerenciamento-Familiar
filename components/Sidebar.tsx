'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavActive, NAV_ITEMS } from '@/components/BottomNav';
import { signOut } from '@/app/actions/auth';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

/** Navegação lateral do desktop. No celular quem manda é a BottomNav. */
export function Sidebar({
  name,
  roleName,
  canCreate,
  adminHref,
}: {
  name: string;
  roleName: string | null;
  canCreate: boolean;
  adminHref: string | null;
}) {
  const pathname = usePathname();

  const items = [...NAV_ITEMS];
  if (adminHref) items.push({ href: adminHref, label: 'Ajustes', icon: '⚙️' });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink-100 bg-white/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="surface-gradient flex h-9 w-9 items-center justify-center rounded-xl text-base shadow-glow"
        >
          🗓️
        </span>
        <span className="text-sm font-extrabold tracking-tight text-ink-900">
          Agenda da Família
        </span>
      </div>

      {canCreate && (
        <Link
          href="/nova-tarefa"
          className="pressable surface-gradient mt-6 flex items-center justify-center gap-2 rounded-2xl
            px-4 py-3 text-sm font-bold text-white shadow-glow"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          Nova tarefa
        </Link>
      )}

      <nav aria-label="Navegação principal" className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition
                ${
                  active
                    ? 'bg-brand-50 text-brand-700 shadow-soft'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
                }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="surface-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              text-sm font-bold text-white"
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{name}</p>
            {roleName && <p className="truncate text-xs text-ink-400">{roleName}</p>}
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-2.5 w-full rounded-xl px-3 py-2 text-xs font-bold text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
          >
            Sair
          </button>
        </form>

        <div className="mt-2 border-t border-ink-100 pt-2">
          <ThemeSwitcher />
        </div>
      </div>
    </aside>
  );
}
