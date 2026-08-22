import { createClient } from '@/lib/supabase/server';
import {
  formatShortDate,
  getWeekday,
  recurrenceMatchesDate,
  todayISO,
  weekDates,
  weekdayOf,
  type WeekdayKey,
} from '@/lib/dates';
import type { Task } from '@/types';

/** Tarefa já resolvida para a tela: sabe quem é quem e se está feita HOJE. */
export type TaskView = Task & {
  delegate: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
  /** Para recorrentes, vem de task_completions na data em questão. */
  done: boolean;
  /** Era para um dia que já passou e não foi concluída. */
  overdue: boolean;
};

const SELECT = `
  *,
  delegate:profiles!tasks_delegated_to_fkey(id, name),
  author:profiles!tasks_created_by_fkey(id, name)
`;

type Row = Task & {
  delegate: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
};

/** Erro do Supabase virado em mensagem para a tela. */
export type QueryResult<T> = { data: T; error: string | null };

function friendlyError(message: string | undefined): string {
  if (!message) return 'Não foi possível carregar as tarefas. Tente de novo.';
  if (message.includes('JWT') || message.includes('session')) {
    return 'Sua sessão expirou. Entre novamente.';
  }
  return `Não foi possível carregar as tarefas: ${message}`;
}

/**
 * Só o que é "meu": o que foi delegado para mim, ou o que criei e não
 * deleguei para ninguém. O que eu deleguei mora na tela /delegado.
 */
function mineFilter(userId: string) {
  return `delegated_to.eq.${userId},and(delegated_to.is.null,created_by.eq.${userId})`;
}

/** Conclusões registradas para uma data (usado pelas recorrentes). */
async function completionsFor(date: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase.from('task_completions').select('task_id').eq('date', date);
  return new Set((data ?? []).map((c) => c.task_id));
}

function toView(row: Row, date: string, completions: Set<string>): TaskView {
  const done = row.is_recurring ? completions.has(row.id) : row.is_done;
  return {
    ...row,
    delegate: row.delegate ?? null,
    author: row.author ?? null,
    done,
    overdue: !done && !row.is_recurring && !!row.date && row.date < date,
  };
}

// ---------------------------------------------------------------------
// Tarefas sem dia marcado (scope "this_week")
//
// O destino "Essa semana" saiu do formulário quando a Agenda virou a tela
// única. O que já estava nesse balde continua aparecendo num bloco à parte
// da Agenda, para poder ganhar um dia. Quando esvaziar, o bloco some.
// ---------------------------------------------------------------------
export async function getUndatedTasks(
  userId: string,
  date: string = todayISO(),
): Promise<QueryResult<TaskView[]>> {
  const supabase = createClient();

  const [{ data, error }, completions] = await Promise.all([
    supabase
      .from('tasks')
      .select(SELECT)
      .eq('scope', 'this_week')
      .or(mineFilter(userId))
      .order('is_done', { ascending: true })
      .order('created_at', { ascending: false }),
    completionsFor(date),
  ]);

  if (error) return { data: [], error: friendlyError(error.message) };

  const rows = (data ?? []) as unknown as Row[];
  return { data: rows.map((r) => toView(r, date, completions)), error: null };
}

// ---------------------------------------------------------------------
// Atrasadas — o que ficou para trás antes da semana exibida
//
// Os dias passados da própria semana já aparecem na régua, então aqui
// entram só os mais velhos que isso: sem esse bloco eles sumiriam de vista.
// ---------------------------------------------------------------------
export async function getOverdueTasks(
  userId: string,
  before: string,
): Promise<QueryResult<TaskView[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(SELECT)
    .or(mineFilter(userId))
    .eq('scope', 'today')
    .eq('is_done', false)
    .eq('is_recurring', false)
    .lt('date', before)
    .order('date', { ascending: true });

  if (error) return { data: [], error: friendlyError(error.message) };

  const rows = (data ?? []) as unknown as Row[];
  return { data: rows.map((r) => toView(r, before, NO_COMPLETIONS)), error: null };
}

