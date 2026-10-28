"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import {
  Dialog,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/Dialog";
import {
  buildIcs,
  isPlannedOn,
  parseLocal,
  progressText,
  recentDays,
  toggleDone,
} from "@/lib/journey/sankalpa";
import { LIMITS, type Sankalpa, type Schedule } from "@/lib/journey/schema";
import { addItem, localDate, removeItem, updateItem } from "@/lib/journey/store";
import { JourneyGate } from "./JourneyGate";
import { downloadFile } from "./MyDataPanel";
import { ScheduleFields, describeSchedule } from "./ScheduleFields";

function SankalpaForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<Sankalpa, "text" | "schedule">;
  submitLabel: string;
  onSubmit: (v: { text: string; schedule: Schedule }) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [schedule, setSchedule] = useState<Schedule>(initial?.schedule ?? { kind: "daily" });
  const [error, setError] = useState<string | null>(null);
  const textId = useId();
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setError("Write your intention first.");
    onSubmit({ text: text.trim(), schedule });
    if (!initial) {
      setText("");
      setSchedule({ kind: "daily" });
    }
    setError(null);
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div>
        <label htmlFor={textId} className="font-semibold">
          Intention
        </label>
        <input
          id={textId}
          value={text}
          maxLength={LIMITS.sankalpa}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Ten quiet minutes before breakfast"
          className={inputClass}
        />
      </div>
      <ScheduleFields value={schedule} onChange={setSchedule} />
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={buttonPrimary}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={buttonSecondary} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function CalendarDialog({ s, onClose }: { s: Sankalpa; onClose: () => void }) {
  const [time, setTime] = useState("08:00");
  const [saved, setSaved] = useState(false);
  const timeId = useId();
  return (
    <Dialog
      title="Add to my calendar"
      description="Downloads a calendar file. Open it to add a reminder in Apple Calendar, Google Calendar, Outlook or similar. The reminder then comes from your calendar app, even when this site is closed."
      onClose={onClose}
    >
      <p className="font-semibold">{s.text}</p>
      <p className="text-sm text-muted">{describeSchedule(s.schedule)}</p>
      <div className="mt-3 max-w-40">
        <label htmlFor={timeId} className="font-semibold">
          Reminder time
        </label>
        <input
          id={timeId}
          type="time"
          value={time}
          onChange={(e) => e.target.value && setTime(e.target.value)}
          className={inputClass}
          data-autofocus
        />
      </div>
      <p aria-live="polite" className="mt-2 text-sm">
        {saved ? "Downloaded. Open the file to add it to your calendar." : ""}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className={buttonPrimary}
          onClick={() => {
            downloadFile(
              `sankalpa-${
                s.text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .slice(0, 40) || "reminder"
              }.ics`,
              buildIcs(s, { time, today: localDate() }),
              "text/calendar",
            );
            setSaved(true);
          }}
        >
          Download calendar file
        </button>
      </div>
    </Dialog>
  );
}

