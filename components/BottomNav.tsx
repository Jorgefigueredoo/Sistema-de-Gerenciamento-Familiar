'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string; icon: string };

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Hoje', icon: '📅' },
  { href: '/semana', label: 'Semana', icon: '🗓️' },
  { href: '/delegado', label: 'Delegado', icon: '🤝' },
];

export function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href.startsWith('/admin')) return pathname.startsWith('/admin');
  return pathname.startsWith(href);
}

/** Barra flutuante do celular. No desktop quem manda é a Sidebar. */
export function BottomNav({
  canCreate,
  adminHref,
}: {
  canCreate: boolean;
  adminHref: string | null;
}) {
  const pathname = usePathname();

  const items = [...NAV_ITEMS];
  if (adminHref) items.push({ href: adminHref, label: 'Ajustes', icon: '⚙️' });

  // O botão "+" fica no meio, ao alcance do polegar.
  const middle = Math.ceil(items.length / 2);
  const left = canCreate ? items.slice(0, middle) : items;
  const right = canCreate ? items.slice(middle) : [];

  return (
    <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-3 lg:hidden">
      <nav
        aria-label="Navegação principal"
        className="pointer-events-auto mx-auto flex max-w-md items-center justify-around gap-1
          rounded-full border border-white/80 bg-white/85 px-2 py-1.5 shadow-nav backdrop-blur-xl"
      >
        {left.map((item) => (
          <NavButton key={item.href} item={item} active={isNavActive(pathname, item.href)} />
        ))}

        {canCreate && (
          <Link
            href="/nova-tarefa"
            aria-label="Nova tarefa"
            className="pressable surface-gradient -my-3 flex h-14 w-14 shrink-0 items-center justify-center
              rounded-full text-white shadow-glow"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}

        {right.map((item) => (
          <NavButton key={item.href} item={item} active={isNavActive(pathname, item.href)} />
        ))}
      </nav>
    </div>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`pressable flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full
        px-1 py-1.5 text-[10px] font-bold transition
        ${active ? 'bg-brand-50 text-brand-700' : 'text-ink-400 hover:text-ink-600'}`}
    >
      <span className={`text-lg transition ${active ? 'scale-110' : ''}`} aria-hidden>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
