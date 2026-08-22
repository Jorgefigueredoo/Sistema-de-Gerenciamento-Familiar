import Link from 'next/link';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { ProgressSummary } from '@/components/ProgressSummary';
import { TaskSection } from '@/components/TaskSection';
import { requireSession } from '@/lib/auth';
import { PERIODS } from '@/lib/categories';
import { formatLongDate, greeting, todayISO } from '@/lib/dates';
import { getTodayBoard } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const session = await requireSession();
  const today = todayISO();
  const { data: board, error } = await getTodayBoard(session.userId, today);

  const firstName = (session.profile.name || session.profile.email).split(' ')[0];
  const canCreate = session.permissions.includes('create_task');
  const isEmpty =
    board.total === 0 && board.overdue.length === 0 && !error;

  return (
    <>
      <PageTitle title={`${greeting()}, ${firstName}`} subtitle={formatLongDate(today)}>
        <ProgressSummary done={board.doneCount} total={board.total} />
      </PageTitle>

      {searchParams.erro === 'sem-permissao' && (
        <ErrorBanner
          message="Essa área é só para quem tem permissão de administrador."
          className="mb-4"
        />
      )}

      <ErrorBanner message={error} className="mb-4" />

      {board.overdue.length > 0 && (
        <TaskSection
          title="Ficaram para trás"
          icon="⏰"
          tone="warning"
          tasks={board.overdue}
          date={today}
          canManage
          canMoveToWeek
        />
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden>
            ☀️
          </p>
          <p className="mt-3 font-semibold text-slate-700">O dia está livre</p>
          <p className="mt-1 text-sm text-slate-500">
            {canCreate
              ? 'Que tal começar colocando a primeira tarefa do dia?'
              : 'Nada foi delegado para você por enquanto.'}
          </p>
          {canCreate && (
            <Link
              href="/nova-tarefa"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              + Nova tarefa
            </Link>
          )}
        </div>
      ) : (
        <>
          <TaskSection
            title={PERIODS.manha.label}
            icon={PERIODS.manha.icon}
            tasks={board.periods.manha}
            date={today}
            emptyLabel="Manhã livre"
            canManage
            canMoveToWeek
          />
          <TaskSection
            title={PERIODS.tarde.label}
            icon={PERIODS.tarde.icon}
            tasks={board.periods.tarde}
            date={today}
            emptyLabel="Tarde livre"
            canManage
            canMoveToWeek
          />
          <TaskSection
            title={PERIODS.noite.label}
            icon={PERIODS.noite.icon}
            tasks={board.periods.noite}
            date={today}
            emptyLabel="Noite livre"
            canManage
            canMoveToWeek
          />
          <TaskSection
            title="A qualquer hora"
            icon="✨"
            tasks={board.anytime}
            date={today}
            canManage
            canMoveToWeek
          />
        </>
      )}
    </>
  );
}
