import {
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

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

export function formatTime24h(date: Date): string {
  return format(date, "HH:mm");
}

export function formatTimeDisplay(time24h: string): string {
  return format(parseTimeToDate(time24h), "hh:mm a");
}

export function parseTimeToDate(time24h: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = time24h.split(":").map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export type DatePreset = "all" | "today" | "week" | "month";

export function getDatePresetRange(preset: DatePreset): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  switch (preset) {
    case "today": {
      const today = todayIso();
      return { dateFrom: today, dateTo: today };
    }
    case "week":
      return {
        dateFrom: startOfWeek(now, { weekStartsOn: 1 }).toISOString().slice(0, 10),
        dateTo: endOfWeek(now, { weekStartsOn: 1 }).toISOString().slice(0, 10),
      };
    case "month":
      return {
        dateFrom: startOfMonth(now).toISOString().slice(0, 10),
        dateTo: endOfMonth(now).toISOString().slice(0, 10),
      };
    default:
      return {};
  }
}

export function getRelativeDateLabel(isoDate: string): string {
  const date = parseISO(isoDate);
  const formatted = format(date, "MMMM d, yyyy");
  if (isToday(date)) return `Today • ${formatted}`;
  if (isYesterday(date)) return `Yesterday • ${formatted}`;
  return formatted;
}
