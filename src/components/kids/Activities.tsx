"use client";

import { useState } from "react";
import { mixedOrder } from "@/lib/kids/stories";
import type { Activity, Scene } from "@/lib/kids/types";
import { StoryArt } from "./art/StoryArt";

const bigButton =
  "rounded-2xl border-2 border-line bg-card p-3 text-left text-lg font-semibold hover:border-accent focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default";

function Praise({ text }: { text: string }) {
  return (
    <p className="mt-4 rounded-2xl bg-accent-soft p-3 text-lg font-semibold">
      <span aria-hidden="true">★ </span>
      {text}
    </p>
  );
}

/** Choose one answer (pictures or words). Wrong tries get a hint and can try again. */
function Choice({
  activity,
  onDone,
}: {
  activity: Extract<Activity, { kind: "picture-choice" | "question" }>;
  onDone: () => void;
}) {
  const [tried, setTried] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const options =
    activity.kind === "picture-choice"
      ? activity.options
      : activity.options.map((label) => ({ label, art: "" }));
  function pick(i: number) {
    if (done) return;
    if (i === activity.answer) {
      setDone(true);
      onDone();
    } else setTried((t) => (t.includes(i) ? t : [...t, i]));
  }
  return (
    <div>
      <div
        className={`grid gap-3 ${activity.kind === "picture-choice" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}
      >
        {options.map((o, i) => {
          const isAnswer = done && i === activity.answer;
          const triedThis = tried.includes(i);
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => pick(i)}
              disabled={done || triedThis}
              aria-pressed={isAnswer}
              className={`${bigButton} ${isAnswer ? "border-accent bg-accent-soft" : ""} ${
                triedThis ? "opacity-60" : ""
              }`}
            >
              {o.art && <StoryArt id={o.art} className="mx-auto h-28 w-28" />}
              <span className="block text-center">
                {o.label}
                {isAnswer && <span className="sr-only"> (your answer)</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {done ? (
          <Praise text={activity.praise} />
        ) : (
          tried.length > 0 && (
            <p className="mt-4 text-lg">
              <span aria-hidden="true">💭 </span>Good try! {activity.hint}
            </p>
          )
        )}
      </div>
    </div>
  );
}

/** Tap the scene pictures in story order. A wrong tap simply doesn't count. */
function Sequence({
  activity,
  scenes,
  onDone,
}: {
  activity: Extract<Activity, { kind: "sequence" }>;
  scenes: Scene[];
  onDone: () => void;
}) {
  const order = mixedOrder(activity.scenes.length).map((i) => activity.scenes[i]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [nudge, setNudge] = useState(false);
  const done = placed.length === activity.scenes.length;
  function tap(id: string) {
    if (done || placed.includes(id)) return;
    if (activity.scenes[placed.length] === id) {
      const next = [...placed, id];
      setPlaced(next);
      setNudge(false);
      if (next.length === activity.scenes.length) onDone();
    } else setNudge(true);
  }
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Pictures to put in order">
        {order.map((id) => {
          const scene = scenes.find((s) => s.id === id)!;
          const n = placed.indexOf(id);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => tap(id)}
                disabled={n >= 0}
                className={`${bigButton} relative w-full ${n >= 0 ? "border-accent bg-accent-soft" : ""}`}
              >
                <StoryArt id={scene.art} className="h-auto w-full rounded-lg" />
                <span className="mt-1 block text-center text-base">
                  {scene.label}
                  {n >= 0 && <span className="sr-only">, number {n + 1}</span>}
                </span>
                {n >= 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 left-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xl text-on-accent"
                  >
                    {n + 1}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {done ? (
          <Praise text={activity.praise} />
        ) : nudge ? (
          <p className="mt-4 text-lg">
            Good try! What happened {placed.length === 0 ? "first" : "next"}?
          </p>
        ) : (
          placed.length > 0 && (
            <p className="mt-4 text-lg">{placed.length} in place. What came next?</p>
          )
        )}
      </div>
    </div>
  );
}

/** Tap a word, then its meaning. */
function Match({
  activity,
  onDone,
}: {
  activity: Extract<Activity, { kind: "match" }>;
  onDone: () => void;
}) {
  const rights = mixedOrder(activity.pairs.length).map((i) => activity.pairs[i].right);
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [nudge, setNudge] = useState(false);
  const done = matched.length === activity.pairs.length;
  function tapRight(right: string) {
    if (!left) return;
    const pair = activity.pairs.find((p) => p.left === left)!;
    if (pair.right === right) {
      const next = [...matched, left];
      setMatched(next);
      setLeft(null);
      setNudge(false);
      if (next.length === activity.pairs.length) onDone();
    } else setNudge(true);
  }
  const rightDone = (r: string) =>
    activity.pairs.some((p) => p.right === r && matched.includes(p.left));
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <ul className="space-y-3" aria-label="Words">
          {activity.pairs.map((p) => (
            <li key={p.left}>
              <button
                type="button"
                aria-pressed={left === p.left}
                disabled={matched.includes(p.left)}
                onClick={() => {
                  setLeft(p.left);
                  setNudge(false);
                }}
                className={`${bigButton} w-full ${left === p.left ? "border-accent" : ""} ${
                  matched.includes(p.left) ? "bg-accent-soft" : ""
                }`}
              >
                {p.left}
                {matched.includes(p.left) && <span className="sr-only"> (matched)</span>}
              </button>
            </li>
          ))}
        </ul>
        <ul className="space-y-3" aria-label="Meanings">
          {rights.map((r) => (
            <li key={r}>
              <button
                type="button"
                disabled={!left || rightDone(r)}
                onClick={() => tapRight(r)}
                className={`${bigButton} w-full text-base ${rightDone(r) ? "bg-accent-soft" : ""}`}
              >
                {r}
                {rightDone(r) && <span className="sr-only"> (matched)</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div aria-live="polite">
        {done ? (
          <Praise text={activity.praise} />
        ) : nudge ? (
          <p className="mt-4 text-lg">Good try! Let&apos;s look at “{left}” again.</p>
        ) : (
          <p className="mt-4 text-base text-muted">
            {left ? `Now tap what “${left}” means.` : "Tap a word first."}
          </p>
        )}
      </div>
    </div>
  );
}

export function ActivityView({
  activity,
  scenes,
  onDone,
}: {
  activity: Activity;
  scenes: Scene[];
  onDone: () => void;
}) {
  switch (activity.kind) {
    case "picture-choice":
    case "question":
      return <Choice activity={activity} onDone={onDone} />;
    case "sequence":
      return <Sequence activity={activity} scenes={scenes} onDone={onDone} />;
    case "match":
      return <Match activity={activity} onDone={onDone} />;
  }
}
