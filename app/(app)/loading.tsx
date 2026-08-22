export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
      <div className="space-y-3 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
    </div>
  );
}
