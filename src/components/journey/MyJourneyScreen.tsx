"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { GoalsPanel } from "./GoalsPanel";
import { JourneyGate } from "./JourneyGate";
import { MyDataPanel } from "./MyDataPanel";
import { WisdomTree } from "./WisdomTree";

export type JourneyTab = "goals" | "tree" | "data";

const TABS: { id: JourneyTab; label: string }[] = [
  { id: "goals", label: "Goals" },
  { id: "tree", label: "Wisdom Tree" },
  { id: "data", label: "My data" },
];

/** Accessible tabs (arrow keys move between tabs, as in the ARIA tabs pattern). */
function Tabs({
  tab,
  setTab,
  panels,
}: {
  tab: JourneyTab;
  setTab: (t: JourneyTab) => void;
  panels: Record<JourneyTab, ReactNode>;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  function onKeyDown(e: KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const next =
      e.key === "ArrowRight"
        ? (i + 1) % TABS.length
        : e.key === "ArrowLeft"
          ? (i + TABS.length - 1) % TABS.length
          : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next].id);
    refs.current[TABS[next].id]?.focus();
  }
  return (
    <>
      <div
        role="tablist"
        aria-label="My Dharma Journey"
        className="flex gap-1 border-b border-line"
        onKeyDown={onKeyDown}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`-mb-px rounded-t-xl border px-4 py-2 text-sm ${
              tab === t.id
                ? "border-line border-b-paper bg-paper font-semibold text-accent"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={tab !== t.id}
          tabIndex={0}
          className="pt-6 focus:outline-none"
        >
          {tab === t.id && panels[t.id]}
        </div>
      ))}
    </>
  );
}

export function MyJourneyScreen({ initialTab = "goals" }: { initialTab?: JourneyTab }) {
  // Links such as /my-journey?tab=tree open a specific tab; the person's own choice wins after that.
  const fromUrl = useSearchParams().get("tab");
  const [chosen, setTab] = useState<JourneyTab | null>(null);
  const tab: JourneyTab =
    chosen ??
    (fromUrl === "goals" || fromUrl === "tree" || fromUrl === "data" ? fromUrl : initialTab);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">My Dharma Journey</h1>
        <p className="mt-2 text-muted">
          The goals you choose to remember and the teachings you save, kept privately in this
          browser.
        </p>
      </header>
      <div className="mt-6">
        <JourneyGate>
          {(journey, readOnly) => (
            <Tabs
              tab={tab}
              setTab={setTab}
              panels={{
                goals: <GoalsPanel goals={journey.goals} readOnly={readOnly} />,
                tree: <WisdomTree leaves={journey.leaves} readOnly={readOnly} />,
                data: <MyDataPanel journey={journey} />,
              }}
            />
          )}
        </JourneyGate>
      </div>
    </div>
  );
}
