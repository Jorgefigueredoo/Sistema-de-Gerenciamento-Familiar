'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionContext } from '@/lib/auth';
import { fail, type ActionResult } from '@/lib/action-result';
import type { PermissionKey } from '@/types';

/** Confere a permissão no servidor antes de qualquer operação de admin. */
async function guard(permission: PermissionKey) {
  const session = await getSessionContext();
  if (!session) return { session: null, error: 'Sua sessão expirou. Entre novamente.' };
  if (!session.permissions.includes(permission)) {
    return { session: null, error: 'Você não tem permissão para isso.' };
  }
  return { session, error: null };
}

function translate(message: string): string {
  if (message.includes('already been registered') || message.includes('duplicate key')) {
    return 'Já existe alguém cadastrado com esse e-mail.';
  }
  if (message.includes('roles_name_key')) return 'Já existe um papel com esse nome.';
  if (message.includes('row-level security')) return 'Você não tem permissão para isso.';
  if (message.includes('Password should be')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  return message;
}

// =====================================================================
// Pessoas
// =====================================================================
export async function createUser(formData: FormData): Promise<ActionResult> {
  const { error: denied } = await guard('manage_users');
  if (denied) return fail(denied);

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const roleId = String(formData.get('role_id') ?? '').trim();

  if (!name) return fail('Informe o nome da pessoa.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Informe um e-mail válido.');
  if (password.length < 6) return fail('A senha provisória precisa ter pelo menos 6 caracteres.');
  if (!roleId) return fail('Escolha o papel dessa pessoa.');

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role_id: roleId },
  });

  if (error) return fail(translate(error.message));

  // O gatilho handle_new_user já criou o profile; garantimos nome e papel
  // (o gatilho cai no padrão "Membro" se o metadata vier estranho).
  if (data.user) {
    await admin.from('profiles').update({ name, role_id: roleId }).eq('id', data.user.id);
  }

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function updateUserRole(userId: string, roleId: string): Promise<ActionResult> {
  const { session, error: denied } = await guard('manage_users');
  if (denied || !session) return fail(denied ?? 'Você não tem permissão para isso.');

  if (userId === session.userId) {
    return fail('Você não pode trocar o seu próprio papel — peça para outro administrador.');
  }

  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId);

  if (error) return fail(translate(error.message));

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function updateUserName(userId: string, name: string): Promise<ActionResult> {
  const { error: denied } = await guard('manage_users');
  if (denied) return fail(denied);

  const clean = name.trim();
  if (!clean) return fail('O nome não pode ficar vazio.');

  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ name: clean }).eq('id', userId);

  if (error) return fail(translate(error.message));

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function resetUserPassword(
  userId: string,
  password: string,
): Promise<ActionResult> {
  const { error: denied } = await guard('manage_users');
  if (denied) return fail(denied);

  if (password.length < 6) return fail('A senha precisa ter pelo menos 6 caracteres.');

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (error) return fail(translate(error.message));
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const { session, error: denied } = await guard('manage_users');
  if (denied || !session) return fail(denied ?? 'Você não tem permissão para isso.');

  if (userId === session.userId) return fail('Você não pode remover a si mesma.');

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) return fail(translate(error.message));

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

// =====================================================================
// Papéis e permissões
// =====================================================================
export async function createRole(formData: FormData): Promise<ActionResult> {
  const { error: denied } = await guard('manage_roles');
  if (denied) return fail(denied);

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) return fail('Dê um nome ao papel.');

  const supabase = createClient();
  const { error } = await supabase
    .from('roles')
    .insert({ name, description: description || null });

  if (error) return fail(translate(error.message));

  revalidatePath('/admin/papeis');
  return { ok: true };
}

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<ActionResult> {
  const { error: denied } = await guard('manage_roles');
  if (denied) return fail(denied);

  const supabase = createClient();

  const { data: current, error: readError } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', roleId);

  if (readError) return fail(translate(readError.message));

  const currentIds = new Set((current ?? []).map((rp) => rp.permission_id));
  const nextIds = new Set(permissionIds);

  const toAdd = permissionIds.filter((id) => !currentIds.has(id));
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

  if (toAdd.length) {
    const { error } = await supabase
      .from('role_permissions')
      .insert(toAdd.map((permission_id) => ({ role_id: roleId, permission_id })));
    if (error) return fail(translate(error.message));
  }

  if (toRemove.length) {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .in('permission_id', toRemove);
    if (error) return fail(translate(error.message));
  }

  revalidatePath('/admin/papeis');
  return { ok: true };
}

export async function deleteRole(roleId: string): Promise<ActionResult> {
  const { error: denied } = await guard('manage_roles');
  if (denied) return fail(denied);

  const supabase = createClient();

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', roleId);

  if (count && count > 0) {
    return fail(
      `Esse papel ainda está em uso por ${count} pessoa${count > 1 ? 's' : ''}. Troque o papel delas antes de excluir.`,
    );
  }

  const { error } = await supabase.from('roles').delete().eq('id', roleId);
  if (error) return fail(translate(error.message));

  revalidatePath('/admin/papeis');
  return { ok: true };
}
