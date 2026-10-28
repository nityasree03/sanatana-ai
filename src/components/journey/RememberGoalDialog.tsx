"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Dialog, buttonPrimary, buttonSecondary, inputClass } from "@/components/ui/Dialog";
import { LIMITS } from "@/lib/journey/schema";
import { addItem, enableSaving, storageAvailable } from "@/lib/journey/store";
import { ConsentText } from "./JourneyConsent";

/**
 * Save a goal from the person's own chat message. The text is shown and editable first; if saving
 * is off, the same consent as on My Dharma Journey is shown before anything is stored.
 */
export function RememberGoalDialog({
  text,
  enabled,
  onClose,
  onSaved,
}: {
  text: string;
  enabled: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [goal, setGoal] = useState(text.trim().slice(0, LIMITS.goal));
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  function save() {
    const t = goal.trim();
    if (!t) return setError("Write the goal first.");
    try {
      if (!enabled) {
        if (!storageAvailable())
          return setError("This browser isn't letting the site save anything.");
        enableSaving();
      }
      addItem("goals", { text: t, note: "" });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Dialog
      title="Remember as a goal"
      description="Edit it the way you'd like to remember it. It's saved only in this browser."
      onClose={onClose}
    >
      <label htmlFor={fieldId} className="font-semibold">
        Goal
      </label>
      <textarea
        id={fieldId}
        data-autofocus
        value={goal}
        maxLength={LIMITS.goal}
        rows={3}
        onChange={(e) => setGoal(e.target.value)}
        className={inputClass}
      />
      {!enabled && (
        <div className="mt-3 rounded-xl border border-gold/60 bg-accent-soft p-3">
          <p className="text-sm font-semibold">
            Saving on this device is off. Saving this goal turns it on:
          </p>
          <div className="mt-1">
            <ConsentText />
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Link href="/my-journey" className="text-sm underline">
          See my saved goals
        </Link>
        <div className="flex gap-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={buttonPrimary} onClick={save}>
            {enabled ? "Save goal" : "Turn on saving and save"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
