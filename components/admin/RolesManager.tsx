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

const INPUT =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

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
      <ul className="flex flex-col gap-2">
        {roles.map((role) => (
          <li key={role.id}>
            <button
              type="button"
              onClick={() => setEditing(role)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-300"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{role.name}</p>
                <span className="shrink-0 text-xs font-medium text-slate-400">
                  {role.peopleCount} pessoa{role.peopleCount === 1 ? '' : 's'}
                </span>
              </div>

              {role.description && (
                <p className="mt-0.5 text-xs text-slate-500">{role.description}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-1">
                {role.permissionIds.length === 0 && (
                  <span className="text-xs text-slate-400">Nenhuma permissão marcada</span>
                )}
                {permissions
                  .filter((p) => role.permissionIds.includes(p.id))
                  .map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
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
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nome do papel</span>
        <input name="name" type="text" required placeholder="Ex.: Ajudante" className={INPUT} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          Descrição <span className="font-normal text-slate-400">(opcional)</span>
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

      <p className="text-center text-xs text-slate-500">
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
      {role.description && <p className="text-sm text-slate-500">{role.description}</p>}

      {isAdmin && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cuidado ao mexer no Admin: se você tirar <strong>Gerenciar papéis</strong>, ninguém
          mais consegue abrir esta tela.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {permissions.map((permission) => {
          const checked = selected.includes(permission.id);
          return (
            <li key={permission.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(permission.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-brand-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">
                    {PERMISSION_LABELS[permission.key] ?? permission.key}
                  </span>
                  <span className="block text-xs text-slate-500">{permission.description}</span>
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
