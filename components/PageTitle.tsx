export function PageTitle({
  title,
  subtitle,
  emoji,
  children,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {emoji && (
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-3xl border-2 border-hairline bg-surface text-xl shadow-sticker"
          >
            {emoji}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm font-medium text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
