/** Retorno padrão das Server Actions: nada de exceção subindo até a tela. */
export type ActionResult = { ok: true } | { ok: false; error: string };

export function fail(error: string): ActionResult {
  return { ok: false, error };
}

export const OK: ActionResult = { ok: true };
