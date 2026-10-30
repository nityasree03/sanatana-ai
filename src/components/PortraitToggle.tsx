"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/site";

type Set = "child" | "adult";

// Like the theme, the choice lives on <html data-portraits="…">, set before the page paints.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-portraits"],
  });
  return () => observer.disconnect();
}
const getSet = (): Set =>
  document.documentElement.getAttribute("data-portraits") === "adult" ? "adult" : "child";
const getServerSet = (): Set => "child";

/** Switches the companion portraits between the child (Bal) and adult sets. */
export function PortraitToggle() {
  const set = useSyncExternalStore(subscribe, getSet, getServerSet);
  const isAdult = set === "adult";

  function toggle() {
    const next: Set = isAdult ? "child" : "adult";
    document.documentElement.setAttribute("data-portraits", next);
    try {
      localStorage.setItem(STORAGE_KEYS.portraits, next);
    } catch {
      // Storage unavailable: the choice still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Starts with the visible words (WCAG 2.5.3) and says what a press does.
      aria-label={isAdult ? "Adult portraits: switch to child" : "Child portraits: switch to adult"}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3 text-sm text-muted hover:text-ink"
    >
      <span aria-hidden="true">◐</span>
      <span>{isAdult ? "Adult portraits" : "Child portraits"}</span>
    </button>
  );
}
