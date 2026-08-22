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
    <div className="animate-fade-in rounded-5xl border-2 border-dashed border-hairline bg-surface/70 px-6 py-12 text-center">
      <div
        aria-hidden
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-4xl border-2 border-hairline bg-surface text-4xl shadow-sticker"
      >
        {icon}
      </div>
      <p className="mt-4 text-lg font-extrabold text-ink-800">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-xs text-sm font-medium text-ink-500">{description}</p>
      )}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}
