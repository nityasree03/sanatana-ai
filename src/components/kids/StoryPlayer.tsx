"use client";

import { useEffect, useRef, useState } from "react";
import { ArchAvatar } from "@/components/ArchAvatar";
import { getCompanion } from "@/lib/companions";
import type { KidsSettings } from "@/lib/kids/settings";
import { storySteps, type Step } from "@/lib/kids/stories";
import type { Story } from "@/lib/kids/types";
import type { SpeechOutputAdapter } from "@/lib/speech/types";
import { ActivityView } from "./Activities";
import { StoryArt } from "./art/StoryArt";

const control =
  "inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-line bg-card px-5 text-lg font-semibold hover:border-accent disabled:opacity-40";

function stepText(step: Step, story: Story, settings: KidsSettings): string {
  if (step.kind === "scene") return step.scene.text[settings.age];
  if (step.kind === "activity") return step.activity.prompt;
  return `The end. ${story.takeaway[settings.age]}`;
}

export function StoryPlayer({
  story,
  settings,
  output,
  canSpeak,
  references,
  onFinished,
  onExit,
}: {
  story: Story;
  settings: KidsSettings;
  output: SpeechOutputAdapter;
  canSpeak: boolean;
  /** Passage id → reference text, e.g. "Vishnu Purana 5.10, passage 3". */
  references: Record<string, string>;
  onFinished: (storyId: string) => void;
  onExit: () => void;
}) {
  const companion = getCompanion(story.companion);
  const steps = storySteps(story, settings.age, settings.activities);
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  /** Once the grown-up presses Play, each new page is read aloud automatically. */
  const [reading, setReading] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const step = steps[index];
  const narrate = settings.narration && canSpeak;

  function speak(i: number) {
    output.speak(stepText(steps[i], story, settings), {
      lang: "en-IN",
      rate: settings.rate,
      pitch: 1,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    setSpeaking(true);
  }

  function stop() {
    output.stop();
    setSpeaking(false);
  }

  function go(i: number) {
    stop();
    setIndex(i);
    if (reading && narrate) speak(i);
  }

  useEffect(() => {
    if (steps[index].kind === "end") onFinished(story.id);
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    // Only page changes matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => () => output.stop(), [output]);

  const pageName =
    step.kind === "scene" ? step.scene.label : step.kind === "activity" ? "Your turn" : "The end";

  return (
    <div data-companion={companion.id}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => (stop(), onExit())} className="text-base underline">
          ← All stories
        </button>
        <p className="text-sm text-muted">
          Page {index + 1} of {steps.length}
        </p>
      </div>
      <h1 className="mt-2 font-display text-4xl">{story.title}</h1>

      <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr]">
        <div className="flex flex-row items-center gap-3 md:flex-col md:items-center">
          <ArchAvatar
            portraitSet="child"
            companionId={companion.id}
            size="sm"
            state={speaking ? "speaking" : "idle"}
            showState={false}
            caption={false}
            animated={speaking}
          />
          <p className="max-w-36 text-center text-sm">
            <span className="font-semibold">{companion.name}</span> tells the story
            <span className="block text-xs text-muted">An AI-made character, not the deity</span>
          </p>
        </div>

        <section aria-labelledby="kids-page" className="min-w-0">
          <h2 id="kids-page" ref={headingRef} tabIndex={-1} className="sr-only">
            Page {index + 1}: {pageName}
          </h2>

          {step.kind === "scene" && (
            <>
              <StoryArt
                id={step.scene.art}
                alt={step.scene.alt}
                className="h-auto w-full rounded-2xl border border-line"
              />
              <p className="mt-4 text-2xl leading-relaxed">{step.scene.text[settings.age]}</p>
              {settings.age === "10-12" && (
                <figure className="palm-leaf mt-3 px-4 py-2 text-base">
                  <blockquote>“{step.scene.verse.quote}”</blockquote>
                  <figcaption className="mt-1 text-xs">
                    From the text: {references[step.scene.verse.passage]}
                  </figcaption>
                </figure>
              )}
            </>
          )}

          {step.kind === "activity" && (
            <div className="rounded-2xl border-2 border-dashed border-accent p-4">
              <p className="text-sm font-semibold tracking-wide text-accent uppercase">Your turn</p>
              <p className="mt-1 mb-4 text-2xl font-semibold">{step.activity.prompt}</p>
              <ActivityView
                key={step.activity.id}
                activity={step.activity}
                scenes={story.scenes}
                onDone={() => setDone((d) => [...d, step.activity.id])}
              />
            </div>
          )}

          {step.kind === "end" && (
            <div className="rounded-2xl bg-accent-soft p-5">
              <p className="font-display text-3xl">The end</p>
              <p className="mt-2 text-2xl leading-relaxed">{story.takeaway[settings.age]}</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={control}
              disabled={index === 0}
              onClick={() => go(index - 1)}
            >
              <span aria-hidden="true">◀</span> Back
            </button>
            {narrate &&
              (speaking ? (
                <button
                  type="button"
                  className={control}
                  onClick={() => {
                    stop();
                    setReading(false);
                  }}
                >
                  <span aria-hidden="true">❚❚</span> Pause
                </button>
              ) : (
                <button
                  type="button"
                  className={control}
                  onClick={() => {
                    setReading(true);
                    speak(index);
                  }}
                >
                  <span aria-hidden="true">▶</span> {reading ? "Read this page again" : "Play"}
                </button>
              ))}
            {index < steps.length - 1 ? (
              <button
                type="button"
                className={`${control} border-accent`}
                onClick={() => go(index + 1)}
              >
                {step.kind === "activity" && !done.includes(step.activity.id) ? "Skip" : "Next"}{" "}
                <span aria-hidden="true">▶</span>
              </button>
            ) : (
              <>
                <button type="button" className={control} onClick={() => go(0)}>
                  Read it again
                </button>
                <button
                  type="button"
                  className={`${control} border-accent`}
                  onClick={() => (stop(), onExit())}
                >
                  Choose another story
                </button>
              </>
            )}
          </div>
          {settings.narration && !canSpeak && (
            <p className="mt-2 text-sm text-muted">
              This device can&apos;t read aloud, so a grown-up can read the words instead.
            </p>
          )}
        </section>
      </div>

      {step.kind === "end" && (
        <details className="mt-8 rounded-2xl border border-line bg-card p-4">
          <summary className="cursor-pointer font-semibold">
            For grown-ups: what this story teaches
          </summary>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {story.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Source:</span> {story.source}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Our changes:</span> {story.adaptation}
          </p>
        </details>
      )}
    </div>
  );
}
