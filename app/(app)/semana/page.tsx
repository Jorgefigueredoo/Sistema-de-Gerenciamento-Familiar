import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { TaskCard } from '@/components/TaskCard';
import { requireSession } from '@/lib/auth';
import { CATEGORY_LIST } from '@/lib/categories';
import { todayISO } from '@/lib/dates';
import { getWeekTasks } from '@/lib/tasks';

export const metadata = { title: 'Essa semana' };
export const dynamic = 'force-dynamic';

export default async function WeekPage() {
  const session = await requireSession();
  const today = todayISO();
  const { data: tasks, error } = await getWeekTasks(session.userId, today);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const canCreate = session.permissions.includes('create_task');

  // Agrupa por categoria: bate o olho e vê onde a semana está pesada.
  const byCategory = CATEGORY_LIST.map((category) => ({
    category,
    tasks: pending.filter((t) => t.category === category.key),
  })).filter((group) => group.tasks.length > 0);

  return (
    <>
      <PageTitle
        emoji="🗓️"
        title="Essa semana"
        subtitle={
          pending.length
            ? `${pending.length} ${pending.length === 1 ? 'tarefa esperando' : 'tarefas esperando'} um dia`
            : 'Nada pendente por aqui'
        }
      />

      <ErrorBanner message={error} className="mb-4" />

      {!tasks.length && !error && (
        <EmptyState
          icon="🗓️"
          title="A semana está limpa"
          description="Aqui ficam as tarefas que precisam acontecer, mas ainda não têm dia marcado."
        />
      )}

      <div className="sm:grid sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-2">
        {byCategory.map(({ category, tasks: group }) => (
          <section key={category.key} className="mb-7">
            <div className="mb-3 flex items-center gap-2.5">
              <span
                aria-hidden
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${category.soft}`}
              >
                {category.icon}
              </span>
              <h2 className="text-sm font-extrabold tracking-tight text-ink-700">
                {category.label}
              </h2>
              <span className="h-px flex-1 bg-ink-200/70" aria-hidden />
              <span className="tabular rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-500">
                {group.length}
              </span>
            </div>

            <ul className="flex flex-col gap-2.5">
              {group.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  date={today}
                  index={index}
                  canManage
                  canMoveToToday
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {done.length > 0 && (
        <section className="mb-7">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-base"
            >
              ✅
            </span>
            <h2 className="text-sm font-extrabold tracking-tight text-ink-500">Concluídas</h2>
            <span className="h-px flex-1 bg-ink-200/70" aria-hidden />
          </div>

          <ul className="flex flex-col gap-2.5">
            {done.map((task, index) => (
              <TaskCard key={task.id} task={task} date={today} index={index} canManage />
            ))}
          </ul>
        </section>
      )}

      {canCreate && (
        <Link
          href="/nova-tarefa?destino=this_week"
          className="pressable flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed
            border-ink-200 px-4 py-4 text-sm font-bold text-ink-400 transition
            hover:border-brand-300 hover:bg-white/60 hover:text-brand-600"
        >
          + Adicionar à semana
        </Link>
      )}
    </>
  );
}
