import { signOut } from '@/app/actions/auth';

export function AppHeader({ name, roleName }: { name: string; roleName: string | null }) {
  const firstName = name.split(' ')[0] || name;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            Agenda da Família
          </p>
          <p className="truncate text-xs text-slate-500">
            {firstName}
            {roleName ? ` · ${roleName}` : ''}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="touch-target rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
