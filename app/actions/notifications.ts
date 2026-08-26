'use server';

import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth';
import { fail, type ActionResult } from '@/lib/action-result';

type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Mensagem do Postgres → algo que faça sentido para quem está usando. */
function translate(message: string): string {
  if (message.includes('row-level security') || message.includes('42501')) {
    return 'Você não tem permissão para isso.';
  }
  return message;
}

/** Grava (ou atualiza) a inscrição deste aparelho para receber lembretes. */
export async function subscribeToPush(subscription: PushSubscriptionInput): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');

  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return fail('Inscrição de notificação inválida.');
  }

  const supabase = createClient();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: session.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'endpoint' },
  );

  if (error) return fail(translate(error.message));
  return { ok: true };
}

/** Remove a inscrição deste aparelho — para de receber lembretes. */
export async function unsubscribeFromPush(endpoint: string): Promise<ActionResult> {
  const session = await getSessionContext();
  if (!session) return fail('Sua sessão expirou. Entre novamente.');
  if (!endpoint) return fail('Inscrição de notificação inválida.');

  const supabase = createClient();
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

  if (error) return fail(translate(error.message));
  return { ok: true };
}
