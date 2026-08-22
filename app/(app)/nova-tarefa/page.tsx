import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/PageTitle';
import { TaskForm } from '@/components/TaskForm';
import { requireSession } from '@/lib/auth';
import { isScope } from '@/lib/categories';
import { getDelegateOptions } from '@/lib/tasks';

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
      <div className="mb-1 flex items-center justify-between">
        <PageTitle title="Nova tarefa" />
        <Link
          href="/"
          className="touch-target -mt-3 flex items-center rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancelar
        </Link>
      </div>

      <TaskForm delegates={delegates} defaultScope={defaultScope} />
    </>
  );
}
