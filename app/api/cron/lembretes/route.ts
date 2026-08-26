import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';
import { recurrenceMatchesDate, todayISOIn } from '@/lib/dates';

export const dynamic = 'force-dynamic';

/** Casa é no Brasil: o cron não tem cookie de fuso de ninguém para ler. */
const TIMEZONE = 'America/Sao_Paulo';

type TaskRow = {
  id: string;
  title: string;
  date: string | null;
  delegated_to: string | null;
  created_by: string;
  is_done: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
};

/**
 * Lembrete diário: 1x por dia (limite do plano gratuito da Vercel), lista
 * as tarefas pendentes de hoje de cada pessoa com notificação ativada.
 *
 * Protegido pelo padrão oficial da Vercel: se CRON_SECRET existir, ela manda
 * `Authorization: Bearer <valor>` sozinha em toda chamada de cron.
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = todayISOIn(TIMEZONE);
  const supabase = createAdminClient();

  const [{ data: tasks, error: tasksError }, { data: completions }, { data: subscriptions }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, date, delegated_to, created_by, is_done, is_recurring, recurrence_rule')
        .or(`date.eq.${today},is_recurring.eq.true`),
      supabase.from('task_completions').select('task_id').eq('date', today),
      supabase.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth'),
    ]);

  if (tasksError) {
    return Response.json({ ok: false, error: tasksError.message }, { status: 500 });
  }
  if (!subscriptions?.length) {
    return Response.json({ ok: true, notified: 0 });
  }

  const doneToday = new Set((completions ?? []).map((c) => c.task_id));

  // Mesma regra de "de quem é" e "está feita hoje" usada na Agenda (lib/tasks.ts).
  const pendingByOwner = new Map<string, string[]>();
  for (const task of (tasks ?? []) as TaskRow[]) {
    const belongsToday = task.is_recurring
      ? recurrenceMatchesDate(task.recurrence_rule, today)
      : task.date === today;
    if (!belongsToday) continue;

    const done = task.is_recurring ? doneToday.has(task.id) : task.is_done;
    if (done) continue;

    const owner = task.delegated_to ?? task.created_by;
    const titles = pendingByOwner.get(owner) ?? [];
    titles.push(task.title);
    pendingByOwner.set(owner, titles);
  }

  if (!pendingByOwner.size) {
    return Response.json({ ok: true, notified: 0 });
  }

  webpush.setVapidDetails(
    env.vapidSubject,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    env.vapidPrivateKey,
  );

  const subsByOwner = new Map<string, typeof subscriptions>();
  for (const sub of subscriptions) {
    const list = subsByOwner.get(sub.user_id) ?? [];
    list.push(sub);
    subsByOwner.set(sub.user_id, list);
  }

  const expiredIds: string[] = [];
  let notified = 0;

  for (const [ownerId, titles] of pendingByOwner) {
    const subs = subsByOwner.get(ownerId);
    if (!subs?.length) continue;

    const preview = titles.slice(0, 3).join(', ');
    const rest = titles.length > 3 ? ` e mais ${titles.length - 3}` : '';
    const payload = JSON.stringify({
      title: `Bom dia! ${titles.length} tarefa${titles.length > 1 ? 's' : ''} hoje`,
      body: `${preview}${rest}`,
      url: '/',
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        notified += 1;
      } catch (err) {
        // Inscrição expirada ou revogada no navegador: some da tabela sozinha.
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) expiredIds.push(sub.id);
      }
    }
  }

  if (expiredIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', expiredIds);
  }

  return Response.json({ ok: true, notified });
}
