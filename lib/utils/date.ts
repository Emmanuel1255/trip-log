import { format, parseISO } from "date-fns";

export const DATE_FORMAT = "dd/MM/yyyy";

export function formatDisplayDate(isoDate: string): string {
  return format(parseISO(isoDate), DATE_FORMAT);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}
