"use client";

import { useId, useState } from "react";
import { buttonDanger, buttonPrimary, inputClass } from "@/components/ui/Dialog";
import { BREAKS, DEFAULT_SETTINGS, RATES, type KidsSettings } from "@/lib/kids/settings";
import { AGE_LABEL, AGE_RANGES, type AgeRange } from "@/lib/kids/types";

/** Two small numbers to add: a speed bump that keeps little hands out of the settings. */
export function makeCheck(seed: number): { a: number; b: number } {
  return { a: 6 + (seed % 7), b: 3 + ((seed * 5) % 6) };
}

export function GrownUpCheck({ seed, onPass }: { seed: number; onPass: () => void }) {
  const { a, b } = makeCheck(seed);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(value.trim()) === a + b) onPass();
        else setWrong(true);
      }}
      className="mt-4 rounded-2xl border border-line bg-card p-4"
    >
      <label htmlFor={id} className="block font-semibold">
        Grown-up check: what is {a} + {b}?
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setWrong(false);
          }}
          className={`${inputClass} max-w-32`}
          aria-describedby={wrong ? `${id}-wrong` : undefined}
        />
        <button type="submit" className={`${buttonPrimary} mt-1`}>
          Continue
        </button>
      </div>
      {wrong && (
        <p id={`${id}-wrong`} role="status" className="mt-2 text-sm">
          That isn&apos;t it. Please ask a grown-up.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        This only keeps little hands out of the settings. It is not a lock.
      </p>
    </form>
  );
}

export function CaregiverSettings({
  initial,
  keepProgress,
  onSave,
  onDeleteProgress,
}: {
  initial: KidsSettings | null;
  keepProgress: boolean;
  onSave: (s: KidsSettings, keepProgress: boolean) => void;
  onDeleteProgress: () => void;
}) {
  const [age, setAge] = useState<AgeRange | null>(initial?.age ?? null);
  const [narration, setNarration] = useState(initial?.narration ?? DEFAULT_SETTINGS.narration);
  const [rate, setRate] = useState<KidsSettings["rate"]>(initial?.rate ?? DEFAULT_SETTINGS.rate);
  const [activities, setActivities] = useState(initial?.activities ?? DEFAULT_SETTINGS.activities);
  const [breakAfter, setBreakAfter] = useState<KidsSettings["breakAfter"]>(
    initial?.breakAfter ?? DEFAULT_SETTINGS.breakAfter,
  );
  const [progress, setProgress] = useState(keepProgress);
  const [needAge, setNeedAge] = useState(false);
  const name = useId();

  return (
    <form
      className="mt-4 space-y-5 rounded-2xl border border-line bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!age) {
          setNeedAge(true);
          return;
        }
        onSave({ age, narration, rate, activities, breakAfter }, progress);
      }}
    >
      <fieldset aria-describedby={needAge ? `${name}-age` : undefined}>
        <legend className="font-semibold">Learning range</legend>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {AGE_RANGES.map((a) => (
            <label key={a} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={`${name}-age`}
                checked={age === a}
                onChange={() => {
                  setAge(a);
                  setNeedAge(false);
                }}
              />
              {AGE_LABEL[a]}
            </label>
          ))}
        </div>
        {needAge && (
          <p id={`${name}-age`} role="status" className="mt-1 text-sm font-semibold">
            Please choose a learning range.
          </p>
        )}
        <p className="mt-1 text-xs text-muted">
          Changes how the story is told and which activities appear. It is not saved anywhere.
        </p>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Reading aloud</legend>
        <label className="mt-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={narration}
            onChange={(e) => setNarration(e.target.checked)}
          />
          Narrator reads each page (device voice)
        </label>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {RATES.map((r) => (
            <label key={r.value} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={`${name}-rate`}
                disabled={!narration}
                checked={rate === r.value}
                onChange={() => setRate(r.value)}
              />
              {r.label} voice
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Activities and breaks</legend>
        <label className="mt-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={activities}
            onChange={(e) => setActivities(e.target.checked)}
          />
          Include picture choices, puzzles and questions
        </label>
        <label className="mt-2 flex flex-wrap items-center gap-2">
          Gentle break reminder
          <select
            value={breakAfter}
            onChange={(e) => setBreakAfter(Number(e.target.value) as KidsSettings["breakAfter"])}
            className="rounded-xl border-2 border-line bg-card p-1.5"
          >
            {BREAKS.map((b) => (
              <option key={b} value={b}>
                {b === 0 ? "Off" : `After ${b} minutes`}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Progress (optional)</legend>
        <label className="mt-1 flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={progress}
            onChange={(e) => setProgress(e.target.checked)}
          />
          <span>
            Remember which stories are finished, on this device only
            <span className="block text-xs text-muted">
              Only the story names are kept: no name, age, answers or voice. Turning this off
              deletes it.
            </span>
          </span>
        </label>
        {keepProgress && (
          <button type="button" className={`${buttonDanger} mt-2`} onClick={onDeleteProgress}>
            Delete saved progress
          </button>
        )}
      </fieldset>

      <button type="submit" className={buttonPrimary}>
        Start story time
      </button>
    </form>
  );
}
