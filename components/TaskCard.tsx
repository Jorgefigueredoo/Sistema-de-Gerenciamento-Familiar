'use client';

import { useState, useTransition } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getCategory, PERIOD_LIST } from '@/lib/categories';
import { describeRecurrence, formatShortDate, formatTime } from '@/lib/dates';
import {
  deleteTask,
  moveTaskToToday,
  moveTaskToWeek,
  toggleTask,
} from '@/app/actions/tasks';
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
};

export function TaskCard({
  task,
  date,
  showDelegate = false,
  showAuthor = false,
  canManage = false,
  canMoveToToday = false,
  canMoveToWeek = false,
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
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition
        ${done ? 'border-slate-200 opacity-60' : 'border-slate-200'}
        ${pending ? 'animate-pulse' : ''}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${category.bar}`} aria-hidden />

      <div className="flex items-start gap-3 py-3 pl-5 pr-2">
        <input
          type="checkbox"
          checked={done}
          onChange={handleToggle}
          aria-label={done ? `Desmarcar ${task.title}` : `Concluir ${task.title}`}
          className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-slate-300 ${category.accent}`}
        />

        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-[15px] font-medium leading-snug transition
              ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}
          >
            {task.title}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className={`rounded-full px-2 py-0.5 font-medium ${category.chip}`}>
              {category.icon} {category.label}
            </span>

            {time && <span className="font-medium text-slate-600">🕐 {time}</span>}

            {task.overdue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                atrasada{task.date ? ` de ${formatShortDate(task.date)}` : ''}
              </span>
            )}

            {recurrence && <span>🔁 {recurrence}</span>}

            {showDelegate && task.delegate && <span>👤 {task.delegate.name}</span>}

            {showAuthor && task.author && <span>✍️ {task.author.name}</span>}
          </div>

          {error && <ErrorBanner message={error} className="mt-2" />}
        </div>

        {hasMenu && (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={`Opções de ${task.title}`}
            className="touch-target -mr-1 rounded-full text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
        <p className="mb-2 text-sm font-medium text-slate-700">Período do dia</p>
        <div className="grid grid-cols-3 gap-2">
          {PERIOD_LIST.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              aria-pressed={period === p.key}
              className={`touch-target rounded-xl border-2 px-2 py-3 text-sm font-semibold transition
                ${
                  period === p.key
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
            >
              <span className="block text-lg" aria-hidden>
                {p.icon}
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Horário <span className="font-normal text-slate-400">(opcional)</span>
        </span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>

      <ErrorBanner message={error} />

      <Button full loading={pending} onClick={() => onSubmit(period, time || null)}>
        Mover para hoje
      </Button>
    </div>
  );
}
