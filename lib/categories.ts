import type { TaskCategory, TaskPeriod, TaskScope } from '@/types';

export type CategoryMeta = {
  key: TaskCategory;
  label: string;
  icon: string;
  /** Bolha do ícone no card da tarefa. */
  soft: string;
  /** Chip pequeno com o nome da categoria. */
  chip: string;
  /** Preenchimento do checkbox quando concluída. */
  solid: string;
  /** Estado selecionado no seletor de categoria. */
  selected: string;
  /** Gradiente usado em destaques. */
  gradient: string;
};

/**
 * Fonte única de verdade de cor + ícone por categoria.
 * As classes são escritas por extenso de propósito: o Tailwind não
 * enxerga classes montadas dinamicamente (`bg-${cor}-100`).
 */
export const CATEGORIES: Record<TaskCategory, CategoryMeta> = {
  trabalho: {
    key: 'trabalho',
    label: 'Trabalho',
    icon: '💼',
    soft: 'bg-sky-100 text-sky-700',
    chip: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
    solid: 'bg-sky-500',
    selected: 'border-sky-400 bg-sky-50 text-sky-900 ring-sky-100',
    gradient: 'from-sky-400 to-sky-600',
  },
  casa: {
    key: 'casa',
    label: 'Casa',
    icon: '🏠',
    soft: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
    solid: 'bg-amber-500',
    selected: 'border-amber-400 bg-amber-50 text-amber-900 ring-amber-100',
    gradient: 'from-amber-400 to-amber-600',
  },
  alimentacao: {
    key: 'alimentacao',
    label: 'Alimentação',
    icon: '🍳',
    soft: 'bg-orange-100 text-orange-700',
    chip: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100',
    solid: 'bg-orange-500',
    selected: 'border-orange-400 bg-orange-50 text-orange-900 ring-orange-100',
    gradient: 'from-orange-400 to-orange-600',
  },
  familia: {
    key: 'familia',
    label: 'Família',
    icon: '👨‍👩‍👧',
    soft: 'bg-rose-100 text-rose-700',
    chip: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100',
    solid: 'bg-rose-500',
    selected: 'border-rose-400 bg-rose-50 text-rose-900 ring-rose-100',
    gradient: 'from-rose-400 to-rose-600',
  },
  treino: {
    key: 'treino',
    label: 'Treino',
    icon: '💪',
    soft: 'bg-emerald-100 text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
    solid: 'bg-emerald-500',
    selected: 'border-emerald-400 bg-emerald-50 text-emerald-900 ring-emerald-100',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  espiritual: {
    key: 'espiritual',
    label: 'Espiritual',
    icon: '🙏',
    soft: 'bg-violet-100 text-violet-700',
    chip: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100',
    solid: 'bg-violet-500',
    selected: 'border-violet-400 bg-violet-50 text-violet-900 ring-violet-100',
    gradient: 'from-violet-400 to-violet-600',
  },
  compromisso: {
    key: 'compromisso',
    label: 'Compromissos',
    icon: '📌',
    soft: 'bg-teal-100 text-teal-700',
    chip: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100',
    solid: 'bg-teal-500',
    selected: 'border-teal-400 bg-teal-50 text-teal-900 ring-teal-100',
    gradient: 'from-teal-400 to-teal-600',
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
