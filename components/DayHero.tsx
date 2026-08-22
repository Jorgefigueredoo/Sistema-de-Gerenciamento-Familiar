import { formatLongDate, greeting } from '@/lib/dates';

/** Cartão de abertura da tela Hoje: saudação, data e o anel de progresso. */
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
    <section className="surface-gradient relative overflow-hidden rounded-4xl p-6 text-white shadow-lift">
      {/* Brilhos decorativos */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {formatLongDate(date)}
          </p>
          <h1 className="mt-1.5 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-sm font-medium text-white/80">{message}</p>
        </div>

        <ProgressRing percent={percent} done={done} total={total} />
      </div>
    </section>
  );
}

function ProgressRing({ percent, done, total }: { percent: number; done: number; total: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative h-[86px] w-[86px] shrink-0"
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
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-lg font-extrabold leading-none">{done}</span>
        <span className="tabular text-[11px] font-semibold text-white/70">de {total}</span>
      </div>
    </div>
  );
}
