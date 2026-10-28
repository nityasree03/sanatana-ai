import type { Sankalpa, Schedule } from "./schema";

/** Parse "YYYY-MM-DD" as a local calendar date (noon avoids daylight-saving edge cases). */
export function parseLocal(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function fmt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(date: string, n: number): string {
  const d = parseLocal(date);
  d.setDate(d.getDate() + n);
  return fmt(d);
}

/** Is this intention planned for the given day? */
export function isPlannedOn(schedule: Schedule, date: string): boolean {
  if (schedule.kind === "once") return schedule.date === date;
  if (schedule.kind === "daily") return true;
  return schedule.days.includes(parseLocal(date).getDay());
}

export interface DayStatus {
  date: string;
  planned: boolean;
  done: boolean;
}

/** The last `days` days (oldest first), from the day it was created at the earliest. */
export function recentDays(s: Sankalpa, today: string, days = 7): DayStatus[] {
  const created = fmt(new Date(s.createdAt)); // local date it was created
  const out: DayStatus[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const planned = date >= created && isPlannedOn(s.schedule, date);
    out.push({ date, planned, done: s.done.includes(date) });
  }
  return out;
}

/**
 * Gentle progress for the last week: on how many of the planned days it was kept. No streaks
 * that "break", no scores, and it never counts days before the intention existed.
 */
export function progressText(s: Sankalpa, today: string): string {
  if (s.schedule.kind === "once") {
    if (s.done.includes(s.schedule.date)) return "Done";
    return s.schedule.date < today ? "The day has passed" : "Not done yet";
  }
  const week = recentDays(s, today);
  const planned = week.filter((d) => d.planned);
  const kept = planned.filter((d) => d.done).length;
  if (planned.length === 0) return "No planned days yet this week";
  return `Kept on ${kept} of ${planned.length} planned ${planned.length === 1 ? "day" : "days"} this past week`;
}

export function toggleDone(done: string[], date: string): string[] {
  return done.includes(date) ? done.filter((d) => d !== date) : [...done, date].sort().slice(-800);
}

/* ---------------- Calendar file (iCalendar, RFC 5545) ---------------- */

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Escape text values (RFC 5545 §3.3.11). */
export function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets (RFC 5545 §3.1), without splitting a multi-byte character. */
export function icsFold(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const ch of line) {
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (enc.encode(current + ch).length > limit) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function utcStamp(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/**
 * A calendar file with a reminder for this intention. Times are "floating" (the person's local
 * time wherever they are), which is what a daily intention usually means.
 */
export function buildIcs(s: Sankalpa, opts: { time: string; today: string; now?: Date }): string {
  const [hh, mm] = opts.time.split(":");
  const startDate =
    s.schedule.kind === "once"
      ? s.schedule.date
      : // first planned day from today
        Array.from({ length: 7 }, (_, i) => addDays(opts.today, i)).find((d) =>
          isPlannedOn(s.schedule, d),
        )!;
  const dt = `${startDate.replace(/-/g, "")}T${hh}${mm}00`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sanatana AI//Daily Sankalpa//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${s.id}@sanatana-ai`,
    `DTSTAMP:${utcStamp(opts.now ?? new Date())}`,
    `DTSTART:${dt}`,
    "DURATION:PT15M",
    `SUMMARY:${icsEscape(`Sankalpa: ${s.text}`)}`,
    `DESCRIPTION:${icsEscape("Your intention from Sanatana AI. Mark it on the Daily Sankalpa page if you like.")}`,
  ];
  if (s.schedule.kind === "daily") lines.push("RRULE:FREQ=DAILY");
  if (s.schedule.kind === "weekdays")
    lines.push(
      `RRULE:FREQ=WEEKLY;BYDAY=${[...s.schedule.days]
        .sort()
        .map((d) => BYDAY[d])
        .join(",")}`,
    );
  lines.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(s.text)}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  );
  return `${lines.map(icsFold).join("\r\n")}\r\n`;
}