// ---------------------------------------------------------------------
// Tela Delegado
// ---------------------------------------------------------------------
export async function getDelegatedTasks(
  date: string = todayISO(),
): Promise<QueryResult<TaskView[]>> {
  const supabase = createClient();

  const [{ data, error }, completions] = await Promise.all([
    supabase
      .from('tasks')
      .select(SELECT)
      .eq('scope', 'delegated')
      .order('is_done', { ascending: true })
      .order('date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    completionsFor(date),
  ]);

  if (error) return { data: [], error: friendlyError(error.message) };

  const rows = (data ?? []) as unknown as Row[];
  return { data: rows.map((r) => toView(r, date, completions)), error: null };
}

// ---------------------------------------------------------------------
// Tela Agenda — a semana aberta dia a dia
// ---------------------------------------------------------------------
export type AgendaDay = {
  date: string;
  weekday: WeekdayKey;
  /** "Segunda" */
  label: string;
  /** "Seg" */
  short: string;
  /** "25/08" */
  dayMonth: string;
  isToday: boolean;
  isPast: boolean;
  tasks: TaskView[];
  doneCount: number;
};

export type AgendaWeek = {
  start: string;
  end: string;
  days: AgendaDay[];
  total: number;
  doneCount: number;
};

const NO_COMPLETIONS: Set<string> = new Set();

/** Conclusões de um intervalo inteiro, agrupadas por data. */
async function completionsBetween(from: string, to: string): Promise<Map<string, Set<string>>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('task_completions')
    .select('task_id, date')
    .gte('date', from)
    .lte('date', to);

  const byDate = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const set = byDate.get(row.date) ?? new Set<string>();
    set.add(row.task_id);
    byDate.set(row.date, set);
  }
  return byDate;
}

/**
 * Uma semana com as tarefas encaixadas em cada dia: as datadas caem no
 * seu dia; as recorrentes se repetem em todos os dias que a regra alcança.
 */
export async function getAgendaWeek(
  userId: string,
  startISO: string,
  today: string = todayISO(),
): Promise<QueryResult<AgendaWeek>> {
  const supabase = createClient();

  const dates = weekDates(startISO);
  const first = dates[0]!;
  const last = dates[6]!;

  const days: AgendaDay[] = dates.map((date) => {
    const meta = getWeekday(weekdayOf(date));
    return {
      date,
      weekday: meta.key,
      label: meta.full,
      short: meta.short,
      dayMonth: formatShortDate(date),
      isToday: date === today,
      isPast: date < today,
      tasks: [] as TaskView[],
      doneCount: 0,
    };
  });

  const week: AgendaWeek = { start: first, end: last, days, total: 0, doneCount: 0 };

  const [{ data, error }, completions] = await Promise.all([
    supabase
      .from('tasks')
      .select(SELECT)
      .or(mineFilter(userId))
      // Ou tem data dentro da semana, ou é recorrente — aí a regra diz o dia.
      .or(`and(date.gte.${first},date.lte.${last}),is_recurring.eq.true`)
      .order('time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    completionsBetween(first, last),
  ]);

  if (error) return { data: week, error: friendlyError(error.message) };

  for (const row of (data ?? []) as unknown as Row[]) {
    for (const day of days) {
      const belongsHere = row.is_recurring
        ? recurrenceMatchesDate(row.recurrence_rule, day.date)
        : row.date === day.date;
      if (!belongsHere) continue;

      const view = toView(row, day.date, completions.get(day.date) ?? NO_COMPLETIONS);
      // Na agenda o atraso é medido contra hoje, não contra o dia da coluna.
      day.tasks.push({ ...view, overdue: !view.done && !row.is_recurring && day.date < today });
    }
  }

  for (const day of days) {
    day.doneCount = day.tasks.filter((t) => t.done).length;
    week.total += day.tasks.length;
    week.doneCount += day.doneCount;
  }

  return { data: week, error: null };
}

// ---------------------------------------------------------------------
// Pessoas que podem receber delegação (para o formulário)
// ---------------------------------------------------------------------
export async function getDelegateOptions(
  userId: string,
): Promise<{ id: string; name: string }[]> {
  const supabase = createClient();

  const { data: permission } = await supabase
    .from('permissions')
    .select('id')
    .eq('key', 'receive_delegated_task')
    .maybeSingle();

  if (!permission) return [];

  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('role_id')
    .eq('permission_id', permission.id);

  const roleIds = (rolePermissions ?? []).map((rp) => rp.role_id);
  if (!roleIds.length) return [];

  const { data } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('role_id', roleIds)
    .neq('id', userId)
    .order('name', { ascending: true });

  return (data ?? []).map((p) => ({ id: p.id, name: p.name || p.email }));
}
