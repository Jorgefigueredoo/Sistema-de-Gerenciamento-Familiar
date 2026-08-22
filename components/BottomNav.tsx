'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string; icon: string };

const BASE: Item[] = [
  { href: '/', label: 'Hoje', icon: '📅' },
  { href: '/semana', label: 'Semana', icon: '🗓️' },
  { href: '/delegado', label: 'Delegado', icon: '🤝' },
];

export function BottomNav({
  canCreate,
  adminHref,
}: {
  canCreate: boolean;
  adminHref: string | null;
}) {
  const pathname = usePathname();

  const items: Item[] = [...BASE];
  if (adminHref) items.push({ href: adminHref, label: 'Ajustes', icon: '⚙️' });

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/admin')) return pathname.startsWith('/admin');
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto flex max-w-lg items-stretch justify-around px-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition
                ${active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {canCreate && (
        <Link
          href="/nova-tarefa"
          aria-label="Nova tarefa"
          className="absolute -top-7 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-3xl leading-none text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-95"
        >
          <span aria-hidden className="-mt-0.5">
            +
          </span>
        </Link>
      )}
    </nav>
  );
}
