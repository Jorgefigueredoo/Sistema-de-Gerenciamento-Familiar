import type { PermissionKey } from '@/types';

/** Catálogo espelhando o seed em /supabase/migrations. */
export const PERMISSIONS: { key: PermissionKey; label: string; description: string }[] = [
  {
    key: 'manage_users',
    label: 'Gerenciar pessoas',
    description: 'Cadastrar, editar e remover pessoas da família',
  },
  {
    key: 'manage_roles',
    label: 'Gerenciar papéis',
    description: 'Criar papéis e definir quais permissões cada um tem',
  },
  {
    key: 'create_task',
    label: 'Criar tarefas',
    description: 'Criar tarefas para si mesma ou para delegar',
  },
  {
    key: 'view_all_tasks',
    label: 'Ver todas as tarefas',
    description: 'Ver as tarefas de todo mundo, não só as próprias',
  },
  {
    key: 'edit_others_tasks',
    label: 'Editar tarefas dos outros',
    description: 'Editar e excluir tarefas criadas por outras pessoas',
  },
  {
    key: 'receive_delegated_task',
    label: 'Receber delegações',
    description: 'Pode receber tarefas delegadas',
  },
];

export const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, p.label]),
);

export function can(permissions: string[] | undefined | null, key: PermissionKey): boolean {
  return !!permissions?.includes(key);
}

export function canAny(permissions: string[] | undefined | null, keys: PermissionKey[]): boolean {
  return keys.some((k) => can(permissions, k));
}

/** Rotas protegidas por permissão — usado pelo layout e pelo menu. */
export const ROUTE_PERMISSIONS: { path: string; permission: PermissionKey }[] = [
  { path: '/admin/usuarios', permission: 'manage_users' },
  { path: '/admin/papeis', permission: 'manage_roles' },
];

export function requiredPermissionForPath(pathname: string): PermissionKey | null {
  const match = ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.path));
  return match ? match.permission : null;
}
