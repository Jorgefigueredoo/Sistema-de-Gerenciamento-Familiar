export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="animate-fade-in">
      <div className="h-40 animate-pulse rounded-4xl bg-white/70" />

      <div className="mt-7 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-white/70" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[86px] animate-pulse rounded-3xl bg-white/80" />
        ))}
      </div>

      <div className="mt-7 space-y-3">
        <div className="h-4 w-28 animate-pulse rounded-full bg-white/70" />
        {[0, 1].map((i) => (
          <div key={i} className="h-[86px] animate-pulse rounded-3xl bg-white/80" />
        ))}
      </div>
    </div>
  );
}
