'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { TaskCard } from '@/components/TaskCard';
import type { AgendaDay } from '@/lib/tasks';

type Props = {
  days: AgendaDay[];
  /** Data de hoje, para destacar o dia certo. */
  today: string;
  canCreate: boolean;
};

/**
 * A semana em duas partes: a régua de dias lá em cima (dá para bater o
 * olho e ver onde a semana está pesada) e as tarefas do dia escolhido.
 */
export function WeekAgenda({ days, today, canCreate }: Props) {
  const initial = days.findIndex((d) => d.date === today);
  const [index, setIndex] = useState(initial >= 0 ? initial : 0);

  const day = days[index] ?? days[0]!;
  const pending = day.tasks.filter((t) => !t.done);
  const done = day.tasks.filter((t) => t.done);

  return (
    <>
      {/* Régua dos sete dias */}
      <div className="mb-6 grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const selected = i === index;
          const remaining = d.tasks.length - d.doneCount;
          const complete = d.tasks.length > 0 && remaining === 0;

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={selected}
              aria-label={`${d.label}, ${d.dayMonth}, ${d.tasks.length} ${
                d.tasks.length === 1 ? 'tarefa' : 'tarefas'
              }`}
              className={`pressable flex flex-col items-center gap-1 rounded-3xl border-2 px-0.5 py-2.5 transition
                ${
                  selected
                    ? 'surface-gradient border-ink-900 text-paper-50 shadow-stickerLg'
                    : d.isToday
                      ? 'border-accent-400 bg-accent-50 text-ink-800 shadow-sticker'
                      : 'border-hairline bg-surface text-ink-500 shadow-sticker hover:-translate-y-0.5 hover:border-hairline'
                }
                ${!selected && d.isPast ? 'opacity-55' : ''}`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80">
                {d.short}
              </span>
              <span className="tabular text-lg font-extrabold leading-none">
                {d.dayMonth.slice(0, 2)}
              </span>

              {/* Bolinha de carga do dia */}
              <span
                aria-hidden
                className={`tabular flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1
                  text-[10px] font-extrabold
                  ${
                    !d.tasks.length
                      ? 'text-transparent'
                      : selected
                        ? 'bg-white/25 text-paper-50'
                        : complete
                          ? 'bg-green-500 text-white'
                          : 'bg-ink-900 text-paper-50'
                  }`}
              >
                {d.tasks.length ? (complete ? '✓' : remaining) : '·'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cabeçalho do dia escolhido */}
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
            {day.label}
            {day.isToday && (
              <span className="ml-2 rounded-full bg-accent-300 px-2.5 py-1 align-middle text-[11px] font-extrabold uppercase tracking-wide text-ink-900">
                hoje
              </span>
            )}
          </h2>
          <p className="tabular text-sm font-bold text-ink-400">
            {day.dayMonth}
            {day.tasks.length > 0 && ` · ${day.doneCount}/${day.tasks.length} concluídas`}
          </p>
        </div>

        {canCreate && !day.isPast && (
          <Link
            href={`/nova-tarefa?destino=today&dia=${day.date}`}
            className="pressable shrink-0 rounded-2xl border-2 border-hairline bg-surface px-3 py-2 text-xs
              font-extrabold text-ink-600 shadow-sticker transition hover:border-ink-900 hover:text-ink-900"
          >
            + Adicionar
          </Link>
        )}
      </div>

      {!day.tasks.length ? (
        <EmptyState
          icon={day.isPast ? '🌙' : '🌤️'}
          title={day.isPast ? `${day.label} passou em branco` : `${day.label} está livre`}
          description={
            canCreate && !day.isPast
              ? 'Aproveite para deixar alguma coisa já marcada nesse dia.'
              : undefined
          }
        >
          {canCreate && !day.isPast && (
            <Link
              href={`/nova-tarefa?destino=today&dia=${day.date}`}
              className="pressable surface-gradient inline-flex items-center gap-2 rounded-3xl px-5 py-3
                text-sm font-extrabold text-paper-50 shadow-stickerLg"
            >
              + Nova tarefa
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {pending.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                date={day.date}
                index={i}
                canManage
                canMoveToDay={!task.is_recurring}
              />
            ))}
          </ul>

          {done.length > 0 && (
            <section className="mt-6">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-2xl bg-green-500 text-base shadow-sticker"
                >
                  ✅
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-400">
                  Concluídas
                </h3>
                <span className="h-px flex-1 bg-hairline" aria-hidden />
              </div>

              <ul className="flex flex-col gap-2.5">
                {done.map((task, i) => (
                  <TaskCard key={task.id} task={task} date={day.date} index={i} canManage />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
