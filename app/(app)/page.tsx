import Link from 'next/link';
import { DayHero } from '@/components/DayHero';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TaskSection } from '@/components/TaskSection';
import { requireSession } from '@/lib/auth';
import { PERIODS } from '@/lib/categories';
import { todayISO } from '@/lib/dates';
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
  const canEditOthers = session.permissions.includes('edit_others_tasks');
  const isEmpty = board.total === 0 && board.overdue.length === 0 && !error;
  const hasPersonalTasks =
    board.overdue.length > 0 ||
    board.anytime.length > 0 ||
    Object.values(board.periods).some((tasks) => tasks.length > 0);

  return (
    <>
      <DayHero name={firstName} date={today} done={board.doneCount} total={board.total} />

      <div className="mt-6">
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
          <EmptyState
            icon="☀️"
            title="O dia está livre"
            description={
              canCreate
                ? 'Que tal começar colocando a primeira tarefa do dia?'
                : 'Nada foi delegado para você por enquanto.'
            }
          >
            {canCreate && (
              <Link
                href="/nova-tarefa"
                className="pressable surface-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-3
                  text-sm font-bold text-white shadow-glow"
              >
                + Nova tarefa
              </Link>
            )}
          </EmptyState>
        ) : (
          <>
            {hasPersonalTasks && (
              <>
                {/* No desktop os três períodos viram colunas lado a lado */}
                <div className="lg:grid lg:grid-cols-3 lg:gap-x-6">
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
                </div>

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

            {board.delegated.length > 0 && (
              <TaskSection
                title="Delegadas para você"
                icon="🤝"
                tasks={board.delegated}
                date={today}
                showAuthor
                // Quem recebeu pode concluir a tarefa; só quem tem a
                // permissão administrativa também pode movê-la ou excluí-la.
                canManage={canEditOthers}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
