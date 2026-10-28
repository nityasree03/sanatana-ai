"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArchAvatar } from "@/components/ArchAvatar";
import { ThreadPassage } from "@/components/chat/ThreadPassage";
import type { LinkedPassage } from "@/lib/chat/answer";
import { getCompanion } from "@/lib/companions";
import { getMoment, type LeelaScene } from "@/lib/leela/scenes";

/**
 * Plays one Living Leela scene. The person chooses what to explore next; the story itself is
 * fixed by the text. Progress lives only in this page (nothing is saved or sent anywhere).
 */
export function LeelaPlayer({
  scene,
  passages,
}: {
  scene: LeelaScene;
  passages: Record<string, LinkedPassage>;
}) {
  const companion = getCompanion(scene.companion);
  const [path, setPath] = useState<string[]>([scene.start]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const moment = getMoment(scene, path.at(-1)!)!;
  const isEnd = moment.choices.length === 0;

  // Move focus to the new moment so keyboard and screen-reader users follow the story.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [path]);

  const askHref = `/chat?companion=${companion.id}&ask=${encodeURIComponent(moment.ask)}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10" data-companion={companion.id}>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/living-leela" className="underline">
          Living Leela
        </Link>{" "}
        / {scene.title}
      </nav>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0 self-center sm:self-start">
          <ArchAvatar companionId={companion.id} size="sm" showState={false} animated />
        </div>
        <div>
          <h1 className="font-display text-4xl">{scene.title}</h1>
          <p className="mt-1 text-lg text-muted">{scene.subtitle}</p>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Source:</span> {scene.source}
          </p>
          {scene.note && <p className="mt-1 text-sm text-muted">{scene.note}</p>}
          <p className="mt-3">{scene.intro}</p>
          <p className="mt-2 text-xs text-muted">
            Your choices change what you explore, never the story. The retellings are short
            summaries written by the site (not AI, not scripture); the verified passages beside them
            are the source.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Your path through the scene" className="order-2 lg:order-1">
          <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">Your path</h2>
          <ol className="mt-2 space-y-1 text-sm">
            {path.map((id, i) => {
              const m = getMoment(scene, id)!;
              const current = i === path.length - 1;
              return (
                <li key={`${id}-${i}`} aria-current={current ? "step" : undefined}>
                  <span className={current ? "font-semibold text-accent" : "text-muted"}>
                    {i + 1}. {m.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <section aria-labelledby="leela-moment" className="order-1 lg:order-2">
          <article className="rounded-2xl border border-line bg-card p-5">
            {moment.detour && (
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                A closer look
              </p>
            )}
            <h2
              id="leela-moment"
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-20 font-display text-3xl focus:outline-none"
            >
              {moment.title}
            </h2>
            <p className="mt-3 text-xs font-semibold text-muted">
              Retelling (our summary, not scripture)
            </p>
            <p className="mt-1 text-lg">{moment.retelling}</p>

            <h3 className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">
              The verified passages behind this moment
            </h3>
            <ul className="mt-2 space-y-2">
              {moment.passages.map((id) => (
                <ThreadPassage
                  key={id}
                  passage={passages[id]}
                  save={{ source: "leela", companion: companion.id }}
                />
              ))}
            </ul>

            <p className="mt-4">
              <Link
                href={askHref}
                className="inline-block rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
              >
                Ask {companion.name} about this moment
                <span className="sr-only"> (opens the chat with a question you can edit)</span>
              </Link>
            </p>
          </article>

          <div className="mt-5">
            {isEnd ? (
              <div className="rounded-2xl border border-dashed border-line p-5">
                <h3 className="font-display text-2xl">The end of this scene</h3>
                <p className="mt-1 text-sm text-muted">
                  You explored {path.length} moments. The story continues in the text itself.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={scene.readMore.href}
                    className="rounded-full bg-accent px-4 py-2 text-sm text-on-accent hover:opacity-90"
                  >
                    {scene.readMore.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPath([scene.start])}
                    className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
                  >
                    Start again
                  </button>
                  <Link
                    href="/living-leela"
                    className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
                  >
                    Choose another scene
                  </Link>
                </div>
              </div>
            ) : (
              <fieldset>
                <legend className="font-semibold">What would you like to explore next?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {moment.choices.map((c) => (
                    <button
                      key={c.to}
                      type="button"
                      onClick={() => setPath((p) => [...p, c.to])}
                      className="rounded-full bg-accent px-4 py-2 text-sm text-on-accent hover:opacity-90"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
