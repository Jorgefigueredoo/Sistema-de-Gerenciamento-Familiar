import { signOut } from '@/app/actions/auth';
import { NotificationToggle } from '@/components/NotificationToggle';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

/** Cabeçalho do celular. No desktop essa função é da Sidebar. */
export function AppHeader({ name, roleName }: { name: string; roleName: string | null }) {
  const firstName = name.split(' ')[0] || name;

  return (
    <header className="sticky top-0 z-30 border-b-2 border-hairline/70 bg-canvas/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="surface-gradient flex h-9 w-9 items-center justify-center rounded-2xl border-2 border-ink-900 text-sm shadow-sticker"
          >
            🗓️
          </span>
          <span className="text-sm font-extrabold tracking-tight text-ink-900">
            Agenda da Família
          </span>
        </div>

        <div className="flex items-center gap-1">
          <NotificationToggle compact />
          <ThemeSwitcher compact placement="down" />

          <span
            aria-hidden
            title={roleName ?? undefined}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-hairline bg-surface text-sm font-extrabold text-ink-700"
          >
            {firstName.charAt(0).toUpperCase()}
          </span>

          <form action={signOut}>
            <button
              type="submit"
              className="touch-target rounded-xl px-2 text-xs font-extrabold text-ink-400 transition hover:bg-veil/[0.07] hover:text-ink-800"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
