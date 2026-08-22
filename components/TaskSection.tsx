import { TaskCard } from '@/components/TaskCard';
import type { TaskView } from '@/lib/tasks';

type Props = {
  title: string;
  icon?: string;
  tasks: TaskView[];
  date: string;
  emptyLabel?: string;
  tone?: 'default' | 'warning';
  showDelegate?: boolean;
  showAuthor?: boolean;
  canManage?: boolean;
  canMoveToToday?: boolean;
  canMoveToWeek?: boolean;
};

export function TaskSection({
  title,
  icon,
  tasks,
  date,
  emptyLabel,
  tone = 'default',
  ...cardProps
}: Props) {
  if (!tasks.length && !emptyLabel) return null;

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2
          className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide ${
            tone === 'warning' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h2>
        {tasks.length > 0 && (
          <span className="text-xs font-medium text-slate-400">
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      {tasks.length ? (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} date={date} {...cardProps} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-center text-sm text-slate-400">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
