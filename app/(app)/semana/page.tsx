import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { TaskCard } from '@/components/TaskCard';
import { requireSession } from '@/lib/auth';
import { CATEGORY_LIST } from '@/lib/categories';
import { todayISO } from '@/lib/dates';
import { getWeekTasks } from '@/lib/tasks';
import type { TaskView } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export default async function WeekPage() {
  const session = await requireSession();
  const today = todayISO();
  const { data: tasks, error } = await getWeekTasks(session.userId, today);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  // Agrupa por categoria: bate o olho e vê onde a semana está pesada.
  const byCategory = CATEGORY_LIST.map((category) => ({
    category,
    tasks: pending.filter((t) => t.category === category.key),
  })).filter((group) => group.tasks.length > 0);

  return (
    <>
      <PageTitle
        title="Essa semana"
        subtitle={
          pending.length
            ? `${pending.length} tarefa${pending.length > 1 ? 's' : ''} esperando um dia`
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

      {byCategory.map(({ category, tasks: group }) => (
        <section key={category.key} className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-bold uppercase tracking-wide text-slate-500">
            <span aria-hidden>{category.icon}</span>
            {category.label}
            <span className="font-medium normal-case text-slate-400">({group.length})</span>
          </h2>
          <ul className="flex flex-col gap-2">
            {group.map((task: TaskView) => (
              <TaskCard key={task.id} task={task} date={today} canManage canMoveToToday />
            ))}
          </ul>
        </section>
      ))}

      {done.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-slate-400">
            ✅ Concluídas
          </h2>
          <ul className="flex flex-col gap-2">
            {done.map((task) => (
              <TaskCard key={task.id} task={task} date={today} canManage />
            ))}
          </ul>
        </section>
      )}

      {session.permissions.includes('create_task') && (
        <Link
          href="/nova-tarefa?destino=this_week"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
        >
          + Adicionar à semana
        </Link>
      )}
    </>
  );
}
