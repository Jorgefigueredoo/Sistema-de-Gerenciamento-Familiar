import { signOut } from '@/app/actions/auth';

/** Cabeçalho do celular. No desktop essa função é da Sidebar. */
export function AppHeader({ name, roleName }: { name: string; roleName: string | null }) {
  const firstName = name.split(' ')[0] || name;

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="surface-gradient flex h-8 w-8 items-center justify-center rounded-xl text-sm shadow-glow"
          >
            🗓️
          </span>
          <span className="text-sm font-extrabold tracking-tight text-ink-900">
            Agenda da Família
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span
            aria-hidden
            title={roleName ?? undefined}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-sm font-bold text-ink-600"
          >
            {firstName.charAt(0).toUpperCase()}
          </span>

          <form action={signOut}>
            <button
              type="submit"
              className="touch-target rounded-xl px-2 text-xs font-bold text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
