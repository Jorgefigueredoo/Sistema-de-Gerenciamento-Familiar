import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/PageTitle';
import { TaskForm } from '@/components/TaskForm';
import { requireSession } from '@/lib/auth';
import { isScope } from '@/lib/categories';
import { getDelegateOptions } from '@/lib/tasks';

export const metadata = { title: 'Nova tarefa' };
export const dynamic = 'force-dynamic';

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: { destino?: string };
}) {
  const session = await requireSession();

  if (!session.permissions.includes('create_task')) {
    redirect('/?erro=sem-permissao');
  }

  const delegates = await getDelegateOptions(session.userId);
  const destino = searchParams.destino;
  const defaultScope = isScope(destino) ? destino : 'today';

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <PageTitle emoji="✨" title="Nova tarefa" />
        <Link
          href="/"
          className="pressable touch-target flex items-center rounded-2xl px-3 text-sm font-bold text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
        >
          Cancelar
        </Link>
      </div>

      <TaskForm delegates={delegates} defaultScope={defaultScope} />
    </>
  );
}
