-- =====================================================================
-- Agenda da Família — 01. Schema inicial
-- Tabelas: roles, permissions, role_permissions, profiles, tasks
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

comment on table public.roles is 'Papéis de acesso (Admin, Membro, Ajudante...)';

-- ---------------------------------------------------------------------
-- permissions
-- ---------------------------------------------------------------------
create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

comment on table public.permissions is 'Permissões atômicas do sistema, referenciadas por key.';

-- ---------------------------------------------------------------------
-- role_permissions (N:N)
-- ---------------------------------------------------------------------
create table if not exists public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index if not exists role_permissions_permission_id_idx
  on public.role_permissions (permission_id);

-- ---------------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text not null default '',
  role_id    uuid references public.roles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_id_idx on public.profiles (role_id);

comment on table public.profiles is 'Perfil da pessoa da família, espelha auth.users.';

-- ---------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(btrim(title)) > 0),
  category        text not null check (
                    category in ('trabalho','casa','alimentacao','familia','treino','espiritual','compromisso')
                  ),
  scope           text not null default 'today' check (scope in ('today','this_week','delegated')),
  "date"          date,
  period          text check (period in ('manha','tarde','noite')),
  "time"          time,
  delegated_to    uuid references public.profiles(id) on delete set null,
  created_by      uuid not null references public.profiles(id) on delete cascade,
  is_done         boolean not null default false,
  is_recurring    boolean not null default false,
  recurrence_rule text,
  created_at      timestamptz not null default now(),

  -- tarefa delegada precisa ter um destinatário
  constraint tasks_delegated_needs_target
    check (scope <> 'delegated' or delegated_to is not null)
);

create index if not exists tasks_created_by_idx   on public.tasks (created_by);
create index if not exists tasks_delegated_to_idx on public.tasks (delegated_to);
create index if not exists tasks_scope_date_idx   on public.tasks (scope, "date");
create index if not exists tasks_date_idx         on public.tasks ("date");

comment on column public.tasks.recurrence_rule is 'Ex.: "weekly:mon,wed,fri"';

-- ---------------------------------------------------------------------
-- Helpers de permissão
-- SECURITY DEFINER: ignoram RLS, o que evita recursão infinita quando
-- são usados dentro das policies das próprias tabelas.
-- ---------------------------------------------------------------------
create or replace function public.current_role_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $fn$
  select role_id from public.profiles where id = auth.uid();
$fn$;

create or replace function public.has_permission(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.profiles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions p       on p.id = rp.permission_id
    where pr.id = auth.uid()
      and p.key = p_key
  );
$fn$;

-- Lista das permissões do usuário logado (o app usa para montar o menu/UI)
create or replace function public.my_permissions()
returns setof text
language sql
stable
security definer
set search_path = public
as $fn$
  select p.key
  from public.profiles pr
  join public.role_permissions rp on rp.role_id = pr.role_id
  join public.permissions p       on p.id = rp.permission_id
  where pr.id = auth.uid();
$fn$;

-- A pessoa pode receber tarefas delegadas?
create or replace function public.can_receive_delegation(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.profiles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions p       on p.id = rp.permission_id
    where pr.id = p_profile_id
      and p.key = 'receive_delegated_task'
  );
$fn$;

grant execute on function public.has_permission(text)         to authenticated;
grant execute on function public.current_role_id()            to authenticated;
grant execute on function public.my_permissions()             to authenticated;
grant execute on function public.can_receive_delegation(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Criação automática do profile quando um usuário nasce no Auth.
-- O PRIMEIRO usuário do sistema vira Admin automaticamente (bootstrap).
-- Nos demais, respeita o role_id vindo do user_metadata; senão, "Membro".
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_role_id  uuid;
  v_is_first boolean;
begin
  select not exists (select 1 from public.profiles) into v_is_first;

  if v_is_first then
    select id into v_role_id from public.roles where name = 'Admin';
  else
    begin
      v_role_id := nullif(new.raw_user_meta_data ->> 'role_id', '')::uuid;
    exception when others then
      v_role_id := null;
    end;

    if v_role_id is null or not exists (select 1 from public.roles where id = v_role_id) then
      select id into v_role_id from public.roles where name = 'Membro';
    end if;
  end if;

  insert into public.profiles (id, name, email, role_id)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    v_role_id
  )
  on conflict (id) do nothing;

  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém profiles.email em sincronia se o e-mail mudar no Auth
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();