function WeekDots({ s, today }: { s: Sankalpa; today: string }) {
  const days = recentDays(s, today);
  return (
    <ol className="mt-2 flex gap-1.5" aria-label="The past 7 days">
      {days.map((d) => {
        const label = parseLocal(d.date).toLocaleDateString(undefined, { weekday: "short" });
        const state = d.done ? "kept" : d.planned ? "planned, not marked" : "not planned";
        return (
          <li key={d.date} className="flex flex-col items-center gap-0.5 text-[11px] text-muted">
            <span
              className={`block h-4 w-4 rounded-full border ${
                d.done
                  ? "border-accent bg-accent"
                  : d.planned
                    ? "border-accent"
                    : "border-line bg-line/40"
              }`}
              aria-hidden="true"
            />
            <span aria-hidden="true">{label}</span>
            <span className="sr-only">
              {parseLocal(d.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              : {state}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SankalpaCard({ s, today, readOnly }: { s: Sankalpa; today: string; readOnly: boolean }) {
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<"delete" | "calendar" | null>(null);
  const paused = s.status === "paused";
  return (
    <li
      className={`rounded-2xl border bg-card p-4 ${paused ? "border-dashed border-line opacity-80" : "border-line"}`}
    >
      <article aria-label={s.text}>
        {editing ? (
          <SankalpaForm
            initial={s}
            submitLabel="Save changes"
            onSubmit={(v) => {
              updateItem("sankalpas", s.id, v);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">{s.text}</h3>
              {paused && (
                <span className="rounded-full border border-line px-2 py-0.5 text-xs">Paused</span>
              )}
            </div>
            <p className="text-sm text-muted">
              {describeSchedule(s.schedule)} · {progressText(s, today)}
            </p>
            {s.schedule.kind !== "once" && <WeekDots s={s} today={today} />}
            {!readOnly && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() =>
                    updateItem("sankalpas", s.id, { status: paused ? "active" : "paused" })
                  }
                  aria-label={`${paused ? "Resume" : "Pause"} ${s.text}`}
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setDialog("calendar")}
                  aria-label={`Add to my calendar: ${s.text}`}
                >
                  Add to my calendar
                </button>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setEditing(true)}
                  aria-label={`Edit ${s.text}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={buttonDanger}
                  onClick={() => setDialog("delete")}
                  aria-label={`Delete ${s.text}`}
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </article>
      {dialog === "calendar" && <CalendarDialog s={s} onClose={() => setDialog(null)} />}
      {dialog === "delete" && (
        <Dialog
          title="Delete this Sankalpa?"
          description={`“${s.text}” and its record will be removed from this browser.`}
          onClose={() => setDialog(null)}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setDialog(null)}
              data-autofocus
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => {
                removeItem("sankalpas", s.id);
                setDialog(null);
              }}
            >
              Delete Sankalpa
            </button>
          </div>
        </Dialog>
      )}
    </li>
  );
}

/** Daily Sankalpa: optional intentions, gently tracked. Nothing here is required or scored. */
export function DailySankalpa() {
  const [status, setStatus] = useState("");
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Daily Sankalpa</h1>
        <p className="mt-2 text-muted">
          A sankalpa is a heartfelt intention. Set one for a day or for a rhythm of days, mark it
          when you keep it, and pause or let it go whenever you need. Missing a day isn&apos;t a
          failure; there are no streaks to break.
        </p>
      </header>
      <div className="mt-6">
        <JourneyGate>
          {(journey, readOnly) => {
            // Computed here, in the browser only: "today" must be the person's day, not build time.
            const today = localDate();
            const all = journey.sankalpas;
            const todayList = all.filter(
              (s) => s.status === "active" && isPlannedOn(s.schedule, today),
            );
            return (
              <div className="space-y-6">
                <section
                  aria-labelledby="today-title"
                  className="rounded-2xl border border-gold/60 bg-accent-soft p-5"
                >
                  <h2 id="today-title" className="font-display text-2xl">
                    Today,{" "}
                    {parseLocal(today).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  {todayList.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">Nothing planned for today.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {todayList.map((s) => (
                        <li key={s.id}>
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-accent"
                              checked={s.done.includes(today)}
                              disabled={readOnly}
                              onChange={() => {
                                updateItem("sankalpas", s.id, { done: toggleDone(s.done, today) });
                                setStatus(
                                  s.done.includes(today)
                                    ? `Unmarked “${s.text}”.`
                                    : `Marked “${s.text}” as kept today.`,
                                );
                              }}
                            />
                            <span>{s.text}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p aria-live="polite" className="mt-1 text-sm">
                    {status}
                  </p>
                </section>

                {!readOnly && (
                  <section
                    aria-labelledby="new-sankalpa"
                    className="rounded-2xl border border-line bg-card p-5"
                  >
                    <h2 id="new-sankalpa" className="font-display text-2xl">
                      New Sankalpa
                    </h2>
                    <div className="mt-3">
                      <SankalpaForm
                        submitLabel="Add Sankalpa"
                        onSubmit={(v) => {
                          addItem("sankalpas", { ...v, status: "active", done: [] });
                          setStatus("Sankalpa added.");
                        }}
                      />
                    </div>
                  </section>
                )}

                <section aria-labelledby="all-sankalpas">
                  <h2 id="all-sankalpas" className="font-display text-2xl">
                    My intentions
                  </h2>
                  {all.length === 0 ? (
                    <p className="mt-2 text-muted">No intentions yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {all.map((s) => (
                        <SankalpaCard key={s.id} s={s} today={today} readOnly={readOnly} />
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-sm text-muted">
                    Reminders come from your own calendar app via &ldquo;Add to my calendar&rdquo;;
                    this site never sends notifications. Export or delete everything in{" "}
                    <Link href="/my-journey?tab=data" className="underline">
                      My data
                    </Link>
                    .
                  </p>
                </section>
              </div>
            );
          }}
        </JourneyGate>
      </div>
    </div>
  );
}
