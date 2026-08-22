-- =====================================================================
-- Agenda da Família — 03. Seed de papéis e permissões
-- Idempotente: pode rodar mais de uma vez sem duplicar nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('manage_users',           'Cadastrar, editar e remover pessoas da família'),
  ('manage_roles',           'Criar papéis e definir quais permissões cada um tem'),
  ('create_task',            'Criar tarefas'),
  ('view_all_tasks',         'Ver as tarefas de todo mundo, não só as próprias'),
  ('edit_others_tasks',      'Editar e excluir tarefas criadas por outras pessoas'),
  ('receive_delegated_task', 'Pode receber tarefas delegadas')
on conflict (key) do update set description = excluded.description;

-- ---------------------------------------------------------------------
-- Papéis
-- ---------------------------------------------------------------------
insert into public.roles (name, description) values
  ('Admin',   'Acesso total: pessoas, papéis e todas as tarefas'),
  ('Membro',  'Cria as próprias tarefas, vê as da família e recebe delegações'),
  ('Ajudante','Vê e conclui apenas as tarefas delegadas para ela')
on conflict (name) do update set description = excluded.description;

-- ---------------------------------------------------------------------
-- Admin: todas as permissões
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Admin'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Membro: create_task, view_all_tasks, receive_delegated_task
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.key in ('create_task', 'view_all_tasks', 'receive_delegated_task')
where r.name = 'Membro'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Ajudante: só recebe delegações
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.key in ('receive_delegated_task')
where r.name = 'Ajudante'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Rede de segurança: se você já criou seu usuário no Auth ANTES de rodar
-- estas migrations, o profile pode ter ficado sem papel. A linha abaixo
-- promove a primeira pessoa cadastrada a Admin.
-- ---------------------------------------------------------------------
update public.profiles
set role_id = (select id from public.roles where name = 'Admin')
where role_id is null
  and id = (select id from public.profiles order by created_at asc limit 1);
