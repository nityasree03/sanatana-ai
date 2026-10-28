"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Companion } from "@/lib/companions";

export interface HandoffCandidate {
  id: number;
  role: "user" | "companion";
  text: string;
}

const PREVIEW = 140;

/**
 * Companion Handoff: when switching companions mid-conversation, the person decides exactly which
 * earlier messages (if any) the new companion may see. Nothing is shared without this choice.
 */
export function HandoffDialog({
  from,
  to,
  candidates,
  onShare,
  onFresh,
  onCancel,
}: {
  from: Companion;
  to: Companion;
  candidates: HandoffCandidate[];
  onShare: (ids: number[]) => void;
  onFresh: () => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set(candidates.map((c) => c.id)));
  const titleId = useId();
  const descId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    boxRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    return () => before?.focus?.();
  }, []);

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Keep keyboard focus inside the dialog; Escape cancels.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key !== "Tab" || !boxRef.current) return;
    const items = [...boxRef.current.querySelectorAll<HTMLElement>("input, button")].filter(
      (el) => !el.hasAttribute("disabled"),
    );
    const first = items[0];
    const last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  const count = selected.size;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-card p-5 shadow-xl"
      >
        <h2 id={titleId} className="font-display text-xl">
          Switch to {to.name}?
        </h2>
        <p id={descId} className="mt-1 text-sm text-muted">
          {to.name} hasn&apos;t seen your conversation with {from.name}. Choose what to share, or
          start fresh. Only the messages you tick are sent.
        </p>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Messages to share with {to.name}</legend>
          <ul className="mt-2 space-y-1.5">
            {candidates.map((c) => {
              const preview =
                c.text.length > PREVIEW ? `${c.text.slice(0, PREVIEW).trimEnd()} …` : c.text;
              return (
                <li key={c.id}>
                  <label className="flex cursor-pointer gap-2 rounded-lg border border-line p-2 text-sm hover:bg-accent-soft">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                    />
                    <span>
                      <span className="font-semibold">
                        {c.role === "user" ? "You" : from.name}:
                      </span>{" "}
                      {preview}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onFresh}
            className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
          >
            Start fresh
          </button>
          <button
            type="button"
            disabled={count === 0}
            onClick={() => onShare(candidates.filter((c) => selected.has(c.id)).map((c) => c.id))}
            className="rounded-full bg-accent px-4 py-2 text-sm text-on-accent hover:opacity-90 disabled:opacity-50"
          >
            Share {count} {count === 1 ? "message" : "messages"}
          </button>
        </div>
      </div>
    </div>
  );
}
