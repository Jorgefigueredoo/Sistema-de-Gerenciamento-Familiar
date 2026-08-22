'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
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

export function TaskForm({ delegates, defaultScope = 'today' }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6 pb-4">
      {/* Título */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          O que precisa ser feito?
        </span>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          autoFocus
          autoComplete="off"
          placeholder="Ex.: Levar a Manu no balé"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>

      {/* Categoria */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Categoria</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {CATEGORY_LIST.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={active}
                className={`touch-target flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-3 text-xs font-semibold transition
                  ${active ? `${c.selected} ring-4` : 'border-slate-200 bg-white text-slate-600'}`}
              >
                <span className="text-xl" aria-hidden>
                  {c.icon}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Destino */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Isso é para…</legend>
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
                className={`touch-target flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-3 text-xs font-semibold transition
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-800 ring-4 ring-brand-100'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
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
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Delegar para</span>
          <select
            value={delegatedTo}
            onChange={(e) => setDelegatedTo(e.target.value)}
            className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
          <legend className="mb-2 text-sm font-semibold text-slate-700">Período do dia</legend>
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
                  className={`touch-target flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-1 py-3 text-xs font-semibold transition
                    ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-800 ring-4 ring-brand-100'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
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
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          Horário <span className="font-normal text-slate-400">(opcional)</span>
        </span>
        <input
          name="time"
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="touch-target w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>

      {/* Recorrência */}
      <div>
        <label className="flex touch-target cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">🔁 Repetir toda semana</span>
          <input
            type="checkbox"
            checked={repeats}
            onChange={(e) => {
              setRepeats(e.target.checked);
              if (!e.target.checked) setWeekdays([]);
            }}
            className="h-6 w-6 rounded-md border-slate-300 accent-brand-600"
          />
        </label>

        {repeats && (
          <div className="mt-3 animate-fade-in">
            <p className="mb-2 text-xs text-slate-500">Em quais dias?</p>
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
                    className={`touch-target flex-1 rounded-full border-2 text-sm font-bold transition
                      ${
                        active
                          ? 'border-brand-500 bg-brand-600 text-white'
                          : 'border-slate-200 bg-white text-slate-500'
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

      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent px-1 pb-1 pt-4">
        <Button type="submit" full loading={pending}>
          Adicionar tarefa
        </Button>
      </div>
    </form>
  );
}
