-- =====================================================================
-- Agenda da Família — 04. Conclusão por dia (tarefas recorrentes)
--
-- Tarefa comum usa tasks.is_done.
-- Tarefa recorrente ("weekly:mon,wed,fri") não pode usar is_done: se
-- marcar na segunda, ela apareceria já concluída na quarta. Então cada
-- ocorrência concluída vira uma linha aqui.
-- =====================================================================

create table if not exists public.task_completions (
  task_id      uuid not null references public.tasks(id) on delete cascade,
  "date"       date not null,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz not null default now(),
  primary key (task_id, "date")
);

create index if not exists task_completions_date_idx on public.task_completions ("date");

-- ---------------------------------------------------------------------
-- Helpers: reaproveitam exatamente a mesma regra das policies de tasks
-- ---------------------------------------------------------------------
create or replace function public.can_view_task(p_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.tasks t
    where t.id = p_task_id
      and (
        t.created_by = auth.uid()
        or t.delegated_to = auth.uid()
        or public.has_permission('view_all_tasks')
      )
  );
$fn$;

create or replace function public.can_toggle_task(p_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.tasks t
    where t.id = p_task_id
      and (
        t.created_by = auth.uid()
        or t.delegated_to = auth.uid()
        or public.has_permission('edit_others_tasks')
      )
  );
$fn$;

grant execute on function public.can_view_task(uuid)   to authenticated;
grant execute on function public.can_toggle_task(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.task_completions enable row level security;

revoke all on public.task_completions from anon;
grant select, insert, delete on public.task_completions to authenticated;

drop policy if exists task_completions_select on public.task_completions;
create policy task_completions_select on public.task_completions
  for select to authenticated
  using (public.can_view_task(task_id));

drop policy if exists task_completions_insert on public.task_completions;
create policy task_completions_insert on public.task_completions
  for insert to authenticated
  with check (public.can_toggle_task(task_id));

drop policy if exists task_completions_delete on public.task_completions;
create policy task_completions_delete on public.task_completions
  for delete to authenticated
  using (public.can_toggle_task(task_id));
