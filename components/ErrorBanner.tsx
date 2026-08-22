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
      className={`flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 ${className}`}
    >
      <span aria-hidden>⚠️</span>
      <span>{message}</span>
    </p>
  );
}
