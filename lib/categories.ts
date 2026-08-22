import type { TaskCategory, TaskPeriod, TaskScope } from '@/types';

export type CategoryMeta = {
  key: TaskCategory;
  label: string;
  icon: string;
  /** Fundo + borda do cartão da tarefa. A cor da categoria manda nele. */
  card: string;
  /** Bolha sólida do ícone, dentro do cartão. */
  bubble: string;
  /** Chip pequeno com o nome da categoria. */
  chip: string;
  /** Preenchimento do checkbox quando concluída. */
  solid: string;
  /** Estado selecionado no seletor de categoria do formulário. */
  selected: string;
};

/**
 * Fonte única de verdade de cor + ícone por categoria.
 *
 * Sete matizes bem espalhadas no círculo (azul, âmbar, vermelho, rosa,
 * verde, violeta, turquesa) para nunca haver dúvida de qual é qual.
 * As classes são escritas por extenso de propósito: o Tailwind não
 * enxerga classes montadas dinamicamente (`bg-${cor}-100`).
 */
export const CATEGORIES: Record<TaskCategory, CategoryMeta> = {
  trabalho: {
    key: 'trabalho',
    label: 'Trabalho',
    icon: '💼',
    card: 'border-blue-200 bg-blue-50 hover:border-blue-300',
    bubble: 'bg-blue-500 text-white',
    chip: 'bg-blue-100 text-blue-800',
    solid: 'bg-blue-500',
    selected: 'border-blue-400 bg-blue-100 text-blue-900 ring-blue-200',
  },
  casa: {
    key: 'casa',
    label: 'Casa',
    icon: '🏠',
    card: 'border-amber-200 bg-amber-50 hover:border-amber-300',
    bubble: 'bg-amber-500 text-white',
    chip: 'bg-amber-100 text-amber-900',
    solid: 'bg-amber-500',
    selected: 'border-amber-400 bg-amber-100 text-amber-900 ring-amber-200',
  },
  alimentacao: {
    key: 'alimentacao',
    label: 'Alimentação',
    icon: '🍳',
    card: 'border-red-200 bg-red-50 hover:border-red-300',
    bubble: 'bg-red-500 text-white',
    chip: 'bg-red-100 text-red-800',
    solid: 'bg-red-500',
    selected: 'border-red-400 bg-red-100 text-red-900 ring-red-200',
  },
  familia: {
    key: 'familia',
    label: 'Família',
    icon: '👨‍👩‍👧',
    card: 'border-pink-200 bg-pink-50 hover:border-pink-300',
    bubble: 'bg-pink-500 text-white',
    chip: 'bg-pink-100 text-pink-800',
    solid: 'bg-pink-500',
    selected: 'border-pink-400 bg-pink-100 text-pink-900 ring-pink-200',
  },
  treino: {
    key: 'treino',
    label: 'Treino',
    icon: '💪',
    card: 'border-green-200 bg-green-50 hover:border-green-300',
    bubble: 'bg-green-600 text-white',
    chip: 'bg-green-100 text-green-800',
    solid: 'bg-green-600',
    selected: 'border-green-400 bg-green-100 text-green-900 ring-green-200',
  },
  espiritual: {
    key: 'espiritual',
    label: 'Espiritual',
    icon: '🙏',
    card: 'border-violet-200 bg-violet-50 hover:border-violet-300',
    bubble: 'bg-violet-500 text-white',
    chip: 'bg-violet-100 text-violet-800',
    solid: 'bg-violet-500',
    selected: 'border-violet-400 bg-violet-100 text-violet-900 ring-violet-200',
  },
  compromisso: {
    key: 'compromisso',
    label: 'Compromissos',
    icon: '📌',
    card: 'border-teal-200 bg-teal-50 hover:border-teal-300',
    bubble: 'bg-teal-500 text-white',
    chip: 'bg-teal-100 text-teal-800',
    solid: 'bg-teal-500',
    selected: 'border-teal-400 bg-teal-100 text-teal-900 ring-teal-200',
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
  // A chave continua 'today' no banco, mas o dia de verdade quem decide é o
  // seletor de dia da semana — por isso o rótulo fala da agenda, não de hoje.
  today: { key: 'today', label: 'Minha agenda', icon: '📆' },
  this_week: { key: 'this_week', label: 'Sem dia', icon: '🗓️' },
  delegated: { key: 'delegated', label: 'Delegar', icon: '🤝' },
};

export const SCOPE_LIST = Object.values(SCOPES);

/**
 * O que o formulário oferece. 'this_week' ficou de fora quando a Agenda
 * virou a tela única: toda tarefa nova nasce com um dia ou delegada.
 */
export const FORM_SCOPE_LIST = [SCOPES.today, SCOPES.delegated];

export function isScope(value: unknown): value is TaskScope {
  return typeof value === 'string' && value in SCOPES;
}
