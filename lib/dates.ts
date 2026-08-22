import type { TaskPeriod } from '@/types';

/** Data em ISO (YYYY-MM-DD) a partir de um Date, no fuso do dispositivo. */
export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Data de hoje em ISO (YYYY-MM-DD), no fuso do dispositivo. */
export function todayISO(now: Date = new Date()): string {
  return toISO(now);
}

/** ISO → Date na meia-noite local (evita o pulo de fuso do `new Date(iso)`). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function isISODate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** "sexta-feira, 22 de agosto" */
export function formatLongDate(iso: string): string {
  return parseISO(iso).toLocaleDateString('pt-BR', {
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
// Dias da semana
// ---------------------------------------------------------------------
export const WEEKDAYS = [
  { key: 'sun', label: 'D', short: 'Dom', full: 'Domingo', index: 0 },
  { key: 'mon', label: 'S', short: 'Seg', full: 'Segunda', index: 1 },
  { key: 'tue', label: 'T', short: 'Ter', full: 'Terça', index: 2 },
  { key: 'wed', label: 'Q', short: 'Qua', full: 'Quarta', index: 3 },
  { key: 'thu', label: 'Q', short: 'Qui', full: 'Quinta', index: 4 },
  { key: 'fri', label: 'S', short: 'Sex', full: 'Sexta', index: 5 },
  { key: 'sat', label: 'S', short: 'Sáb', full: 'Sábado', index: 6 },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]['key'];
export type WeekdayMeta = (typeof WEEKDAYS)[number];

export function isWeekdayKey(value: unknown): value is WeekdayKey {
  return typeof value === 'string' && WEEKDAYS.some((w) => w.key === value);
}

export function getWeekday(key: WeekdayKey): WeekdayMeta {
  return WEEKDAYS.find((w) => w.key === key) ?? WEEKDAYS[0];
}

// ---------------------------------------------------------------------
// Aritmética de datas — tudo em ISO, sempre no fuso local
// ---------------------------------------------------------------------
export function addDays(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/** Qual dia da semana cai nesta data. */
export function weekdayOf(iso: string): WeekdayKey {
  return WEEKDAYS[parseISO(iso).getDay()]!.key;
}

/** Domingo da semana que contém a data — a semana aqui começa no domingo. */
export function startOfWeek(iso: string): string {
  return addDays(iso, -parseISO(iso).getDay());
}

/** As 7 datas da semana que começa em `startISO`. */
export function weekDates(startISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startISO, i));
}

/**
 * Primeira ocorrência do dia da semana a partir de `fromISO` (inclusive).
 * É assim que "quinta" vira uma data de verdade no cadastro.
 */
export function nextDateForWeekday(key: WeekdayKey, fromISO: string = todayISO()): string {
  const target = getWeekday(key).index;
  const current = parseISO(fromISO).getDay();
  return addDays(fromISO, (target - current + 7) % 7);
}

/** "Semana de 17 a 23 de agosto" */
export function describeWeek(startISO: string): string {
  const end = addDays(startISO, 6);
  const start = parseISO(startISO);
  const last = parseISO(end);
  const sameMonth = start.getMonth() === last.getMonth();
  const startLabel = start.toLocaleDateString('pt-BR', {
    day: 'numeric',
    ...(sameMonth ? {} : { month: 'short' }),
  });
  const endLabel = last.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  return `${startLabel} a ${endLabel}`;
}

// ---------------------------------------------------------------------
// Recorrência — formato "weekly:mon,wed,fri"
// ---------------------------------------------------------------------
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
  if (days.length === 7) return 'Todo dia';
  const names = WEEKDAYS.filter((d) => days.includes(d.key)).map((d) => d.short);
  if (names.length === 1) return names[0]!;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

/** A regra de recorrência cai na data informada? */
export function recurrenceMatchesDate(rule: string | null, iso: string): boolean {
  const days = parseRecurrenceRule(rule);
  if (!days.length) return false;
  return days.includes(weekdayOf(iso));
}
