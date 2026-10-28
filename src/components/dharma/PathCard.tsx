"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { buttonDanger, buttonSecondary, inputClass } from "@/components/ui/Dialog";
import {
  DHARMA_LIMITS,
  type Action,
  type DecisionOption,
  type PointKind,
} from "@/lib/dharma/model";

export const KIND_LABEL: Record<PointKind, { title: string; mark: string; add: string }> = {
  up: { title: "Upsides", mark: "+", add: "Add an upside" },
  down: { title: "Downsides", mark: "−", add: "Add a downside" },
  unknown: { title: "Unknowns", mark: "?", add: "Add something I don't know yet" },
};

/**
 * A text field that edits locally and commits when you leave it, so clearing it to retype doesn't
 * delete anything mid-edit. Committing an empty value is handled by the caller.
 */
function CommitInput({
  value,
  onCommit,
  ...props
}: {
  value: string;
  onCommit: (v: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [local, setLocal] = useState<string | null>(null);
  return (
    <input
      {...props}
      value={local ?? value}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== null && local !== value) onCommit(local);
        setLocal(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

function PointList({
  option,
  kind,
  dispatch,
}: {
  option: DecisionOption;
  kind: PointKind;
  dispatch: (a: Action) => void;
}) {
  const [draft, setDraft] = useState("");
  const addId = useId();
  const points = option.points.filter((p) => p.kind === kind);
  const k = KIND_LABEL[kind];
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold">
        <span aria-hidden="true">{k.mark} </span>
        {k.title}
      </legend>
      <ul className="mt-1 space-y-1">
        {points.map((p, i) => (
          <li key={p.id} className="flex gap-1">
            <CommitInput
              value={p.text}
              maxLength={DHARMA_LIMITS.point}
              onCommit={(text) =>
                dispatch({ type: "updatePoint", optionId: option.id, pointId: p.id, text })
              }
              aria-label={`${k.title} ${i + 1} for ${option.title}`}
              className="min-w-0 flex-1 rounded-lg border border-line bg-card px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: "removePoint", optionId: option.id, pointId: p.id })}
              aria-label={`Remove ${k.title.toLowerCase().replace(/s$/, "")}: ${p.text}`}
              className="rounded-lg border border-line px-2 text-sm hover:bg-accent-soft"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-1 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          dispatch({ type: "addPoint", optionId: option.id, kind, text: draft });
          setDraft("");
        }}
      >
        <label htmlFor={addId} className="sr-only">
          {k.add} for {option.title}
        </label>
        <input
          id={addId}
          value={draft}
          maxLength={DHARMA_LIMITS.point}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={k.add}
          className="min-w-0 flex-1 rounded-lg border border-dashed border-line bg-card px-2 py-1 text-sm"
        />
        <button
          type="submit"
          aria-label={`Add to ${k.title.toLowerCase()}`}
          className="rounded-lg border border-line px-2 text-sm hover:bg-accent-soft"
        >
          Add
        </button>
      </form>
    </fieldset>
  );
}

/** One path: everything editable; AI-suggested paths are labelled. */
export function PathCard({
  option,
  index,
  selected,
  onSelect,
  dispatch,
}: {
  option: DecisionOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
  dispatch: (a: Action) => void;
}) {
  const base = useId();
  return (
    <li
      id={`path-${option.id}`}
      className={`scroll-mt-24 rounded-2xl border bg-card p-4 ${selected ? "border-accent ring-2 ring-accent/30" : "border-line"}`}
    >
      <article aria-label={`Path ${index + 1}: ${option.title}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Path {index + 1} ·{" "}
            {option.origin === "ai" ? "suggested by AI, yours to edit" : "my own"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSelect}
              className={buttonSecondary}
              aria-pressed={selected}
              aria-label={`${selected ? "Selected" : "Select"} path ${index + 1}`}
            >
              {selected ? "Selected" : "Select"}
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => dispatch({ type: "removeOption", optionId: option.id })}
              aria-label={`Remove path ${index + 1}: ${option.title}`}
            >
              Remove
            </button>
          </div>
        </div>
        <div className="mt-2 grid gap-2">
          <div>
            <label htmlFor={`${base}-t`} className="text-sm font-semibold">
              Path {index + 1} title
            </label>
            <CommitInput
              id={`${base}-t`}
              value={option.title}
              maxLength={DHARMA_LIMITS.title}
              onCommit={(title) =>
                dispatch({ type: "updateOption", optionId: option.id, patch: { title } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${base}-s`} className="text-sm font-semibold">
              In a sentence
            </label>
            <textarea
              id={`${base}-s`}
              value={option.summary}
              maxLength={DHARMA_LIMITS.summary}
              rows={2}
              onChange={(e) =>
                dispatch({
                  type: "updateOption",
                  optionId: option.id,
                  patch: { summary: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(["up", "down", "unknown"] as const).map((k) => (
            <PointList key={k} option={option} kind={k} dispatch={dispatch} />
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor={`${base}-f`} className="text-sm font-semibold">
            A small first step
          </label>
          <input
            id={`${base}-f`}
            value={option.firstStep}
            maxLength={DHARMA_LIMITS.firstStep}
            onChange={(e) =>
              dispatch({
                type: "updateOption",
                optionId: option.id,
                patch: { firstStep: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>
      </article>
    </li>
  );
}
