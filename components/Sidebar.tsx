'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavActive, NAV_ITEMS } from '@/components/BottomNav';
import { signOut } from '@/app/actions/auth';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

/**
 * Navegação lateral do desktop. No celular quem manda é a BottomNav.
 *
 * Ela é tinta, não papel: pela regra do tema, o que é moldura do app fica
 * escuro e a cor fica reservada para o conteúdo. Por isso as classes aqui
 * são `white/xx` e `accent`, e não os tokens `ink-*`/`paper-*` de texto —
 * esses são reescritos pelo tema escuro assumindo fundo claro.
 */
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
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-900 px-4 py-6
        dark:bg-ink-800 dark:border-r dark:border-white/10 lg:flex"
    >
      <div className="flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-base"
        >
          🗓️
        </span>
        <span className="text-sm font-extrabold tracking-tight text-white">Agenda da Família</span>
      </div>

      {canCreate && (
        <Link
          href="/nova-tarefa"
          className="pressable mt-6 flex items-center justify-center gap-2 rounded-3xl bg-accent-400
            px-4 py-3.5 text-sm font-extrabold text-brand-900 shadow-sticker transition
            hover:bg-accent-300"
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
              className={`relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-extrabold transition
                ${
                  active
                    ? 'bg-white/[0.14] text-white'
                    : 'text-white/55 hover:bg-white/[0.07] hover:text-white/90'
                }`}
            >
              {/* Marcador dourado: diz onde você está sem precisar de outra cor de fundo */}
              <span
                aria-hidden
                className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-400
                  transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
              />
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-400
              text-sm font-extrabold text-brand-900"
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">{name}</p>
            {roleName && <p className="truncate text-xs font-medium text-white/45">{roleName}</p>}
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-2.5 w-full rounded-xl px-3 py-2 text-xs font-extrabold text-white/55 transition
              hover:bg-white/10 hover:text-white"
          >
            Sair
          </button>
        </form>

        <div className="mt-2 border-t border-white/10 pt-2">
          <ThemeSwitcher onDark />
        </div>
      </div>
    </aside>
  );
}
