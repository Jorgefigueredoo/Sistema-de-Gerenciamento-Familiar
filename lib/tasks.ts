import { createClient } from '@/lib/supabase/server';
import { recurrenceMatchesDate, todayISO } from '@/lib/dates';
import type { Task, TaskPeriod } from '@/types';

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
// Tela Hoje
// ---------------------------------------------------------------------
export type TodayBoard = {
  periods: Record<TaskPeriod, TaskView[]>;
  /** Sem período definido — aparecem em "A qualquer hora". */
  anytime: TaskView[];
  /** Ficaram para trás em dias anteriores e continuam pendentes. */
  overdue: TaskView[];
  total: number;
  doneCount: number;
};

export async function getTodayBoard(
  userId: string,
  date: string = todayISO(),
): Promise<QueryResult<TodayBoard>> {
  const supabase = createClient();

  const [{ data, error }, completions] = await Promise.all([
    supabase
      .from('tasks')
      .select(SELECT)
      .eq('scope', 'today')
      .or(`and(or(${mineFilter(userId)}),or(date.lte.${date},is_recurring.eq.true))`)
      .order('time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    completionsFor(date),
  ]);

  const empty: TodayBoard = {
    periods: { manha: [], tarde: [], noite: [] },
    anytime: [],
    overdue: [],
    total: 0,
    doneCount: 0,
  };

  if (error) return { data: empty, error: friendlyError(error.message) };

  const board = empty;

  for (const row of (data ?? []) as unknown as Row[]) {
    const view = toView(row, date, completions);

    // Recorrente entra apenas nos dias em que a regra cai.
    if (row.is_recurring) {
      if (!recurrenceMatchesDate(row.recurrence_rule, date)) continue;
    } else if (row.date !== date) {
      // Data passada: só continua se ficou pendente.
      if (!view.overdue) continue;
      board.overdue.push(view);
      continue;
    }

    if (view.period) board.periods[view.period].push(view);
    else board.anytime.push(view);
  }

  const doTasks = [
    ...board.periods.manha,
    ...board.periods.tarde,
    ...board.periods.noite,
    ...board.anytime,
  ];
  board.total = doTasks.length;
  board.doneCount = doTasks.filter((t) => t.done).length;

  return { data: board, error: null };
}

// ---------------------------------------------------------------------
// Tela Essa semana
// ---------------------------------------------------------------------
export async function getWeekTasks(
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
