const CLINIC_TIMEZONE = "Asia/Jakarta";

export function todayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function todayAsDate(): Date {
  return new Date(`${todayDateString()}T00:00:00.000Z`);
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: CLINIC_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date) + " WIB";
}

export function currentTimeString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

export function isWithinTimeWindow(startTime: string, endTime: string): boolean {
  const now = currentTimeString();
  return now >= startTime && now <= endTime;
}

export function hasTimeWindowStarted(startTime: string): boolean {
  return currentTimeString() >= startTime;
}

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a "YYYY-MM-DD" search param into a Date, falling back to today for
 * missing/malformed/invalid input. Used only by the operator dashboard's date
 * picker — the public page always uses todayAsDate() directly and must never
 * be affected by whatever date the operator happens to be viewing. */
export function parseDateParam(value: string | undefined): Date {
  if (!value || !DATE_PARAM_REGEX.test(value)) return todayAsDate();

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return todayAsDate();

  return date;
}

export function dateToParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}
