'use client';

import { useState, useTransition } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getCategory } from '@/lib/categories';
import {
  WEEKDAYS,
  describeRecurrence,
  formatLongDate,
  formatShortDate,
  formatTime,
  nextDateForWeekday,
  todayISO,
  weekdayOf,
  type WeekdayKey,
} from '@/lib/dates';
import { deleteTask, moveTaskToDay, toggleTask } from '@/app/actions/tasks';
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
  /** Oferece "mover para outro dia". */
  canMoveToDay?: boolean;
  /** Atraso da animação de entrada, para a lista aparecer em cascata. */
  index?: number;
};

export function TaskCard({
  task,
  date,
  showDelegate = false,
  showAuthor = false,
  canManage = false,
  canMoveToDay = false,
  index = 0,
}: Props) {
  const category = getCategory(task.category);

  const [done, setDone] = useState(task.done);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
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
        setDayOpen(false);
      }
    });
  }

  const time = formatTime(task.time);
  const recurrence = describeRecurrence(task.recurrence_rule);
  const hasMenu = canManage || canMoveToDay;

  return (
    <li
      data-tinted={done ? undefined : ''}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
      className={`group animate-rise rounded-4xl border-2 transition duration-300
        ${
          done
            ? 'border-hairline/60 bg-sunken/70 shadow-none'
            : `${category.card} shadow-sticker hover:-translate-y-0.5 hover:shadow-stickerLg`
        }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Bolha da categoria: identifica a área da vida antes de ler o texto */}
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl
            shadow-sticker transition duration-300
            ${done ? 'bg-ink-200 grayscale' : `${category.bubble} group-hover:animate-festa`}`}
        >
          {category.icon}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-[16px] font-bold leading-snug transition duration-300
              ${done ? 'text-ink-400 line-through decoration-ink-300 decoration-2' : 'text-ink-900'}`}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-extrabold ${category.chip}`}
            >
              {category.label}
            </span>

            {time && (
              <span className="tabular inline-flex items-center gap-1 rounded-full bg-veil/[0.07] px-2.5 py-1 font-extrabold text-ink-700">
                🕐 {time}
              </span>
            )}

            {task.overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 font-extrabold text-white">
                ⏰ {task.date ? formatShortDate(task.date) : 'atrasada'}
              </span>
            )}

            {recurrence && (
              <span className="inline-flex items-center gap-1 rounded-full bg-veil/[0.07] px-2.5 py-1 font-bold text-ink-600">
                🔁 {recurrence}
              </span>
            )}

            {showDelegate && task.delegate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 font-extrabold text-paper-50">
                👤 {task.delegate.name}
              </span>
            )}

            {showAuthor && task.author && (
              <span className="inline-flex items-center gap-1 rounded-full bg-veil/[0.07] px-2.5 py-1 font-bold text-ink-600">
                ✍️ {task.author.name}
              </span>
            )}
          </div>

          {error && <ErrorBanner message={error} className="mt-2" />}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          <Checkbox
            checked={done}
            onChange={handleToggle}
            label={done ? `Desmarcar ${task.title}` : `Concluir ${task.title}`}
            color={category.solid}
          />
        </div>

        {hasMenu && (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={`Opções de ${task.title}`}
            className="pressable touch-target -mr-2 -mt-2 flex items-center justify-center rounded-2xl text-xl
              font-bold text-ink-400 transition hover:bg-veil/[0.07] hover:text-ink-800"
          >
            ⋯
          </button>
        )}
      </div>

      {/* Menu de opções */}
      <BottomSheet open={menuOpen} title={task.title} onClose={() => setMenuOpen(false)}>
        <div className="flex flex-col gap-2">
          {canMoveToDay && (
            <Button
              variant="secondary"
              full
              onClick={() => {
                setMenuOpen(false);
                setDayOpen(true);
              }}
            >
              📆 Mover para outro dia
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

      {/* Mover para outro dia da semana */}
      <BottomSheet open={dayOpen} title="Para qual dia?" onClose={() => setDayOpen(false)}>
        <MoveToDayForm
          current={task.date}
          pending={pending}
          error={error}
          onSubmit={(date) => run(() => moveTaskToDay(task.id, date))}
        />
      </BottomSheet>

    </li>
  );
}

function MoveToDayForm({
  current,
  pending,
  error,
  onSubmit,
}: {
  current: string | null;
  pending: boolean;
  error: string | null;
  onSubmit: (date: string) => void;
}) {
  const today = todayISO();
  const [key, setKey] = useState<WeekdayKey>(weekdayOf(current ?? today));

  // Sempre a próxima vez que esse dia acontece — nunca joga para o passado.
  const target = nextDateForWeekday(key, today);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label">Dia da semana</p>
        <div className="flex justify-between gap-1.5">
          {WEEKDAYS.map((day) => {
            const active = key === day.key;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setKey(day.key)}
                aria-pressed={active}
                aria-label={day.full}
                className={`pressable flex-1 rounded-2xl border-2 py-3.5 text-sm font-extrabold shadow-sticker transition
                  ${
                    active
                      ? 'surface-gradient border-ink-900 text-paper-50 shadow-stickerLg'
                      : 'border-hairline bg-surface text-ink-400 hover:border-hairline'
                  }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs font-medium text-ink-500">
          📅 {target === today ? 'Hoje' : formatLongDate(target)}
        </p>
      </div>

      <ErrorBanner message={error} />

      <Button full loading={pending} onClick={() => onSubmit(target)}>
        Mover tarefa
      </Button>
    </div>
  );
}

