"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";

/**
 * Accessible modal dialog: labelled, keeps keyboard focus inside, Escape closes, and focus returns
 * to where it was. Used for confirmations and small forms.
 */
export function Dialog({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const descId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const focusable = "input, textarea, select, button, a[href]";

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const box = boxRef.current;
    (
      box?.querySelector<HTMLElement>("[data-autofocus]") ??
      box?.querySelector<HTMLElement>(focusable)
    )?.focus();
    return () => before?.focus?.();
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !boxRef.current) return;
    const items = [...boxRef.current.querySelectorAll<HTMLElement>(focusable)].filter(
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onKeyDown={onKeyDown}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-card p-5 shadow-xl"
      >
        <h2 id={titleId} className="font-display text-2xl">
          {title}
        </h2>
        {description && (
          <div id={descId} className="mt-1 text-sm text-muted">
            {description}
          </div>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export const buttonPrimary =
  "rounded-full bg-accent px-4 py-2 text-sm text-on-accent hover:opacity-90 disabled:opacity-50";
export const buttonSecondary =
  "rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft disabled:opacity-50";
export const buttonDanger =
  "rounded-full border border-red-700 px-4 py-2 text-sm text-red-800 hover:bg-red-50 dark:border-red-300 dark:text-red-200 dark:hover:bg-red-950";
export const inputClass =
  "mt-1 w-full rounded-xl border-2 border-line bg-card p-2.5 focus:border-accent focus:outline-none";
