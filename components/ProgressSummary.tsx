export function ProgressSummary({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const finished = total > 0 && done === total;

  return (
    <div className="mt-3 rounded-2xl border-2 border-hairline bg-surface p-4 shadow-sticker">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink-700">
          {total === 0 ? (
            'Nada marcado para hoje'
          ) : (
            <>
              <span className="text-brand-600">{done}</span> de {total} concluída
              {total > 1 ? 's' : ''}
            </>
          )}
        </p>
        <span className="text-xs font-semibold text-ink-400">{percent}%</span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-sunken"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do dia"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            finished ? 'bg-emerald-500' : 'bg-brand-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {finished && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          🎉 Tudo feito por hoje. Aproveita!
        </p>
      )}
    </div>
  );
}
