type Props = {
  message: string | null | undefined;
  className?: string;
};

/** Mensagem de erro padrão — mesma cara em todas as telas. */
export function ErrorBanner({ message, className = '' }: Props) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`flex animate-fade-in items-start gap-2.5 rounded-3xl border-2 border-red-300 bg-red-100 px-3.5 py-3 text-sm font-bold text-red-800 ${className}`}
    >
      <span aria-hidden className="text-base leading-none">
        ⚠️
      </span>
      <span className="min-w-0">{message}</span>
    </p>
  );
}
