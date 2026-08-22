import type { TaskCategory, TaskPeriod, TaskScope } from '@/types';

export type CategoryMeta = {
  key: TaskCategory;
  label: string;
  icon: string;
  /** Fundo suave + texto: usado em chips e cards. */
  chip: string;
  /** Barra lateral colorida do card da tarefa. */
  bar: string;
  /** Estado selecionado no seletor de categoria. */
  selected: string;
  /** Cor do checkbox/acento. */
  accent: string;
};

/**
 * Fonte única de verdade de cor + ícone por categoria.
 * As classes são escritas por extenso de propósito: o Tailwind não
 * consegue enxergar classes montadas dinamicamente (`bg-${cor}-100`).
 */
export const CATEGORIES: Record<TaskCategory, CategoryMeta> = {
  trabalho: {
    key: 'trabalho',
    label: 'Trabalho',
    icon: '💼',
    chip: 'bg-sky-100 text-sky-800',
    bar: 'bg-sky-500',
    selected: 'border-sky-500 bg-sky-50 text-sky-900 ring-sky-200',
    accent: 'accent-sky-600',
  },
  casa: {
    key: 'casa',
    label: 'Casa',
    icon: '🏠',
    chip: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
    selected: 'border-amber-500 bg-amber-50 text-amber-900 ring-amber-200',
    accent: 'accent-amber-600',
  },
  alimentacao: {
    key: 'alimentacao',
    label: 'Alimentação',
    icon: '🍳',
    chip: 'bg-orange-100 text-orange-800',
    bar: 'bg-orange-500',
    selected: 'border-orange-500 bg-orange-50 text-orange-900 ring-orange-200',
    accent: 'accent-orange-600',
  },
  familia: {
    key: 'familia',
    label: 'Família',
    icon: '👨‍👩‍👧',
    chip: 'bg-rose-100 text-rose-800',
    bar: 'bg-rose-500',
    selected: 'border-rose-500 bg-rose-50 text-rose-900 ring-rose-200',
    accent: 'accent-rose-600',
  },
  treino: {
    key: 'treino',
    label: 'Treino',
    icon: '💪',
    chip: 'bg-emerald-100 text-emerald-800',
    bar: 'bg-emerald-500',
    selected: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-emerald-200',
    accent: 'accent-emerald-600',
  },
  espiritual: {
    key: 'espiritual',
    label: 'Espiritual',
    icon: '🙏',
    chip: 'bg-violet-100 text-violet-800',
    bar: 'bg-violet-500',
    selected: 'border-violet-500 bg-violet-50 text-violet-900 ring-violet-200',
    accent: 'accent-violet-600',
  },
  compromisso: {
    key: 'compromisso',
    label: 'Compromissos',
    icon: '📌',
    chip: 'bg-slate-200 text-slate-800',
    bar: 'bg-slate-500',
    selected: 'border-slate-500 bg-slate-50 text-slate-900 ring-slate-200',
    accent: 'accent-slate-600',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);

export const CATEGORY_KEYS = CATEGORY_LIST.map((c) => c.key);

export function getCategory(key: string | null | undefined): CategoryMeta {
  if (key && key in CATEGORIES) return CATEGORIES[key as TaskCategory];
  return CATEGORIES.compromisso;
}

export function isCategory(value: unknown): value is TaskCategory {
  return typeof value === 'string' && value in CATEGORIES;
}

// ---------------------------------------------------------------------
// Períodos do dia
// ---------------------------------------------------------------------
export type PeriodMeta = {
  key: TaskPeriod;
  label: string;
  icon: string;
  /** Faixa horária usada para sugerir o período padrão. */
  startHour: number;
  endHour: number;
};

export const PERIODS: Record<TaskPeriod, PeriodMeta> = {
  manha: { key: 'manha', label: 'Manhã', icon: '🌅', startHour: 0, endHour: 12 },
  tarde: { key: 'tarde', label: 'Tarde', icon: '☀️', startHour: 12, endHour: 18 },
  noite: { key: 'noite', label: 'Noite', icon: '🌙', startHour: 18, endHour: 24 },
};

export const PERIOD_LIST: PeriodMeta[] = [PERIODS.manha, PERIODS.tarde, PERIODS.noite];

export function isPeriod(value: unknown): value is TaskPeriod {
  return typeof value === 'string' && value in PERIODS;
}

// ---------------------------------------------------------------------
// Destino da tarefa
// ---------------------------------------------------------------------
export const SCOPES: Record<TaskScope, { key: TaskScope; label: string; icon: string }> = {
  today: { key: 'today', label: 'Hoje', icon: '📅' },
  this_week: { key: 'this_week', label: 'Essa semana', icon: '🗓️' },
  delegated: { key: 'delegated', label: 'Delegar', icon: '🤝' },
};

export const SCOPE_LIST = Object.values(SCOPES);

export function isScope(value: unknown): value is TaskScope {
  return typeof value === 'string' && value in SCOPES;
}
