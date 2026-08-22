'use client';

import { useState, useTransition } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getCategory, PERIOD_LIST } from '@/lib/categories';
import { describeRecurrence, formatShortDate, formatTime } from '@/lib/dates';
import { deleteTask, moveTaskToToday, moveTaskToWeek, toggleTask } from '@/app/actions/tasks';
import type { TaskView } from '@/lib/tasks';

type Props = {
  task: TaskView;
  /** Data da ocorrência — importa para as recorrentes. */
  date: string;
  /** Mostra "para Fulano" (tela Delegado). */
  showDelegate?: boolean;
  /** Mostra "por Fulano" quando a tarefa é de outra pessoa. */
  showAuthor?: boolean;
  /** Habilita mover/excluir. */
  canManage?: boolean;
  /** Oferece "mover para hoje" (tela Essa semana). */
  canMoveToToday?: boolean;
  /** Oferece "deixar para essa semana" (tela Hoje). */
  canMoveToWeek?: boolean;
  /** Atraso da animação de entrada, para a lista aparecer em cascata. */
  index?: number;
};

export function TaskCard({
  task,
  date,
  showDelegate = false,
  showAuthor = false,
  canManage = false,
  canMoveToToday = false,
  canMoveToWeek = false,
  index = 0,
}: Props) {
  const category = getCategory(task.category);

  const [done, setDone] = useState(task.done);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !done;
    setDone(next); // otimista: o feedback tem que ser instantâneo
    setError(null);

    startTransition(async () => {
      const result = await toggleTask(task.id, task.is_recurring, next, date);
      if (!result.ok) {
        setDone(!next);
        setError(result.error);
      }
    });
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? 'Não foi possível concluir a ação.');
      else {
        setMenuOpen(false);
        setMoveOpen(false);
      }
    });
  }

  const time = formatTime(task.time);
  const recurrence = describeRecurrence(task.recurrence_rule);
  const hasMenu = canManage || canMoveToToday || canMoveToWeek;

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
      className={`group animate-rise rounded-3xl border bg-white transition duration-300
        ${
          done
            ? 'border-ink-100 bg-ink-50/60 shadow-none'
            : 'border-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift'
        }`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <Checkbox
          checked={done}
          onChange={handleToggle}
          label={done ? `Desmarcar ${task.title}` : `Concluir ${task.title}`}
          color={category.solid}
        />

        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={`break-words text-[15px] font-semibold leading-snug transition duration-300
              ${done ? 'text-ink-400 line-through decoration-ink-300' : 'text-ink-900'}`}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${category.chip}`}
            >
              <span aria-hidden>{category.icon}</span>
              {category.label}
            </span>

            {time && (
              <span className="tabular inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 font-semibold text-ink-600">
                🕐 {time}
              </span>
            )}

            {task.overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 font-semibold text-red-600 ring-1 ring-inset ring-red-100">
                ⏰ {task.date ? formatShortDate(task.date) : 'atrasada'}
              </span>
            )}

            {recurrence && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 font-medium text-ink-500">
                🔁 {recurrence}
              </span>
            )}

            {showDelegate && task.delegate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-1 font-semibold text-accent-700">
                👤 {task.delegate.name}
              </span>
            )}

            {showAuthor && task.author && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 font-medium text-ink-500">
                ✍️ {task.author.name}
              </span>
            )}
          </div>

          {error && <ErrorBanner message={error} className="mt-2" />}
        </div>

        {hasMenu && (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={`Opções de ${task.title}`}
            className="pressable touch-target -mr-1 -mt-1 flex items-center justify-center rounded-2xl text-lg
              text-ink-300 transition hover:bg-ink-100 hover:text-ink-600"
          >
            ⋯
          </button>
        )}
      </div>

      {/* Menu de opções */}
      <BottomSheet open={menuOpen} title={task.title} onClose={() => setMenuOpen(false)}>
        <div className="flex flex-col gap-2">
          {canMoveToToday && (
            <Button
              variant="secondary"
              full
              onClick={() => {
                setMenuOpen(false);
                setMoveOpen(true);
              }}
            >
              📅 Mover para hoje
            </Button>
          )}

          {canMoveToWeek && (
            <Button
              variant="secondary"
              full
              loading={pending}
              onClick={() => run(() => moveTaskToWeek(task.id))}
            >
              🗓️ Deixar para essa semana
            </Button>
          )}

          {canManage && (
            <Button
              variant="danger"
              full
              loading={pending}
              onClick={() => {
                if (confirm('Excluir esta tarefa?')) run(() => deleteTask(task.id));
              }}
            >
              🗑️ Excluir tarefa
            </Button>
          )}

          <ErrorBanner message={error} />
        </div>
      </BottomSheet>

      {/* Mover para hoje: escolhe período e horário */}
      <BottomSheet open={moveOpen} title="Quando, hoje?" onClose={() => setMoveOpen(false)}>
        <MoveToTodayForm
          pending={pending}
          error={error}
          onSubmit={(period, time) => run(() => moveTaskToToday(task.id, period, time))}
        />
      </BottomSheet>
    </li>
  );
}

function MoveToTodayForm({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (period: string, time: string | null) => void;
}) {
  const [period, setPeriod] = useState<string>('manha');
  const [time, setTime] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label">Período do dia</p>
        <div className="grid grid-cols-3 gap-2">
          {PERIOD_LIST.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              aria-pressed={period === p.key}
              className={`pressable touch-target rounded-2xl border-2 px-2 py-3 text-sm font-bold transition
                ${
                  period === p.key
                    ? 'border-brand-400 bg-brand-50 text-brand-800 ring-4 ring-brand-100'
                    : 'border-ink-200 bg-white text-ink-500'
                }`}
            >
              <span className="mb-0.5 block text-xl" aria-hidden>
                {p.icon}
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="label">
          Horário <span className="font-normal text-ink-400">(opcional)</span>
        </span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="field tabular"
        />
      </label>

      <ErrorBanner message={error} />

      <Button full loading={pending} onClick={() => onSubmit(period, time || null)}>
        Mover para hoje
      </Button>
    </div>
  );
}
