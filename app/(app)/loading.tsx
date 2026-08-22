export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="animate-fade-in">
      <div className="h-40 animate-pulse rounded-5xl bg-surface/80" />

      <div className="mt-7 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-surface/80" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-4xl bg-surface/90" />
        ))}
      </div>

      <div className="mt-7 space-y-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-surface/80" />
        {[0, 1].map((i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-4xl bg-surface/90" />
        ))}
      </div>
    </div>
  );
}
