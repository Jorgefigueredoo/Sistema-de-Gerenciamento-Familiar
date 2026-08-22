import Link from 'next/link';
import { DayHero } from '@/components/DayHero';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TaskSection } from '@/components/TaskSection';
import { WeekAgenda } from '@/components/WeekAgenda';
import { requireSession } from '@/lib/auth';
import {
  addDays,
  describeWeek,
  greetingForHour,
  hourIn,
  isISODate,
  startOfWeek,
  todayISOIn,
} from '@/lib/dates';
import { getTimeZone } from '@/lib/timezone';
import { getAgendaWeek, getOverdueTasks, getUndatedTasks } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { semana?: string; erro?: string };
}) {
  const session = await requireSession();

  // Fuso de quem está olhando, não o do servidor.
  const timeZone = getTimeZone();
  const today = todayISOIn(timeZone);
  // ?semana aceita qualquer data: o que importa é a semana em que ela cai.
  const reference = isISODate(searchParams.semana) ? searchParams.semana : today;
  const start = startOfWeek(reference);
  const thisWeek = start === startOfWeek(today);

  // Tudo numa rodada só. Os dois últimos existem para que nada fique
  // invisível — o que venceu antes dessa semana e o que sobrou sem dia —
  // e só fazem sentido (nem são buscados) na semana corrente.
  const [{ data: week, error }, overdue, undated] = await Promise.all([
    getAgendaWeek(session.userId, start, today),
    thisWeek ? getOverdueTasks(session.userId, start) : Promise.resolve(null),
    thisWeek ? getUndatedTasks(session.userId, today) : Promise.resolve(null),
  ]);

  const canCreate = session.permissions.includes('create_task');
  const firstName = (session.profile.name || session.profile.email).split(' ')[0];
  const todayData = week.days.find((d) => d.isToday);

  return (
    <>
      {todayData ? (
        <DayHero
          name={firstName}
          date={today}
          greeting={greetingForHour(hourIn(timeZone))}
          done={todayData.doneCount}
          total={todayData.tasks.length}
        />
      ) : (
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Agenda</h1>
      )}

      <div className="mt-6">
        {searchParams.erro === 'sem-permissao' && (
          <ErrorBanner
            message="Essa área é só para quem tem permissão de administrador."
            className="mb-4"
          />
        )}

        {/* Navegação entre semanas */}
        <div className="mb-5 flex items-center gap-2">
          <Link
            href={`/?semana=${addDays(start, -7)}`}
            aria-label="Semana anterior"
            className="pressable touch-target flex items-center justify-center rounded-2xl border-2 border-hairline
              bg-surface px-3.5 text-lg font-extrabold text-ink-500 shadow-sticker transition
              hover:border-ink-900 hover:text-ink-900"
          >
            ‹
          </Link>

          <p className="flex-1 text-center text-sm font-extrabold capitalize text-ink-600">
            {describeWeek(start)}
          </p>

          <Link
            href={`/?semana=${addDays(start, 7)}`}
            aria-label="Próxima semana"
            className="pressable touch-target flex items-center justify-center rounded-2xl border-2 border-hairline
              bg-surface px-3.5 text-lg font-extrabold text-ink-500 shadow-sticker transition
              hover:border-ink-900 hover:text-ink-900"
          >
            ›
          </Link>
        </div>

        {!thisWeek && (
          <div className="mb-5 text-center">
            <Link
              href="/"
              className="pressable inline-flex items-center gap-1.5 rounded-full border-2 border-accent-400
                bg-accent-100 px-4 py-2 text-xs font-extrabold text-ink-800 shadow-sticker"
            >
              ↩ Voltar para a semana de hoje
            </Link>
          </div>
        )}

        <ErrorBanner message={error} className="mb-4" />
        <ErrorBanner message={overdue?.error ?? null} className="mb-4" />
        <ErrorBanner message={undated?.error ?? null} className="mb-4" />

        {/* Ficou para trás em semanas anteriores */}
        {overdue && overdue.data.length > 0 && (
          <TaskSection
            title="Ficaram para trás"
            icon="⏰"
            tone="warning"
            tasks={overdue.data}
            date={today}
            canManage
            canMoveToDay
          />
        )}

        {/* key: trocar de semana começa de novo no primeiro dia */}
        <WeekAgenda key={start} days={week.days} today={today} canCreate={canCreate} />

        {/* Herança do antigo "Essa semana": some sozinho quando esvaziar */}
        {undated && undated.data.length > 0 && (
          <div className="mt-8">
            <TaskSection
              title="Sem dia marcado"
              icon="🗓️"
              tasks={undated.data}
              date={today}
              canManage
              canMoveToDay
            />
            <p className="-mt-4 text-xs font-medium text-ink-400">
              Sobraram da tela “Essa semana”. Dê um dia a cada uma pelo menu ⋯ e esse bloco
              desaparece.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
