"use client";

import { useEffect, useRef, useState } from "react";
import { ArchAvatar } from "@/components/ArchAvatar";
import { Dialog, buttonPrimary, buttonSecondary } from "@/components/ui/Dialog";
import { getCompanion } from "@/lib/companions";
import {
  clearSettings,
  deleteProgress,
  loadProgress,
  loadSettings,
  markFinished,
  saveSettings,
  startProgress,
  type KidsSettings,
} from "@/lib/kids/settings";
import { STORIES, getStory } from "@/lib/kids/stories";
import { AGE_LABEL } from "@/lib/kids/types";
import type { SpeechOutputAdapter } from "@/lib/speech/types";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";
import { CaregiverSettings, GrownUpCheck } from "./CaregiverSetup";
import { StoryPlayer } from "./StoryPlayer";

type View =
  { name: "grown-ups"; checked: boolean } | { name: "shelf" } | { name: "story"; id: string };

/**
 * Sanatana Kids: caregiver-operated story time. Nothing here talks to a server or an AI.
 * Settings last for this tab only; progress is kept only if the caregiver turns it on.
 */
export function KidsApp({
  references,
  output: outputProp,
  minuteMs = 60_000,
  seed,
}: {
  references: Record<string, string>;
  output?: SpeechOutputAdapter;
  /** Length of a "minute" for the break reminder (tests shorten it). */
  minuteMs?: number;
  /** Fixes the grown-up check numbers (tests). */
  seed?: number;
}) {
  const [output] = useState(() => outputProp ?? createWebSpeechOutput());
  const [canSpeak] = useState(() => output.isSupported());
  const [settings, setSettings] = useState<KidsSettings | null>(loadSettings);
  const [progress, setProgress] = useState<string[] | null>(loadProgress);
  const [view, setView] = useState<View>(() =>
    loadSettings() ? { name: "shelf" } : { name: "grown-ups", checked: false },
  );
  const [checkSeed] = useState(() => seed ?? Math.floor(Math.random() * 1000));
  const [breakDue, setBreakDue] = useState(false);
  const [breakRound, setBreakRound] = useState(0);
  const top = useRef<HTMLDivElement>(null);

  // Gentle break reminder, counted from when story time starts (or "keep going").
  const breakAfter = settings?.breakAfter ?? 0;
  const inStoryTime = view.name !== "grown-ups";
  useEffect(() => {
    if (!breakAfter || !inStoryTime) return;
    const t = window.setTimeout(() => setBreakDue(true), breakAfter * minuteMs);
    return () => window.clearTimeout(t);
  }, [breakAfter, inStoryTime, minuteMs, breakRound]);

  useEffect(() => {
    top.current?.scrollIntoView?.({ block: "start" });
  }, [view.name]);

  function save(next: KidsSettings, keep: boolean) {
    saveSettings(next);
    setSettings(next);
    if (keep && progress === null) setProgress(startProgress());
    if (!keep && progress !== null) {
      deleteProgress();
      setProgress(null);
    }
    setBreakRound((r) => r + 1);
    setView({ name: "shelf" });
  }

  return (
    <div ref={top} className="mx-auto max-w-5xl scroll-mt-24 px-4 py-8 md:py-10">
      {view.name === "grown-ups" && (
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl">Sanatana Kids: for grown-ups</h1>
          <div className="mt-3 space-y-2">
            <p>
              Story time is meant to be shared: a parent or caregiver sets it up and stays nearby.
              The four storytellers are <strong>AI-made characters inspired by tradition</strong>,
              not the deities themselves. Each story is retold from a text in our library, with its
              source and our changes shown.
            </p>
            <p className="text-sm">
              There is no chat, microphone, account, advertising or tracking here, and this section
              never sends anything to our server or to an AI. Settings last only until this tab is
              closed.
            </p>
          </div>
          {view.checked ? (
            <CaregiverSettings
              initial={settings}
              keepProgress={progress !== null}
              onSave={save}
              onDeleteProgress={() => {
                deleteProgress();
                setProgress(null);
              }}
            />
          ) : (
            <GrownUpCheck
              seed={checkSeed}
              onPass={() => setView({ name: "grown-ups", checked: true })}
            />
          )}
          {settings && (
            <p className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setView({ name: "shelf" })}
              >
                Back to the stories
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => {
                  clearSettings();
                  setSettings(null);
                  setView({ name: "grown-ups", checked: view.checked });
                }}
              >
                End story time
              </button>
            </p>
          )}
        </div>
      )}

      {view.name === "shelf" && settings && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-display text-4xl">Story time</h1>
            <button
              type="button"
              className="text-sm underline"
              onClick={() => setView({ name: "grown-ups", checked: false })}
            >
              Grown-ups: settings
            </button>
          </div>
          <p className="mt-1 text-muted">{AGE_LABEL[settings.age]} · Pick a story to begin.</p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {STORIES.map((s) => {
              const c = getCompanion(s.companion);
              const finished = progress?.includes(s.id);
              return (
                <li
                  key={s.id}
                  data-companion={c.id}
                  className="flex gap-4 rounded-3xl border-2 border-line bg-card p-4"
                >
                  <ArchAvatar
                    portraitSet="child"
                    companionId={c.id}
                    size="sm"
                    showState={false}
                    caption={false}
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl">{s.title}</h2>
                    <p className="text-sm text-muted">Told by {c.name} (AI narrator)</p>
                    <p className="mt-2">{s.blurb}</p>
                    {finished && (
                      <p className="mt-1 text-sm font-semibold">
                        <span aria-hidden="true">★ </span>Finished before
                      </p>
                    )}
                    <button
                      type="button"
                      className={`${buttonPrimary} mt-3 text-base`}
                      onClick={() => setView({ name: "story", id: s.id })}
                    >
                      Read {s.title}
                    </button>
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">Source and our changes</summary>
                      <p className="mt-1">{s.source}</p>
                      <p className="mt-1">{s.adaptation}</p>
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {view.name === "story" && settings && (
        <StoryPlayer
          story={getStory(view.id)!}
          settings={settings}
          output={output}
          canSpeak={canSpeak}
          references={references}
          onFinished={(id) => {
            const next = markFinished(id);
            if (next) setProgress(next);
          }}
          onExit={() => setView({ name: "shelf" })}
        />
      )}

      {breakDue && (
        <Dialog
          title="Time for a little break?"
          description="Your grown-up asked for a reminder. Stretch, have some water, or tell someone your favourite part of the story."
          onClose={() => {
            setBreakDue(false);
            setBreakRound((r) => r + 1);
          }}
        >
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonPrimary}
              data-autofocus
              onClick={() => {
                output.stop();
                setBreakDue(false);
                setView({ name: "shelf" });
              }}
            >
              Stop for now
            </button>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => {
                setBreakDue(false);
                setBreakRound((r) => r + 1);
              }}
            >
              Keep going a little longer
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
