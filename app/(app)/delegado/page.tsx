import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { TaskCard } from '@/components/TaskCard';
import { requireSession } from '@/lib/auth';
import { todayISO } from '@/lib/dates';
import { getDelegatedTasks } from '@/lib/tasks';
import type { TaskView } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export default async function DelegatedPage() {
  const session = await requireSession();
  const today = todayISO();
  const { data: tasks, error } = await getDelegatedTasks(today);

  // Uma seção por pessoa: é assim que ela pensa ("o que o Pedro tem?").
  const groups = new Map<string, { name: string; tasks: TaskView[] }>();
  for (const task of tasks) {
    const id = task.delegate?.id ?? 'sem-pessoa';
    const name = task.delegate?.name ?? 'Sem responsável';
    if (!groups.has(id)) groups.set(id, { name, tasks: [] });
    groups.get(id)!.tasks.push(task);
  }

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <>
      <PageTitle
        title="Delegado"
        subtitle={
          tasks.length
            ? `${pendingCount} pendente${pendingCount === 1 ? '' : 's'} de ${tasks.length}`
            : 'Nada delegado ainda'
        }
      />

      <ErrorBanner message={error} className="mb-4" />

      {!tasks.length && !error && (
        <EmptyState
          icon="🤝"
          title="Nada delegado ainda"
          description="Ao criar uma tarefa, escolha “Delegar” para passar algo para alguém da família."
        />
      )}

      {[...groups.entries()].map(([id, group]) => {
        const groupDone = group.tasks.filter((t) => t.done).length;
        return (
          <section key={id} className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span
                  aria-hidden
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
                >
                  {group.name.charAt(0).toUpperCase()}
                </span>
                {group.name}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  groupDone === group.tasks.length
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {groupDone}/{group.tasks.length} feito{group.tasks.length > 1 ? 's' : ''}
              </span>
            </div>

            <ul className="flex flex-col gap-2">
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  date={today}
                  showAuthor={task.author?.id !== session.userId}
                  canManage={
                    task.created_by === session.userId ||
                    session.permissions.includes('edit_others_tasks')
                  }
                />
              ))}
            </ul>
          </section>
        );
      })}

      {session.permissions.includes('create_task') && (
        <Link
          href="/nova-tarefa?destino=delegated"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
        >
          + Delegar uma tarefa
        </Link>
      )}
    </>
  );
}
