'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { CATEGORY_LIST, PERIOD_LIST, SCOPE_LIST } from '@/lib/categories';
import { WEEKDAYS, currentPeriod, periodFromTime } from '@/lib/dates';
import { createTask } from '@/app/actions/tasks';
import type { TaskCategory, TaskPeriod, TaskScope } from '@/types';

type Props = {
  delegates: { id: string; name: string }[];
  defaultScope?: TaskScope;
};

const OPTION_BASE =
  'pressable touch-target flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-3 text-xs font-bold transition';
const OPTION_IDLE = 'border-ink-200 bg-white text-ink-500 hover:border-ink-300';
const OPTION_BRAND = 'border-brand-400 bg-brand-50 text-brand-800 ring-4 ring-brand-100';

export function TaskForm({ delegates, defaultScope = 'today' }: Props) {
  const router = useRouter();

  const [category, setCategory] = useState<TaskCategory>('casa');
  const [scope, setScope] = useState<TaskScope>(defaultScope);
  const [period, setPeriod] = useState<TaskPeriod>(currentPeriod());
  const [periodTouched, setPeriodTouched] = useState(false);
  const [time, setTime] = useState('');
  const [delegatedTo, setDelegatedTo] = useState(delegates[0]?.id ?? '');
  const [repeats, setRepeats] = useState(false);
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /** Escolheu 07:30? O período vira "manhã" sozinho — menos um toque. */
  function handleTimeChange(value: string) {
    setTime(value);
    if (!periodTouched) {
      const suggested = periodFromTime(value);
      if (suggested) setPeriod(suggested);
    }
  }

  function toggleWeekday(key: string) {
    setWeekdays((current) =>
      current.includes(key) ? current.filter((d) => d !== key) : [...current, key],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set('category', category);
    formData.set('scope', scope);
    formData.set('period', scope === 'today' ? period : '');
    formData.set('delegated_to', scope === 'delegated' ? delegatedTo : '');
    formData.delete('weekdays');
    if (repeats) weekdays.forEach((day) => formData.append('weekdays', day));

    startTransition(async () => {
      const result = await createTask(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const destination =
        scope === 'today' ? '/' : scope === 'this_week' ? '/semana' : '/delegado';
      router.push(destination);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-4">
      {/* Título */}
      <label className="block">
        <span className="label">O que precisa ser feito?</span>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          autoFocus
          autoComplete="off"
          placeholder="Ex.: Levar a Manu no balé"
          className="field text-lg font-medium"
        />
      </label>

      {/* Categoria */}
      <fieldset>
        <legend className="label">Categoria</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CATEGORY_LIST.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={active}
                className={`${OPTION_BASE} ${active ? `${c.selected} ring-4` : OPTION_IDLE}`}
              >
                <span className="text-xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="truncate text-[10px] leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Destino */}
      <fieldset>
        <legend className="label">Isso é para…</legend>
        <div className="grid grid-cols-3 gap-2">
          {SCOPE_LIST.map((s) => {
            const active = scope === s.key;
            const disabled = s.key === 'delegated' && delegates.length === 0;
            return (
              <button
                key={s.key}
                type="button"
                disabled={disabled}
                onClick={() => setScope(s.key)}
                aria-pressed={active}
                title={disabled ? 'Ninguém está habilitado a receber delegações' : undefined}
                className={`${OPTION_BASE} disabled:cursor-not-allowed disabled:opacity-40
                  ${active ? OPTION_BRAND : OPTION_IDLE}`}
              >
                <span className="text-xl" aria-hidden>
                  {s.icon}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Para quem */}
      {scope === 'delegated' && (
        <label className="block animate-fade-in">
          <span className="label">Delegar para</span>
          <select
            value={delegatedTo}
            onChange={(e) => setDelegatedTo(e.target.value)}
            className="field"
          >
            {delegates.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Período do dia */}
      {scope === 'today' && (
        <fieldset className="animate-fade-in">
          <legend className="label">Período do dia</legend>
          <div className="grid grid-cols-3 gap-2">
            {PERIOD_LIST.map((p) => {
              const active = period === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setPeriod(p.key);
                    setPeriodTouched(true);
                  }}
                  aria-pressed={active}
                  className={`${OPTION_BASE} ${active ? OPTION_BRAND : OPTION_IDLE}`}
                >
                  <span className="text-xl" aria-hidden>
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Horário */}
      <label className="block">
        <span className="label">
          Horário <span className="font-normal text-ink-400">(opcional)</span>
        </span>
        <input
          name="time"
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="field tabular"
        />
      </label>

      {/* Recorrência */}
      <div>
        <label className="pressable flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3.5">
          <span className="text-sm font-bold text-ink-700">🔁 Repetir toda semana</span>
          <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
            <input
              type="checkbox"
              checked={repeats}
              onChange={(e) => {
                setRepeats(e.target.checked);
                if (!e.target.checked) setWeekdays([]);
              }}
              className="peer h-full w-full cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-brand-500"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
            />
          </span>
        </label>

        {repeats && (
          <div className="mt-3 animate-fade-in">
            <p className="mb-2 text-xs font-medium text-ink-500">Em quais dias?</p>
            <div className="flex justify-between gap-1.5">
              {WEEKDAYS.map((day) => {
                const active = weekdays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleWeekday(day.key)}
                    aria-pressed={active}
                    aria-label={day.full}
                    className={`pressable h-11 flex-1 rounded-2xl border-2 text-sm font-extrabold transition
                      ${
                        active
                          ? 'surface-gradient border-transparent text-white shadow-glow'
                          : 'border-ink-200 bg-white text-ink-400'
                      }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ErrorBanner message={error} />

      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-ink-50 via-ink-50/95 to-transparent px-1 pb-2 pt-5">
        <Button type="submit" full loading={pending}>
          Adicionar tarefa
        </Button>
      </div>
    </form>
  );
}
