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
  const complete = tasks.length > 0 && doneCount === tasks.length;

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2.5">
        {icon && (
          <span
            aria-hidden
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-base shadow-soft
              ${tone === 'warning' ? 'bg-red-50' : 'bg-white'}`}
          >
            {icon}
          </span>
        )}

        <h2
          className={`text-sm font-extrabold tracking-tight
            ${tone === 'warning' ? 'text-red-600' : 'text-ink-700'}`}
        >
          {title}
        </h2>

        <span className="h-px flex-1 bg-ink-200/70" aria-hidden />

        {tasks.length > 0 && (
          <span
            className={`tabular rounded-full px-2 py-0.5 text-[11px] font-bold
              ${complete ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500'}`}
          >
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      {tasks.length ? (
        <ul className="flex flex-col gap-2.5">
          {tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} date={date} index={index} {...cardProps} />
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-ink-200 px-4 py-5 text-center text-sm font-medium text-ink-400">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
