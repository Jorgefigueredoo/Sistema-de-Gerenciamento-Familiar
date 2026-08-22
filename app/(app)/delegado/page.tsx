import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PageTitle } from '@/components/PageTitle';
import { TaskCard } from '@/components/TaskCard';
import { requireSession } from '@/lib/auth';
import { todayISO } from '@/lib/dates';
import { getDelegatedTasks } from '@/lib/tasks';
import type { TaskView } from '@/lib/tasks';

export const metadata = { title: 'Delegado' };
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
  const canCreate = session.permissions.includes('create_task');

  return (
    <>
      <PageTitle
        emoji="🤝"
        title="Delegado"
        subtitle={
          tasks.length
            ? `${pendingCount} ${pendingCount === 1 ? 'pendente' : 'pendentes'} de ${tasks.length}`
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

      <div className="sm:grid sm:grid-cols-2 sm:gap-x-5">
        {[...groups.entries()].map(([id, group]) => {
          const groupDone = group.tasks.filter((t) => t.done).length;
          const complete = groupDone === group.tasks.length;

          return (
            <section key={id} className="mb-7">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="surface-gradient flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-900 text-xs font-extrabold text-paper-50"
                >
                  {group.name.charAt(0).toUpperCase()}
                </span>
                <h2 className="truncate text-sm font-extrabold tracking-tight text-ink-800">
                  {group.name}
                </h2>
                <span className="h-0.5 flex-1 rounded-full bg-hairline" aria-hidden />
                <span
                  className={`tabular rounded-full px-2.5 py-1 text-[11px] font-extrabold
                    ${complete ? 'bg-green-500 text-white' : 'bg-ink-900 text-paper-50'}`}
                >
                  {groupDone}/{group.tasks.length}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {group.tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    date={today}
                    index={index}
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
      </div>

      {canCreate && (
        <Link
          href="/nova-tarefa?destino=delegated"
          className="pressable flex w-full items-center justify-center gap-2 rounded-4xl border-2 border-dashed
            border-hairline px-4 py-4 text-sm font-extrabold text-ink-400 transition
            hover:border-ink-900 hover:bg-surface hover:text-ink-900"
        >
          + Delegar uma tarefa
        </Link>
      )}
    </>
  );
}
