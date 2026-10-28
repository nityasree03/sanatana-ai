"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  Dialog,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/Dialog";
import { COMPANIONS, type CompanionId } from "@/lib/companions";
import { setChatDraft } from "@/lib/journey/handoff";
import {
  REFLECTION_FIELDS,
  isEmptyReflection,
  reflectionMessage,
  type ReflectionField,
} from "@/lib/journey/reflection";
import { LIMITS, type Reflection, type Schedule } from "@/lib/journey/schema";
import { addItem, localDate, removeItem, updateItem } from "@/lib/journey/store";
import { JourneyGate } from "./JourneyGate";
import { ScheduleFields } from "./ScheduleFields";

type Draft = Pick<Reflection, "date" | ReflectionField>;
const emptyDraft = (): Draft => ({
  date: localDate(),
  intention: "",
  action: "",
  outcome: "",
  learning: "",
  nextStep: "",
});

function ReflectionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => void;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<Draft>(initial ?? emptyDraft());
  const [error, setError] = useState<string | null>(null);
  const base = useId();
  function submit(e: FormEvent) {
    e.preventDefault();
    if (isEmptyReflection(d)) return setError("Write at least one part of the reflection.");
    onSubmit({
      ...d,
      ...Object.fromEntries(REFLECTION_FIELDS.map((f) => [f.key, d[f.key].trim()])),
    });
    if (!initial) setD(emptyDraft());
    setError(null);
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="max-w-xs">
        <label htmlFor={`${base}-date`} className="font-semibold">
          Date
        </label>
        <input
          id={`${base}-date`}
          type="date"
          value={d.date}
          onChange={(e) => e.target.value && setD({ ...d, date: e.target.value })}
          className={inputClass}
        />
      </div>
      {REFLECTION_FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={`${base}-${f.key}`} className="font-semibold">
            {f.label}
          </label>
          <p id={`${base}-${f.key}-hint`} className="text-xs text-muted">
            {f.hint}
          </p>
          <textarea
            id={`${base}-${f.key}`}
            aria-describedby={`${base}-${f.key}-hint`}
            value={d[f.key]}
            maxLength={LIMITS.reflectionField}
            rows={2}
            onChange={(e) => setD({ ...d, [f.key]: e.target.value })}
            className={inputClass}
          />
        </div>
      ))}
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

