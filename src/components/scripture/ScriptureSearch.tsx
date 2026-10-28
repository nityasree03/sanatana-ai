"use client";

import { useId, useState, type FormEvent } from "react";
import { COMPANIONS } from "@/lib/companions";
import type { SearchHit, SourceInfo } from "@/lib/scripture/types";
import { VerseCard } from "./VerseCard";

type Status = { kind: "idle" | "model" | "searching" | "done" | "error"; message?: string };

export function ScriptureSearch({
  works,
  sources,
  sectionLinks,
}: {
  works: { id: string; title: string }[];
  sources: Record<string, SourceInfo>;
  /** passage work + section -> chapter page URL */
  sectionLinks: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [workId, setWorkId] = useState("");
  const [companion, setCompanion] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [usedMeaning, setUsedMeaning] = useState(false);
  const qId = useId();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setStatus({ kind: "error", message: "Type at least 2 characters." });
      return;
    }
    setStatus({ kind: "searching", message: "Searching…" });
    try {
      const res = await fetch("/api/scripture/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          workId: workId || undefined,
          companion: companion || undefined,
          limit: 12,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setHits(data.hits);
      setUsedMeaning(data.usedMeaning);
      setStatus({
        kind: "done",
        message: data.hits.length
          ? `${data.hits.length} passages found.`
          : "No passages found. Try other words.",
      });
    } catch (err) {
      setHits([]);
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Search failed." });
    }
  }

  return (
    <section
      aria-labelledby="search-heading"
      className="rounded-3xl border border-line bg-card p-5"
    >
      <h2 id="search-heading" className="text-2xl">
        Search the scriptures
      </h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3" role="search">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor={qId} className="sr-only">
            Search words or a question
          </label>
          <input
            id={qId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: acting without fear of failure"
            maxLength={300}
            className="h-11 flex-1 rounded-full border border-line bg-paper px-4"
          />
          <button
            type="submit"
            className="h-11 rounded-full bg-accent px-6 font-medium text-on-accent"
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Text
            <select
              aria-label="Filter by text"
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
              className="rounded-md border border-line bg-paper px-2 py-1"
            >
              <option value="">All texts</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Companion
            <select
              aria-label="Filter by companion"
              value={companion}
              onChange={(e) => setCompanion(e.target.value)}
              className="rounded-md border border-line bg-paper px-2 py-1"
            >
              <option value="">Any</option>
              {COMPANIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted">
          Search runs on our server and matches both words and meaning (with a small open-source
          language model hosted by this site). Your search words are not stored.
        </p>
      </form>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {status.message}
        {status.kind === "done" &&
          hits.length > 0 &&
          (usedMeaning ? " Using keywords and meaning." : " Using keywords.")}
      </p>

      {hits.length > 0 && (
        <ol className="mt-4 space-y-4">
          {hits.map((h) => (
            <li key={h.passage.id}>
              <VerseCard
                passage={h.passage}
                sources={sources}
                matchedBy={h.matchedBy}
                href={`${sectionLinks[`${h.passage.work_id}|${h.passage.section}`] ?? "/scriptures"}#${h.passage.id}`}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
