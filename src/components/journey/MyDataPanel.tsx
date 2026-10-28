"use client";

import { useId, useRef, useState } from "react";
import { Dialog, buttonDanger, buttonPrimary, buttonSecondary } from "@/components/ui/Dialog";
import type { Journey } from "@/lib/journey/schema";
import {
  deleteEverything,
  disableSaving,
  exportJourney,
  importJourney,
  localDate,
  type ImportMode,
} from "@/lib/journey/store";

/** Download a text file in the browser. */
export function downloadFile(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Export, import, delete everything, turn saving off. */
export function MyDataPanel({ journey }: { journey: Journey }) {
  const [dialog, setDialog] = useState<"off" | "delete" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const fileRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const counts = [
    plural(journey.goals.length, "goal"),
    plural(journey.leaves.length, "Wisdom Tree leaf").replace("leafs", "leaves"),
    plural(journey.reflections.length, "reflection"),
    plural(journey.sankalpas.length, "sankalpa"),
  ].join(" · ");

  async function onImport(file: File | undefined) {
    if (!file) return;
    setError(null);
    setStatus(null);
    try {
      const s = importJourney(await file.text(), mode);
      setStatus(
        `Imported ${plural(s.goals, "goal")}, ${plural(s.leaves, "leaf").replace("leafs", "leaves")}, ${plural(s.reflections, "reflection")} and ${plural(s.sankalpas, "sankalpa")} (${mode === "merge" ? "merged with what was here" : "replacing what was here"}).`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby="mydata-title" className="rounded-2xl border border-line bg-card p-5">
      <h2 id="mydata-title" className="font-display text-2xl">
        My data
      </h2>
      <p className="mt-1 text-sm text-muted">
        Saved in this browser only: {counts}.{" "}
        {journey.enabled ? "Saving is on." : "Saving is off (what's here is kept, read-only)."}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="font-semibold">Export a copy</h3>
          <p className="text-sm text-muted">
            Downloads everything as a file you can keep as a backup or move to another browser.
          </p>
          <button
            type="button"
            className={`${buttonSecondary} mt-2`}
            onClick={() => {
              downloadFile(
                `sanatana-journey-${localDate()}.json`,
                JSON.stringify(exportJourney(journey), null, 2),
                "application/json",
              );
              setStatus("Your export has been downloaded.");
            }}
          >
            Export my data
          </button>
        </div>

        {journey.enabled && (
          <div>
            <h3 className="font-semibold">Import a copy</h3>
            <fieldset className="mt-1 text-sm">
              <legend className="sr-only">How to import</legend>
              <label className="mr-4 inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                />
                Add to what&apos;s here
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                />
                Replace what&apos;s here
              </label>
            </fieldset>
            <label
              htmlFor={fileId}
              className={`${buttonSecondary} mt-2 inline-block cursor-pointer`}
            >
              Choose an export file…
            </label>
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => onImport(e.target.files?.[0])}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          {journey.enabled && (
            <button type="button" className={buttonSecondary} onClick={() => setDialog("off")}>
              Turn saving off
            </button>
          )}
          <button type="button" className={buttonDanger} onClick={() => setDialog("delete")}>
            Delete everything
          </button>
        </div>
      </div>

      <div aria-live="polite" className="mt-3 text-sm">
        {status}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {dialog === "delete" && (
        <Dialog
          title="Delete everything?"
          description={`This permanently removes ${counts} from this browser. It can't be undone unless you exported a copy.`}
          onClose={() => setDialog(null)}
        >
          <div className="flex flex-wrap justify-end gap-2">
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
                deleteEverything();
                setDialog(null);
                setStatus("Everything was deleted. Saving is off.");
              }}
            >
              Delete everything
            </button>
          </div>
        </Dialog>
      )}

      {dialog === "off" && (
        <Dialog
          title="Turn saving off?"
          description="Nothing new will be saved, and your saved goals won't be offered to companions. What should happen to what's already saved?"
          onClose={() => setDialog(null)}
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={buttonPrimary}
              data-autofocus
              onClick={() => {
                disableSaving(true);
                setDialog(null);
                setStatus("Saving is off. Your saved items are kept on this device, read-only.");
              }}
            >
              Keep it on this device (read-only)
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => {
                disableSaving(false);
                setDialog(null);
                setStatus("Saving is off and everything was deleted.");
              }}
            >
              Delete it and turn saving off
            </button>
            <button type="button" className={buttonSecondary} onClick={() => setDialog(null)}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