function DiscussDialog({ reflection, onClose }: { reflection: Reflection; onClose: () => void }) {
  const router = useRouter();
  const [companion, setCompanion] = useState<CompanionId>("krishna");
  const { text, shortened } = reflectionMessage(reflection);
  const name = useId();
  return (
    <Dialog
      title="Discuss with a companion"
      description="Your reflection is placed in the chat box. Nothing is sent until you press Send there, and then it goes to our server and Google Gemini."
      onClose={onClose}
    >
      <fieldset>
        <legend className="font-semibold">Which companion?</legend>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {COMPANIONS.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name={name}
                checked={companion === c.id}
                onChange={() => setCompanion(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-3 text-sm font-semibold">What will go into the chat box</p>
      <pre className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-line p-3 font-sans text-xs whitespace-pre-wrap">
        {text}
      </pre>
      {shortened && (
        <p className="mt-1 text-xs text-muted">
          Shortened to fit one message; you can edit it before sending.
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonPrimary}
          data-autofocus
          onClick={() => {
            setChatDraft(text);
            router.push(`/chat?companion=${companion}&draft=1`);
          }}
        >
          Open the chat
        </button>
      </div>
    </Dialog>
  );
}

function SankalpaDialog({ reflection, onClose }: { reflection: Reflection; onClose: () => void }) {
  const [text, setText] = useState(reflection.nextStep.trim().slice(0, LIMITS.sankalpa));
  const [schedule, setSchedule] = useState<Schedule>({ kind: "daily" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  if (done) {
    return (
      <Dialog title="Sankalpa added" onClose={onClose}>
        <p>
          Your next step is now a Sankalpa. You can track it, pause it or add it to your calendar on{" "}
          <Link href="/daily-sankalpa" className="underline">
            Daily Sankalpa
          </Link>
          .
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" className={buttonPrimary} onClick={onClose} data-autofocus>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog
      title="Make my next step a Sankalpa"
      description="An intention you can come back to."
      onClose={onClose}
    >
      <label htmlFor={fieldId} className="font-semibold">
        Intention
      </label>
      <input
        id={fieldId}
        data-autofocus
        value={text}
        maxLength={LIMITS.sankalpa}
        onChange={(e) => setText(e.target.value)}
        className={inputClass}
      />
      <div className="mt-3">
        <ScheduleFields value={schedule} onChange={setSchedule} />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonPrimary}
          onClick={() => {
            if (!text.trim()) return setError("Write the intention first.");
            addItem("sankalpas", {
              text: text.trim(),
              schedule,
              status: "active",
              done: [],
              fromReflection: reflection.id,
            });
            setDone(true);
          }}
        >
          Add Sankalpa
        </button>
      </div>
    </Dialog>
  );
}

function ReflectionCard({ r, readOnly }: { r: Reflection; readOnly: boolean }) {
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<"delete" | "discuss" | "sankalpa" | null>(null);
  const heading = `Reflection of ${new Date(`${r.date}T12:00:00`).toLocaleDateString(undefined, { dateStyle: "long" })}`;
  return (
    <li className="rounded-2xl border border-line bg-card p-4">
      <article aria-label={heading}>
        <h3 className="font-display text-xl">{heading}</h3>
        {editing ? (
          <div className="mt-3">
            <ReflectionForm
              initial={r}
              submitLabel="Save changes"
              onSubmit={(d) => {
                updateItem("reflections", r.id, d);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <dl className="mt-2 space-y-2">
              {REFLECTION_FIELDS.filter((f) => r[f.key].trim()).map((f) => (
                <div key={f.key}>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {f.label}
                  </dt>
                  <dd className="whitespace-pre-wrap">{r[f.key]}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setDialog("discuss")}
              >
                Discuss with a companion
              </button>
              {!readOnly && r.nextStep.trim() && (
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setDialog("sankalpa")}
                >
                  Make my next step a Sankalpa
                </button>
              )}
              {!readOnly && (
                <>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setEditing(true)}
                  >
                    Edit<span className="sr-only"> {heading}</span>
                  </button>
                  <button
                    type="button"
                    className={buttonDanger}
                    onClick={() => setDialog("delete")}
                  >
                    Delete<span className="sr-only"> {heading}</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </article>
      {dialog === "discuss" && <DiscussDialog reflection={r} onClose={() => setDialog(null)} />}
      {dialog === "sankalpa" && <SankalpaDialog reflection={r} onClose={() => setDialog(null)} />}
      {dialog === "delete" && (
        <Dialog
          title="Delete this reflection?"
          description={`${heading} will be removed from this browser.`}
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
                removeItem("reflections", r.id);
                setDialog(null);
              }}
            >
              Delete reflection
            </button>
          </div>
        </Dialog>
      )}
    </li>
  );
}

/** Karma Reflection Mirror: a private five-part journal. No scores, streaks or judgements. */
export function ReflectionMirror() {
  const [status, setStatus] = useState("");
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Karma Reflection Mirror</h1>
        <p className="mt-2 text-muted">
          A private journal for looking honestly at one action: what you intended, what you did,
          what happened, what you learned and what you&apos;ll try next.
        </p>
        <p className="mt-2 text-sm text-muted">
          There are no scores here. Karma isn&apos;t something this site can measure, and nobody,
          human or AI, can tell you what your actions will bring. The mirror is only for your own
          reflection.
        </p>
      </header>
      <div className="mt-6">
        <JourneyGate>
          {(journey, readOnly) => {
            const entries = [...journey.reflections].sort(
              (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
            );
            return (
              <div className="space-y-6">
                {!readOnly && (
                  <section
                    aria-labelledby="new-reflection"
                    className="rounded-2xl border border-line bg-card p-5"
                  >
                    <h2 id="new-reflection" className="font-display text-2xl">
                      New reflection
                    </h2>
                    <div className="mt-3">
                      <ReflectionForm
                        submitLabel="Save reflection"
                        onSubmit={(d) => {
                          addItem("reflections", d);
                          setStatus("Reflection saved in this browser.");
                        }}
                      />
                    </div>
                  </section>
                )}
                <p aria-live="polite" className="text-sm">
                  {status}
                </p>
                <section aria-labelledby="past-reflections">
                  <h2 id="past-reflections" className="font-display text-2xl">
                    My reflections
                  </h2>
                  {entries.length === 0 ? (
                    <p className="mt-2 text-muted">No reflections yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {entries.map((r) => (
                        <ReflectionCard key={r.id} r={r} readOnly={readOnly} />
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-sm text-muted">
                    Export or delete everything you&apos;ve saved in{" "}
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
