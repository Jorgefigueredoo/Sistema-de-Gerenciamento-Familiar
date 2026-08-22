import type { Database } from './database';

export type {
  Database,
  PermissionKey,
  TaskCategory,
  TaskPeriod,
  TaskScope,
} from './database';

type Tables = Database['public']['Tables'];

export type Role = Tables['roles']['Row'];
export type Permission = Tables['permissions']['Row'];
export type RolePermission = Tables['role_permissions']['Row'];
export type Profile = Tables['profiles']['Row'];
export type Task = Tables['tasks']['Row'];

export type NewTask = Tables['tasks']['Insert'];
export type TaskUpdate = Tables['tasks']['Update'];

/** Perfil + papel, do jeito que as telas consomem. */
export type ProfileWithRole = Profile & {
  role: Pick<Role, 'id' | 'name' | 'description'> | null;
};

/** Tarefa + quem recebeu a delegação e quem criou. */
export type TaskWithPeople = Task & {
  delegate: Pick<Profile, 'id' | 'name'> | null;
  author: Pick<Profile, 'id' | 'name'> | null;
};

/** Papel + a lista de keys de permissão que ele carrega. */
export type RoleWithPermissions = Role & {
  permissionIds: string[];
};

/** Sessão resolvida no servidor: quem sou eu e o que posso fazer. */
export type SessionContext = {
  userId: string;
  profile: ProfileWithRole;
  permissions: string[];
};
