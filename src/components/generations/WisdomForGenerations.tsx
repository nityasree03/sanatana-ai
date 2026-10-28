"use client";

import { useId, useState } from "react";
import { ListenButton } from "@/components/learning/ListenButton";
import { VerseCard } from "@/components/scripture/VerseCard";
import { getCompanion } from "@/lib/companions";
import { LEVELS, LEVEL_LABEL, TOPICS, type Level } from "@/lib/generations/topics";
import type { Passage, SourceInfo } from "@/lib/scripture/types";

/**
 * Caregiver-operated family learning: one teaching, explained at three levels. Everything is
 * fixed, reviewed text from this site; nothing is sent anywhere or saved.
 */
export function WisdomForGenerations({
  passages,
  hrefs,
  sources,
}: {
  passages: Record<string, Passage>;
  hrefs: Record<string, string>;
  sources: Record<string, SourceInfo>;
}) {
  const [level, setLevel] = useState<Level>("child");
  const [topicId, setTopicId] = useState(TOPICS[0].id);
  const topic = TOPICS.find((t) => t.id === topicId)!;
  const companion = getCompanion(topic.companion);
  const name = useId();
  const key = passages[topic.key.passage];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Wisdom for Generations</h1>
        <p className="mt-2 text-muted">
          One teaching, explained for a child, a teen and an adult, so a family can talk about it
          together. Each starts from a verse in the library; the explanations are our own words.
          Nothing here uses AI, and nothing is saved or sent anywhere.
        </p>
      </header>

      <fieldset className="mt-6">
        <legend className="font-semibold">Explain it for</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <label
              key={l}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 ${
                level === l ? "border-accent bg-accent-soft" : "border-line"
              }`}
            >
              <input type="radio" name={name} checked={level === l} onChange={() => setLevel(l)} />
              {LEVEL_LABEL[l]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-6 md:grid-cols-[16rem_1fr]">
        <nav aria-label="Teachings">
          <ul className="space-y-1">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={t.id === topicId ? "true" : undefined}
                  onClick={() => setTopicId(t.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    t.id === topicId ? "bg-accent-soft font-semibold" : "hover:bg-card"
                  }`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article aria-labelledby="topic-title" data-companion={companion.id} className="min-w-0">
          <p className="text-sm text-muted">From {companion.name}&apos;s texts</p>
          <h2 id="topic-title" className="font-display text-3xl">
            {topic.title}
          </h2>
          <blockquote className="mt-3 border-s-4 border-accent ps-4 text-xl italic">
            “{topic.key.quote}”
            <footer className="mt-1 text-sm not-italic text-muted">{key.reference}</footer>
          </blockquote>

          <section
            aria-labelledby="explain"
            className="mt-5 rounded-2xl border border-line bg-card p-4"
          >
            <h3 id="explain" className="text-xs font-semibold tracking-wide text-muted uppercase">
              {LEVEL_LABEL[level]} · our explanation
            </h3>
            <p className={`mt-2 leading-relaxed ${level === "child" ? "text-2xl" : "text-lg"}`}>
              {topic.explain[level]}
            </p>
            <p className="mt-3">
              <ListenButton text={topic.explain[level]} name={`the ${level} explanation`} />
            </p>
          </section>

          <section aria-labelledby="talk" className="mt-4 rounded-2xl bg-accent-soft p-4">
            <h3 id="talk" className="font-semibold">
              Talk about it together
            </h3>
            <p className="mt-1 text-lg">{topic.talk[level]}</p>
          </section>

          <section aria-labelledby="verses" className="mt-6">
            <h3 id="verses" className="font-display text-2xl">
              The {topic.passages.length === 1 ? "verse" : "verses"}
            </h3>
            <div className="mt-2 space-y-3">
              {topic.passages.map((id) => (
                <VerseCard key={id} passage={passages[id]} sources={sources} href={hrefs[id]} />
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
