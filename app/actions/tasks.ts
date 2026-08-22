'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth';
import { isCategory, isPeriod, isScope } from '@/lib/categories';
import {
  WEEKDAYS,
  buildRecurrenceRule,
  isISODate,
  todayISO,
  type WeekdayKey,
} from '@/lib/dates';
import { fail, type ActionResult } from '@/lib/action-result';
import type { TaskPeriod } from '@/types';

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/delegado');
}

/** Mensagem do Postgres → algo que faça sentido para quem está usando. */
function translate(message: string): string {
  if (message.includes('row-level security') || message.includes('42501')) {
    return 'Você não tem permissão para isso.';
  }
  if (message.includes('tasks_delegated_needs_target')) {
    return 'Escolha para quem você quer delegar a tarefa.';
  }
  if (message.includes('só pode marcar')) {
    return 'Esta tarefa é de outra pessoa: você só pode marcá-la como concluída.';
  }
  return message;
}

// ---------------------------------------------------------------------
// Criar tarefa
// ---------------------------------------------------------------------
export async function createTask(formData: FormData): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');
  if (!session.permissions.includes('create_task')) {
    return fail('Você não tem permissão para criar tarefas.');
  }

  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '');
  const scope = String(formData.get('scope') ?? '');
  const periodRaw = String(formData.get('period') ?? '');
  const timeRaw = String(formData.get('time') ?? '').trim();
  const delegatedTo = String(formData.get('delegated_to') ?? '').trim();
  const dateRaw = String(formData.get('date') ?? '').trim();
  const days = formData.getAll('weekdays').map(String);

  if (!title) return fail('Escreva o que precisa ser feito.');
  if (title.length > 200) return fail('O título ficou longo demais (máximo 200 caracteres).');
  if (!isCategory(category)) return fail('Escolha uma categoria.');
  if (!isScope(scope)) return fail('Escolha se a tarefa é sua ou se vai ser delegada.');
  if (scope === 'delegated' && !delegatedTo) return fail('Escolha para quem você quer delegar.');

  const validDays = days.filter((d): d is WeekdayKey =>
    WEEKDAYS.some((w) => w.key === d),
  );
  const recurrenceRule = buildRecurrenceRule(validDays);

  const period: TaskPeriod | null = isPeriod(periodRaw) ? periodRaw : null;
  const time = /^\d{2}:\d{2}$/.test(timeRaw) ? timeRaw : null;

  // O dia da semana escolhido no formulário chega já resolvido em data.
  // Recorrente não tem "um" dia: a regra é que manda, então fica em hoje.
  const date =
    scope !== 'today' ? null : recurrenceRule || !isISODate(dateRaw) ? todayISO() : dateRaw;

  const supabase = createClient();
  const { error } = await supabase.from('tasks').insert({
    title,
    category,
    scope,
    date,
    period: scope === 'today' ? period : null,
    time,
    delegated_to: scope === 'delegated' ? delegatedTo : null,
    created_by: session.userId,
    is_recurring: !!recurrenceRule,
    recurrence_rule: recurrenceRule,
  });

  if (error) return fail(translate(error.message));

  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Concluir / desmarcar
// ---------------------------------------------------------------------
export async function toggleTask(
  taskId: string,
  isRecurring: boolean,
  done: boolean,
  date: string = todayISO(),
): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');

  const supabase = createClient();

  if (isRecurring) {
    // Recorrente: a conclusão vale só para o dia.
    const { error } = done
      ? await supabase
          .from('task_completions')
          .upsert(
            { task_id: taskId, date, completed_by: session.userId },
            { onConflict: 'task_id,date' },
          )
      : await supabase.from('task_completions').delete().eq('task_id', taskId).eq('date', date);

    if (error) return fail(translate(error.message));
  } else {
    const { error } = await supabase.from('tasks').update({ is_done: done }).eq('id', taskId);
    if (error) return fail(translate(error.message));
  }

  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Reagendar
// ---------------------------------------------------------------------
/** Joga a tarefa para outro dia da semana. */
export async function moveTaskToDay(taskId: string, date: string): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');
  if (!isISODate(date)) return fail('Escolha um dia válido.');

  const supabase = createClient();
  const { error } = await supabase
    .from('tasks')
    .update({ scope: 'today', date })
    .eq('id', taskId);

  if (error) return fail(translate(error.message));

  revalidateAll();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Excluir
// ---------------------------------------------------------------------
export async function deleteTask(taskId: string): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');

  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) return fail(translate(error.message));

  revalidateAll();
  return { ok: true };
}
