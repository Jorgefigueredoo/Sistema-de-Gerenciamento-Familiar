import { formatLongDate, greeting } from '@/lib/dates';

/** Cartão de abertura da Agenda: saudação, data e o anel de progresso. */
export function DayHero({
  name,
  date,
  done,
  total,
}: {
  name: string;
  date: string;
  done: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const finished = total > 0 && done === total;

  const message = finished
    ? 'Tudo feito por hoje 🎉'
    : total === 0
      ? 'Seu dia ainda está em branco'
      : `${total - done} ${total - done === 1 ? 'tarefa restante' : 'tarefas restantes'}`;

  return (
    <section className="relative overflow-hidden rounded-5xl border-2 border-hairline/70 bg-surface p-6 shadow-sticker">
      {/* Confete discreto: dá vida ao papel sem virar enfeite */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent-200/40 blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-teal-200/30 blur-2xl"
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
            {formatLongDate(date)}
          </p>
          <h1 className="mt-1.5 truncate text-[28px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {greeting()}, {name}
          </h1>
          <p className="mt-1.5 text-sm font-bold text-ink-500">{message}</p>
        </div>

        <ProgressRing percent={percent} done={done} total={total} finished={finished} />
      </div>
    </section>
  );
}

function ProgressRing({
  percent,
  done,
  total,
  finished,
}: {
  percent: number;
  done: number;
  total: number;
  finished: boolean;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative h-[92px] w-[92px] shrink-0"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${done} de ${total} tarefas concluídas`}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className="stroke-ink-200"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className={finished ? 'stroke-green-500' : 'stroke-accent-400'}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-xl font-extrabold leading-none text-ink-900">{done}</span>
        <span className="tabular text-[11px] font-bold text-ink-400">de {total}</span>
      </div>
    </div>
  );
}
