"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/site";

type Theme = "light" | "dark";

// The theme lives on <html data-theme="…">. We "subscribe" to that attribute so this
// button always shows the real current theme, including the one set before page load.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getTheme = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
const getServerTheme = (): Theme => "light";

/** Switches between the light "Temple lamp" and dark "Kailash night" themes. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      // Storage can be unavailable (private mode). The theme still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Night theme"
      className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3 text-sm text-muted hover:text-ink"
    >
      <span aria-hidden="true">{isDark ? "☾" : "☀"}</span>
      <span aria-hidden="true">{isDark ? "Night" : "Day"}</span>
    </button>
  );
}
