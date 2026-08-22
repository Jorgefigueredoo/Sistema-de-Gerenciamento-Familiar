export function EmptyState({
  icon = '🌤️',
  title,
  description,
  children,
}: {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in rounded-4xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center">
      <div
        aria-hidden
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-soft"
      >
        {icon}
      </div>
      <p className="mt-4 text-base font-bold text-ink-800">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-500">{description}</p>
      )}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}
