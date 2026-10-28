"use client";

import { useId } from "react";
import { inputClass } from "@/components/ui/Dialog";
import type { Schedule } from "@/lib/journey/schema";
import { localDate } from "@/lib/journey/store";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function describeSchedule(s: Schedule): string {
  if (s.kind === "daily") return "Every day";
  if (s.kind === "once") return `Once, on ${new Date(`${s.date}T12:00:00`).toLocaleDateString()}`;
  if (s.days.length === 7) return "Every day";
  const sorted = [...s.days].sort();
  if (sorted.join() === "1,2,3,4,5") return "Weekdays (Mon–Fri)";
  return `Every ${sorted.map((d) => WEEKDAY_NAMES[d]).join(", ")}`;
}

/** Choose once (a date), every day, or chosen weekdays. */
export function ScheduleFields({
  value,
  onChange,
}: {
  value: Schedule;
  onChange: (s: Schedule) => void;
}) {
  const dateId = useId();
  const name = useId();
  return (
    <fieldset>
      <legend className="font-semibold">When</legend>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <label className="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            checked={value.kind === "daily"}
            onChange={() => onChange({ kind: "daily" })}
          />
          Every day
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            checked={value.kind === "weekdays"}
            onChange={() => onChange({ kind: "weekdays", days: [1, 2, 3, 4, 5] })}
          />
          On chosen days
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name={name}
            checked={value.kind === "once"}
            onChange={() => onChange({ kind: "once", date: localDate() })}
          />
          Once
        </label>
      </div>
      {value.kind === "weekdays" && (
        <fieldset className="mt-2">
          <legend className="sr-only">Days of the week</legend>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d, i) => {
              const on = value.days.includes(i);
              return (
                <label
                  key={d}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${on ? "border-accent bg-accent text-on-accent" : "border-line"}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    aria-label={WEEKDAY_NAMES[i]}
                    onChange={() => {
                      const days = on ? value.days.filter((x) => x !== i) : [...value.days, i];
                      if (days.length) onChange({ kind: "weekdays", days: days.sort() });
                    }}
                  />
                  <span aria-hidden="true">{d}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {value.kind === "once" && (
        <div className="mt-2">
          <label htmlFor={dateId} className="text-sm">
            Date
          </label>
          <input
            id={dateId}
            type="date"
            value={value.date}
            onChange={(e) => e.target.value && onChange({ kind: "once", date: e.target.value })}
            className={inputClass}
          />
        </div>
      )}
    </fieldset>
  );
}
