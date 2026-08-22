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

const INPUT = 'field';

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
      <ul className="flex flex-col gap-2.5">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-4xl border-2 border-hairline/70 bg-surface p-3 shadow-sticker transition hover:-translate-y-0.5 hover:shadow-stickerLg"
          >
            <span
              aria-hidden
              className="surface-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink-900 text-sm font-extrabold text-paper-50"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink-900">
                {user.name || '(sem nome)'}
                {user.id === currentUserId && (
                  <span className="ml-1.5 text-xs font-normal text-ink-400">(você)</span>
                )}
              </p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>

            <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 text-[11px] font-bold text-ink-600">
              {user.roleName ?? 'sem papel'}
            </span>

            <button
              type="button"
              onClick={() => setEditing(user)}
              aria-label={`Editar ${user.name || user.email}`}
              className="pressable touch-target flex shrink-0 items-center justify-center rounded-2xl text-lg text-ink-300 transition hover:bg-sunken hover:text-ink-600"
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
        <span className="label">Nome</span>
        <input name="name" type="text" required placeholder="Ex.: Pedro" className={INPUT} />
      </label>

      <label className="block">
        <span className="label">E-mail</span>
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
        <span className="label">
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
        <span className="mt-1 block text-xs text-ink-500">
          Passe essa senha para a pessoa. Se ela esquecer, você define uma nova aqui
          mesmo — o app não manda e-mail de recuperação.
        </span>
      </label>

      <label className="block">
        <span className="label">Papel</span>
        <select
          name="role_id"
          required
          defaultValue={defaultRole?.id}
          className={INPUT}
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
        <span className="label">Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
      </label>

      <label className="block">
        <span className="label">Papel</span>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          disabled={isSelf}
          className={`${INPUT} disabled:bg-sunken disabled:text-ink-400`}
        >
          <option value="">sem papel</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {isSelf && (
          <span className="mt-1 block text-xs text-ink-500">
            Você não pode trocar o seu próprio papel.
          </span>
        )}
      </label>

      <ErrorBanner message={error} />
      {notice && (
        <p className="rounded-2xl border-2 border-green-300 bg-green-100 px-3 py-2 text-sm font-bold text-green-800">
          {notice}
        </p>
      )}

      <Button full loading={pending} onClick={save}>
        Salvar alterações
      </Button>

      <details className="rounded-xl border border-hairline p-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink-700">
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
