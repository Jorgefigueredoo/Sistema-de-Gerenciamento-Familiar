import type { TaskPeriod } from '@/types';

/** Data de hoje em ISO (YYYY-MM-DD), no fuso do dispositivo. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "sexta-feira, 22 de agosto" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** "22/08" */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** "07:30" — o Postgres devolve "07:30:00". */
export function formatTime(time: string | null): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

/** Período sugerido a partir do horário informado. */
export function periodFromTime(time: string | null): TaskPeriod | null {
  if (!time) return null;
  const hour = Number(time.slice(0, 2));
  if (Number.isNaN(hour)) return null;
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

/** Período sugerido a partir da hora atual (usado como padrão no form). */
export function currentPeriod(now: Date = new Date()): TaskPeriod {
  const hour = now.getHours();
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ---------------------------------------------------------------------
// Recorrência — formato "weekly:mon,wed,fri"
// ---------------------------------------------------------------------
export const WEEKDAYS = [
  { key: 'sun', label: 'D', full: 'Domingo', index: 0 },
  { key: 'mon', label: 'S', full: 'Segunda', index: 1 },
  { key: 'tue', label: 'T', full: 'Terça', index: 2 },
  { key: 'wed', label: 'Q', full: 'Quarta', index: 3 },
  { key: 'thu', label: 'Q', full: 'Quinta', index: 4 },
  { key: 'fri', label: 'S', full: 'Sexta', index: 5 },
  { key: 'sat', label: 'S', full: 'Sábado', index: 6 },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]['key'];

export function buildRecurrenceRule(days: WeekdayKey[]): string | null {
  if (!days.length) return null;
  const ordered = WEEKDAYS.filter((d) => days.includes(d.key)).map((d) => d.key);
  return `weekly:${ordered.join(',')}`;
}

export function parseRecurrenceRule(rule: string | null): WeekdayKey[] {
  if (!rule?.startsWith('weekly:')) return [];
  const keys = rule.slice('weekly:'.length).split(',').map((s) => s.trim());
  return WEEKDAYS.filter((d) => keys.includes(d.key)).map((d) => d.key);
}

/** "Seg, Qua e Sex" */
export function describeRecurrence(rule: string | null): string | null {
  const days = parseRecurrenceRule(rule);
  if (!days.length) return null;
  const names = WEEKDAYS.filter((d) => days.includes(d.key)).map((d) => d.full.slice(0, 3));
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

/** A regra de recorrência cai na data informada? */
export function recurrenceMatchesDate(rule: string | null, iso: string): boolean {
  const days = parseRecurrenceRule(rule);
  if (!days.length) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
  return WEEKDAYS.some((w) => w.index === weekday && days.includes(w.key));
}
