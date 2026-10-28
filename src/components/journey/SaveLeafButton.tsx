"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Dialog, buttonPrimary, buttonSecondary, inputClass } from "@/components/ui/Dialog";
import type { CompanionId } from "@/lib/companions";
import { LEAF_THEMES, LIMITS, type Leaf } from "@/lib/journey/schema";
import { addItem, enableSaving, storageAvailable } from "@/lib/journey/store";
import { useJourney } from "@/lib/journey/useJourney";
import { ConsentText } from "./JourneyConsent";

export interface LeafPassage {
  id: string;
  reference: string;
  translator: string;
  text: string;
  /** Scripture Explorer link, e.g. /scriptures/bhagavad-gita/2#bg-2.47 */
  href: string;
}

function excerptOf(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= LIMITS.excerpt) return t;
  return `${t.slice(0, t.lastIndexOf(" ", LIMITS.excerpt - 2))} …`;
}

/** Pick a theme (branch) and an optional note; shared by "save" and "edit". */
export function ThemeFields({
  theme,
  setTheme,
  note,
  setNote,
  existingThemes = [],
}: {
  theme: string;
  setTheme: (t: string) => void;
  note: string;
  setNote: (n: string) => void;
  existingThemes?: string[];
}) {
  const otherId = useId();
  const noteId = useId();
  const options = [...new Set([...LEAF_THEMES, ...existingThemes])];
  const isOther = !options.includes(theme);
  return (
    <>
      <fieldset>
        <legend className="font-semibold">Branch (theme)</legend>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          {options.map((t) => (
            <label key={t} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="leaf-theme"
                checked={theme === t}
                onChange={() => setTheme(t)}
              />
              {t}
            </label>
          ))}
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="leaf-theme"
              checked={isOther}
              onChange={() => setTheme("")}
              aria-label="My own theme"
            />
            <span>My own:</span>
          </label>
        </div>
        {isOther && (
          <div className="mt-2">
            <label htmlFor={otherId} className="text-sm">
              Theme name
            </label>
            <input
              id={otherId}
              value={theme}
              maxLength={LIMITS.theme}
              onChange={(e) => setTheme(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </fieldset>
      <div className="mt-3">
        <label htmlFor={noteId} className="font-semibold">
          Note <span className="font-normal text-muted">(optional, only for you)</span>
        </label>
        <textarea
          id={noteId}
          value={note}
          maxLength={LIMITS.note}
          rows={2}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
        />
      </div>
    </>
  );
}

function SaveLeafDialog({
  passage,
  source,
  companion,
  enabled,
  existingThemes,
  onClose,
  onSaved,
}: {
  passage: LeafPassage;
  source: Leaf["source"];
  companion?: CompanionId;
  enabled: boolean;
  existingThemes: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [theme, setTheme] = useState<string>(LEAF_THEMES[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  function save() {
    const t = theme.trim();
    if (!t) return setError("Choose a branch or name your own.");
    try {
      if (!enabled) {
        if (!storageAvailable())
          return setError("This browser isn't letting the site save anything.");
        enableSaving();
      }
      addItem("leaves", {
        passageId: passage.id,
        reference: passage.reference,
        translator: passage.translator,
        excerpt: excerptOf(passage.text),
        href: passage.href,
        theme: t,
        note: note.trim(),
        source,
        ...(companion && { companion }),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Dialog
      title="Save to your Wisdom Tree"
      description={`${passage.reference} · ${passage.translator}. The passage stays linked to the Scripture Explorer.`}
      onClose={onClose}
    >
      <ThemeFields
        theme={theme}
        setTheme={setTheme}
        note={note}
        setNote={setNote}
        existingThemes={existingThemes}
      />
      {!enabled && (
        <div className="mt-3 rounded-xl border border-gold/60 bg-accent-soft p-3">
          <p className="text-sm font-semibold">
            Saving on this device is off. Saving this leaf turns it on:
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
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={buttonPrimary} onClick={save}>
          {enabled ? "Save leaf" : "Turn on saving and save"}
        </button>
      </div>
    </Dialog>
  );
}

/** "Save to Wisdom Tree" for one passage, or "Saved" if it is already a leaf. */
export function SaveLeafButton({
  passage,
  source,
  companion,
}: {
  passage: LeafPassage;
  source: Leaf["source"];
  companion?: CompanionId;
}) {
  const { journey, ready } = useJourney();
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  if (!ready) return null;
  const saved = journey.leaves.some((l) => l.passageId === passage.id);
  if (saved) {
    return (
      <span className="text-xs text-leaf-ink">
        <span aria-hidden="true">🌿 </span>
        {justSaved ? "Saved to your " : "In your "}
        <Link href="/my-journey?tab=tree" className="underline">
          Wisdom Tree
        </Link>
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-leaf-ink underline hover:no-underline"
      >
        <span aria-hidden="true">🌱 </span>Save to Wisdom Tree
        <span className="sr-only">: {passage.reference}</span>
      </button>
      {open && (
        <SaveLeafDialog
          passage={passage}
          source={source}
          companion={companion}
          enabled={journey.enabled}
          existingThemes={journey.leaves.map((l) => l.theme)}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            setJustSaved(true);
          }}
        />
      )}
    </>
  );
}
