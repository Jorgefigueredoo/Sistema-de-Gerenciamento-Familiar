'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { CATEGORY_LIST, FORM_SCOPE_LIST, PERIOD_LIST } from '@/lib/categories';
import {
  WEEKDAYS,
  currentPeriod,
  formatLongDate,
  nextDateForWeekday,
  periodFromTime,
  todayISO,
  weekdayOf,
  type WeekdayKey,
} from '@/lib/dates';
import { createTask } from '@/app/actions/tasks';
import type { TaskCategory, TaskPeriod, TaskScope } from '@/types';

type Props = {
  delegates: { id: string; name: string }[];
  defaultScope?: TaskScope;
  /** Dia já escolhido lá na agenda (YYYY-MM-DD). */
  defaultDate?: string;
};

const OPTION_BASE =
  'pressable touch-target flex flex-col items-center justify-center gap-1 rounded-3xl border-2 px-1 py-3 text-xs font-extrabold shadow-sticker transition';
const OPTION_IDLE = 'border-hairline bg-surface text-ink-500 hover:-translate-y-0.5 hover:border-hairline';
const OPTION_BRAND = 'border-ink-900 bg-ink-900 text-paper-50 shadow-stickerLg';

export function TaskForm({ delegates, defaultScope = 'today', defaultDate }: Props) {
  const router = useRouter();

  // Ponto de partida do calendário: a data que veio da agenda, ou hoje.
  const today = useMemo(() => todayISO(), []);
  const baseDate = defaultDate && defaultDate >= today ? defaultDate : today;

  const [category, setCategory] = useState<TaskCategory>('casa');
  const [scope, setScope] = useState<TaskScope>(defaultScope);
  const [period, setPeriod] = useState<TaskPeriod>(currentPeriod());
  const [periodTouched, setPeriodTouched] = useState(false);
  const [time, setTime] = useState('');
  const [delegatedTo, setDelegatedTo] = useState(delegates[0]?.id ?? '');
  const [repeats, setRepeats] = useState(false);
  const [weekdays, setWeekdays] = useState<WeekdayKey[]>([weekdayOf(baseDate)]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const todayKey = weekdayOf(today);
  const showDayPicker = scope === 'today' || repeats;

  /** Sem repetição, o dia escolhido vira uma data de verdade. */
  const targetDate = repeats ? null : nextDateForWeekday(weekdays[0] ?? todayKey, baseDate);

  /** Escolheu 07:30? O período vira "manhã" sozinho — menos um toque. */
  function handleTimeChange(value: string) {
    setTime(value);
    if (!periodTouched) {
      const suggested = periodFromTime(value);
      if (suggested) setPeriod(suggested);
    }
  }

  /** Repetindo: marca vários dias. Sem repetir: é um dia só. */
  function toggleWeekday(key: WeekdayKey) {
    setWeekdays((current) => {
      if (!repeats) return [key];
      return current.includes(key) ? current.filter((d) => d !== key) : [...current, key];
    });
  }

  function handleRepeatsChange(next: boolean) {
    setRepeats(next);
    // Ao ligar/desligar, o dia que já estava marcado continua servindo de base.
    setWeekdays((current) => (next ? (current.length ? current : [todayKey]) : [current[0] ?? todayKey]));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (repeats && !weekdays.length) {
      setError('Escolha pelo menos um dia da semana para repetir.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set('category', category);
    formData.set('scope', scope);
    formData.set('period', scope === 'today' ? period : '');
    formData.set('delegated_to', scope === 'delegated' ? delegatedTo : '');
    formData.set('date', !repeats && targetDate ? targetDate : '');
    formData.delete('weekdays');
    if (repeats) weekdays.forEach((day) => formData.append('weekdays', day));

    startTransition(async () => {
      const result = await createTask(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Cai na semana em que a tarefa realmente vai aparecer.
      const destination =
        scope === 'delegated'
          ? '/delegado'
          : !repeats && targetDate && targetDate !== today
            ? `/?semana=${targetDate}`
            : '/';
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
        <div className="grid grid-cols-2 gap-2">
          {FORM_SCOPE_LIST.map((s) => {
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

      {/* Dia da semana */}
      {showDayPicker && (
        <fieldset className="animate-fade-in">
          <legend className="label">{repeats ? 'Em quais dias?' : 'Em qual dia?'}</legend>

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
                  className={`pressable flex h-16 flex-1 flex-col items-center justify-center rounded-3xl
                    border-2 text-base font-extrabold shadow-sticker transition
                    ${
                      active
                        ? 'surface-gradient border-ink-900 text-paper-50 shadow-stickerLg'
                        : 'border-hairline bg-surface text-ink-400 hover:-translate-y-0.5 hover:border-hairline'
                    }`}
                >
                  <span>{day.label}</span>
                  <span
                    aria-hidden
                    className={`text-[9px] font-extrabold uppercase tracking-wide
                      ${day.key === todayKey ? '' : 'invisible'}
                      ${active ? 'text-accent-300' : 'text-accent-600'}`}
                  >
                    hoje
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-xs font-medium text-ink-500">
            {repeats ? (
              'A tarefa reaparece nesses dias, semana após semana.'
            ) : targetDate === today ? (
              <>
                📅 Vai para <strong className="text-ink-700">hoje</strong>.
              </>
            ) : (
              <>
                📅 Vai para <strong className="text-ink-700">{formatLongDate(targetDate!)}</strong>.
              </>
            )}
          </p>
        </fieldset>
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
      <label className="pressable flex cursor-pointer items-center justify-between gap-3 rounded-3xl border-2 border-hairline bg-surface px-4 py-3.5 shadow-sticker">
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink-700">🔁 Repetir toda semana</span>
          <span className="block text-xs text-ink-400">
            {repeats ? 'Volta nos dias marcados, toda semana' : 'Acontece uma vez só'}
          </span>
        </span>
        <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
          <input
            type="checkbox"
            checked={repeats}
            onChange={(e) => handleRepeatsChange(e.target.checked)}
            className="peer h-full w-full cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-ink-900"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5"
          />
        </span>
      </label>

      <ErrorBanner message={error} />

      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-1 pb-2 pt-5">
        <Button type="submit" full loading={pending}>
          Adicionar tarefa
        </Button>
      </div>
    </form>
  );
}
