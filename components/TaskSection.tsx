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
  canMoveToDay?: boolean;
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
            className={`flex h-9 w-9 items-center justify-center rounded-2xl border-2 text-base shadow-sticker
              ${tone === 'warning' ? 'border-red-300 bg-red-100' : 'border-hairline bg-surface'}`}
          >
            {icon}
          </span>
        )}

        <h2
          className={`text-xs font-extrabold uppercase tracking-wider
            ${tone === 'warning' ? 'text-red-700' : 'text-ink-500'}`}
        >
          {title}
        </h2>

        <span className="h-0.5 flex-1 rounded-full bg-hairline" aria-hidden />

        {tasks.length > 0 && (
          <span
            className={`tabular rounded-full px-2.5 py-1 text-[11px] font-extrabold
              ${complete ? 'bg-green-500 text-white' : 'bg-ink-900 text-paper-50'}`}
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
        <p className="rounded-4xl border-2 border-dashed border-hairline px-4 py-5 text-center text-sm font-bold text-ink-400">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
