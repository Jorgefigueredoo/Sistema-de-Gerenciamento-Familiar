'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  createUser,
  deleteUser,
  resetUserPassword,
  updateUserName,
  updateUserRole,
} from '@/app/actions/admin';
import type { Role } from '@/types';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  roleName: string | null;
};

const INPUT =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-base placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

export function UsersManager({
  users,
  roles,
  currentUserId,
}: {
  users: UserRow[];
  roles: Role[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name || '(sem nome)'}
                {user.id === currentUserId && (
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(você)</span>
                )}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {user.roleName ?? 'sem papel'}
            </span>

            <button
              type="button"
              onClick={() => setEditing(user)}
              aria-label={`Editar ${user.name || user.email}`}
              className="touch-target shrink-0 rounded-full text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ⋯
            </button>
          </li>
        ))}
      </ul>

      <Button full className="mt-4" onClick={() => setNewOpen(true)}>
        + Cadastrar pessoa
      </Button>

      <BottomSheet open={newOpen} title="Nova pessoa" onClose={() => setNewOpen(false)}>
        <NewUserForm
          roles={roles}
          onDone={() => {
            setNewOpen(false);
            router.refresh();
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={!!editing}
        title={editing?.name || editing?.email || ''}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <EditUserForm
            user={editing}
            roles={roles}
            isSelf={editing.id === currentUserId}
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

function NewUserForm({ roles, onDone }: { roles: Role[]; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultRole = roles.find((r) => r.name === 'Membro') ?? roles[0];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createUser(formData);
      if (!result.ok) setError(result.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nome</span>
        <input name="name" type="text" required placeholder="Ex.: Pedro" className={INPUT} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail</span>
        <input
          name="email"
          type="email"
          required
          inputMode="email"
          placeholder="pedro@email.com"
          className={INPUT}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          Senha provisória
        </span>
        <input
          name="password"
          type="text"
          required
          minLength={6}
          placeholder="mínimo 6 caracteres"
          className={INPUT}
        />
        <span className="mt-1 block text-xs text-slate-500">
          Passe essa senha para a pessoa. Ela pode trocar depois em “Esqueci minha senha”.
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Papel</span>
        <select
          name="role_id"
          required
          defaultValue={defaultRole?.id}
          className={`${INPUT} bg-white`}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </label>

      <ErrorBanner message={error} />

      <Button type="submit" full loading={pending}>
        Cadastrar
      </Button>
    </form>
  );
}

function EditUserForm({
  user,
  roles,
  isSelf,
  onDone,
}: {
  user: UserRow;
  roles: Role[];
  isSelf: boolean;
  onDone: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [roleId, setRoleId] = useState(user.role_id ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      if (name.trim() !== user.name) {
        const result = await updateUserName(user.id, name);
        if (!result.ok) return setError(result.error);
      }
      if (roleId && roleId !== user.role_id) {
        const result = await updateUserRole(user.id, roleId);
        if (!result.ok) return setError(result.error);
      }
      onDone();
    });
  }

  function changePassword() {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await resetUserPassword(user.id, password);
      if (!result.ok) setError(result.error);
      else {
        setPassword('');
        setNotice('Senha alterada. Passe a nova senha para a pessoa.');
      }
    });
  }

  function remove() {
    if (!confirm(`Remover ${user.name || user.email} do sistema?`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (!result.ok) setError(result.error);
      else onDone();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Papel</span>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          disabled={isSelf}
          className={`${INPUT} bg-white disabled:bg-slate-100 disabled:text-slate-400`}
        >
          <option value="">sem papel</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {isSelf && (
          <span className="mt-1 block text-xs text-slate-500">
            Você não pode trocar o seu próprio papel.
          </span>
        )}
      </label>

      <ErrorBanner message={error} />
      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <Button full loading={pending} onClick={save}>
        Salvar alterações
      </Button>

      <details className="rounded-xl border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Definir uma senha nova
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className={INPUT}
          />
          <Button
            variant="secondary"
            full
            loading={pending}
            disabled={password.length < 6}
            onClick={changePassword}
          >
            Trocar senha
          </Button>
        </div>
      </details>

      {!isSelf && (
        <Button variant="danger" full loading={pending} onClick={remove}>
          🗑️ Remover do sistema
        </Button>
      )}
    </div>
  );
}
