const TZ = "Europe/Berlin";

const kickoffWeekday = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  timeZone: TZ,
});
const kickoffTime = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const eventDateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});
const shortDateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: TZ,
});

const trimDot = (s: string) => s.replace(/\.$/, "");

export function formatKickoff(date: Date): string {
  return `${trimDot(kickoffWeekday.format(date))}, ${kickoffTime.format(date)}`;
}

export function formatEventDate(date: Date): string {
  // Intl outputs "23. Apr. 2026" — drop the dot after the month.
  return eventDateFmt
    .format(date)
    .replace(/\./g, "")
    .replace(/(\d+)\s/, "$1. ");
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date);
}
