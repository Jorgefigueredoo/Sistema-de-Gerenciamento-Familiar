-- =====================================================================
-- Agenda da Família — 02. Row Level Security
-- Sistema privado: nada é acessível para `anon`. Tudo passa por
-- permissões (RBAC) resolvidas via public.has_permission(key).
-- =====================================================================

alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles         enable row level security;
alter table public.tasks            enable row level security;

-- Privilégios de tabela: só usuários autenticados. O RLS refina depois.
revoke all on public.roles, public.permissions, public.role_permissions,
              public.profiles, public.tasks from anon;

grant select on public.roles, public.permissions, public.role_permissions to authenticated;
grant insert, update, delete on public.roles, public.permissions, public.role_permissions to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

-- ---------------------------------------------------------------------
-- roles
-- Leitura liberada para autenticados (a UI mostra o papel de cada um).
-- Escrita apenas com manage_roles.
-- ---------------------------------------------------------------------
drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles
  for select to authenticated
  using (true);

drop policy if exists roles_insert on public.roles;
create policy roles_insert on public.roles
  for insert to authenticated
  with check (public.has_permission('manage_roles'));

drop policy if exists roles_update on public.roles;
create policy roles_update on public.roles
  for update to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

drop policy if exists roles_delete on public.roles;
create policy roles_delete on public.roles
  for delete to authenticated
  using (
    public.has_permission('manage_roles')
    -- nunca deixar o sistema sem Admin
    and name <> 'Admin'
  );

-- ---------------------------------------------------------------------
-- permissions
-- Catálogo do sistema: leitura para autenticados, escrita só manage_roles.
-- ---------------------------------------------------------------------
drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
  for select to authenticated
  using (true);

drop policy if exists permissions_write on public.permissions;
create policy permissions_write on public.permissions
  for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

-- ---------------------------------------------------------------------
-- role_permissions
-- ---------------------------------------------------------------------
drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (true);

drop policy if exists role_permissions_write on public.role_permissions;
create policy role_permissions_write on public.role_permissions
  for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

-- ---------------------------------------------------------------------
-- profiles
-- Vejo sempre a mim mesmo. Vejo os outros se tenho view_all_tasks
-- (preciso mostrar "delegado para Fulano") ou manage_users.
-- ---------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.has_permission('view_all_tasks')
    or public.has_permission('manage_users')
  );

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.has_permission('manage_users'));

-- Posso editar meu nome, mas NÃO meu próprio papel.
-- Quem tem manage_users edita qualquer perfil, inclusive o papel.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (
    id = auth.uid()
    or public.has_permission('manage_users')
  )
  with check (
    public.has_permission('manage_users')
    or (id = auth.uid() and role_id is not distinct from public.current_role_id())
  );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.has_permission('manage_users') and id <> auth.uid());

-- ---------------------------------------------------------------------
-- tasks
-- Vejo o que eu criei, o que foi delegado para mim, ou tudo se tenho
-- view_all_tasks. Edito o que é meu, o que foi delegado para mim
-- (para marcar como concluída) ou qualquer uma com edit_others_tasks.
-- ---------------------------------------------------------------------
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated
  using (
    created_by = auth.uid()
    or delegated_to = auth.uid()
    or public.has_permission('view_all_tasks')
  );

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (
    public.has_permission('create_task')
    and created_by = auth.uid()
    and (
      delegated_to is null
      or delegated_to = auth.uid()
      or public.can_receive_delegation(delegated_to)
    )
  );

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update to authenticated
  using (
    created_by = auth.uid()
    or delegated_to = auth.uid()
    or public.has_permission('edit_others_tasks')
  )
  with check (
    (
      created_by = auth.uid()
      or delegated_to = auth.uid()
      or public.has_permission('edit_others_tasks')
    )
    and (
      delegated_to is null
      or delegated_to = auth.uid()
      or public.can_receive_delegation(delegated_to)
    )
  );

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete to authenticated
  using (
    created_by = auth.uid()
    or public.has_permission('edit_others_tasks')
  );

-- ---------------------------------------------------------------------
-- Trava extra: quem só recebeu a tarefa (delegado) pode marcar
-- concluída/desmarcar, mas não reescrever a tarefa dos outros.
-- ---------------------------------------------------------------------
create or replace function public.tasks_guard_delegate_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  -- service_role / postgres (sem JWT) passa direto
  if auth.uid() is null then
    return new;
  end if;

  if new.created_by = auth.uid() or public.has_permission('edit_others_tasks') then
    return new;
  end if;

  -- Chegou aqui: só pode ser o destinatário da delegação.
  if new.title           is distinct from old.title
     or new.category     is distinct from old.category
     or new.scope        is distinct from old.scope
     or new."date"       is distinct from old."date"
     or new.period       is distinct from old.period
     or new."time"       is distinct from old."time"
     or new.delegated_to is distinct from old.delegated_to
     or new.created_by   is distinct from old.created_by
     or new.is_recurring is distinct from old.is_recurring
     or new.recurrence_rule is distinct from old.recurrence_rule
  then
    raise exception 'Você só pode marcar esta tarefa como concluída.'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists tasks_guard_delegate_update on public.tasks;
create trigger tasks_guard_delegate_update
  before update on public.tasks
  for each row execute function public.tasks_guard_delegate_update();
