'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { createRole, deleteRole, updateRolePermissions } from '@/app/actions/admin';
import { PERMISSION_LABELS } from '@/lib/permissions';
import type { Permission, Role } from '@/types';

export type RoleRow = Role & {
  permissionIds: string[];
  peopleCount: number;
};

const INPUT = 'field';

export function RolesManager({
  roles,
  permissions,
}: {
  roles: RoleRow[];
  permissions: Permission[];
}) {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {roles.map((role) => (
          <li key={role.id}>
            <button
              type="button"
              onClick={() => setEditing(role)}
              className="pressable w-full rounded-3xl border border-white bg-white p-4 text-left shadow-soft transition hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-extrabold tracking-tight text-ink-900">{role.name}</p>
                <span className="shrink-0 text-xs font-medium text-ink-400">
                  {role.peopleCount} pessoa{role.peopleCount === 1 ? '' : 's'}
                </span>
              </div>

              {role.description && (
                <p className="mt-0.5 text-xs text-ink-500">{role.description}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-1">
                {role.permissionIds.length === 0 && (
                  <span className="text-xs text-ink-400">Nenhuma permissão marcada</span>
                )}
                {permissions
                  .filter((p) => role.permissionIds.includes(p.id))
                  .map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100"
                    >
                      {PERMISSION_LABELS[p.key] ?? p.key}
                    </span>
                  ))}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Button full className="mt-4" onClick={() => setNewOpen(true)}>
        + Novo papel
      </Button>

      <BottomSheet open={newOpen} title="Novo papel" onClose={() => setNewOpen(false)}>
        <NewRoleForm
          onDone={() => {
            setNewOpen(false);
            router.refresh();
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={!!editing}
        title={editing?.name ?? ''}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <PermissionEditor
            role={editing}
            permissions={permissions}
            onDone={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </BottomSheet>
    </>
  );
}

function NewRoleForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createRole(formData);
      if (!result.ok) setError(result.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="label">Nome do papel</span>
        <input name="name" type="text" required placeholder="Ex.: Ajudante" className={INPUT} />
      </label>

      <label className="block">
        <span className="label">
          Descrição <span className="font-normal text-ink-400">(opcional)</span>
        </span>
        <input
          name="description"
          type="text"
          placeholder="O que essa pessoa faz no dia a dia"
          className={INPUT}
        />
      </label>

      <ErrorBanner message={error} />

      <Button type="submit" full loading={pending}>
        Criar papel
      </Button>

      <p className="text-center text-xs text-ink-500">
        Depois de criar, toque no papel para marcar as permissões.
      </p>
    </form>
  );
}

function PermissionEditor({
  role,
  permissions,
  onDone,
}: {
  role: RoleRow;
  permissions: Permission[];
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(role.permissionIds);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isAdmin = role.name === 'Admin';

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateRolePermissions(role.id, selected);
      if (!result.ok) setError(result.error);
      else onDone();
    });
  }

  function remove() {
    if (!confirm(`Excluir o papel "${role.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteRole(role.id);
      if (!result.ok) setError(result.error);
      else onDone();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {role.description && <p className="text-sm text-ink-500">{role.description}</p>}

      {isAdmin && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs font-medium text-amber-800">
          Cuidado ao mexer no Admin: se você tirar <strong>Gerenciar papéis</strong>, ninguém
          mais consegue abrir esta tela.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {permissions.map((permission) => {
          const checked = selected.includes(permission.id);
          return (
            <li key={permission.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(permission.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-ink-300 accent-brand-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-800">
                    {PERMISSION_LABELS[permission.key] ?? permission.key}
                  </span>
                  <span className="block text-xs text-ink-500">{permission.description}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <ErrorBanner message={error} />

      <Button full loading={pending} onClick={save}>
        Salvar permissões
      </Button>

      {!isAdmin && (
        <Button variant="danger" full loading={pending} onClick={remove}>
          🗑️ Excluir papel
        </Button>
      )}
    </div>
  );
}
