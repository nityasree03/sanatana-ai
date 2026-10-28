"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Dialog,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/Dialog";
import { LIMITS, type Goal } from "@/lib/journey/schema";
import { addItem, removeItem, updateItem } from "@/lib/journey/store";

function GoalForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<Goal, "text" | "note">;
  submitLabel: string;
  onSubmit: (v: { text: string; note: string }) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const textId = useId();
  const noteId = useId();
  const errId = useId();
  function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return setError("Write your goal first.");
    if (t.length > LIMITS.goal) return setError(`Goals can be up to ${LIMITS.goal} characters.`);
    onSubmit({ text: t, note: note.trim() });
    if (!initial) {
      setText("");
      setNote("");
    }
    setError(null);
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div>
        <label htmlFor={textId} className="font-semibold">
          Goal
        </label>
        <input
          id={textId}
          value={text}
          maxLength={LIMITS.goal + 50}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errId : undefined}
          placeholder="e.g. Speak more patiently with my family"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={noteId} className="font-semibold">
          Note <span className="font-normal text-muted">(optional, only for you)</span>
        </label>
        <textarea
          id={noteId}
          value={note}
          maxLength={LIMITS.note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>
      {error && (
        <p id={errId} role="alert" className="text-sm text-red-700 dark:text-red-300">
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

/** Life Journey Memory: the goals the person chose to remember. */
export function GoalsPanel({ goals, readOnly }: { goals: Goal[]; readOnly: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [status, setStatus] = useState("");
  return (
    <section aria-labelledby="goals-title" className="space-y-5">
      <div>
        <h2 id="goals-title" className="font-display text-2xl">
          Life Journey Memory
        </h2>
        <p className="mt-1 text-sm text-muted">
          Goals you chose to remember. Companions see them only if you switch on &ldquo;Share my
          goals&rdquo; in a conversation; you can also save a goal from your own chat messages.
        </p>
      </div>

      {!readOnly && (
        <div className="rounded-2xl border border-line bg-card p-4">
          <h3 className="mb-2 font-semibold">Add a goal</h3>
          <GoalForm
            submitLabel="Save goal"
            onSubmit={(v) => {
              addItem("goals", v);
              setStatus("Goal saved.");
            }}
          />
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-muted">No goals saved yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Saved goals">
          {goals.map((g) => (
            <li key={g.id} className="rounded-2xl border border-line bg-card p-4">
              {editing === g.id ? (
                <GoalForm
                  initial={g}
                  submitLabel="Save changes"
                  onSubmit={(v) => {
                    updateItem("goals", g.id, v);
                    setEditing(null);
                    setStatus("Goal updated.");
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <>
                  <p className="text-lg">{g.text}</p>
                  {g.note && <p className="mt-1 text-sm text-muted">{g.note}</p>}
                  <p className="mt-1 text-xs text-muted">
                    Saved {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                  {!readOnly && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className={buttonSecondary}
                        onClick={() => setEditing(g.id)}
                        aria-label={`Edit goal: ${g.text}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={buttonDanger}
                        onClick={() => setDeleting(g)}
                        aria-label={`Delete goal: ${g.text}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <p aria-live="polite" className="text-sm">
        {status}
      </p>

      {deleting && (
        <Dialog
          title="Delete this goal?"
          description={`“${deleting.text}” will be removed from this browser.`}
          onClose={() => setDeleting(null)}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setDeleting(null)}
              data-autofocus
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => {
                removeItem("goals", deleting.id);
                setDeleting(null);
                setStatus("Goal deleted.");
              }}
            >
              Delete goal
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
