"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { PerspectiveResponse } from "@/app/api/dharma-lab/perspective/route";
import { SaveLeafButton } from "@/components/journey/SaveLeafButton";
import { buttonPrimary, buttonSecondary } from "@/components/ui/Dialog";
import { COMPANIONS, getCompanion, type CompanionId } from "@/lib/companions";
import type {
  Action,
  DecisionMap,
  DecisionOption,
  Perspective,
  PerspectiveCitation,
} from "@/lib/dharma/model";

function CitationCard({ c, companion }: { c: PerspectiveCitation; companion: CompanionId }) {
  return (
    <li className="palm-leaf relative py-3 pr-3 pl-6 text-sm">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Link
          href={c.href}
          className="font-semibold underline decoration-dotted underline-offset-4"
        >
          {c.reference}
        </Link>
        <span className="text-xs text-leaf-ink">
          <span aria-hidden="true">📜 </span>Verified scripture · {c.translator}
        </span>
      </p>
      <p className="mt-1.5 whitespace-pre-line">{c.excerpt}</p>
      <p className="mt-1.5">
        <SaveLeafButton
          passage={{
            id: c.passageId,
            reference: c.reference,
            translator: c.translator,
            text: c.excerpt,
            href: c.href,
          }}
          source="dharma-lab"
          companion={companion}
        />
      </p>
      {(c.how || c.reflection) && (
        <dl className="mt-2.5 space-y-1.5 border-t border-dashed border-leaf-ink/40 pt-2 text-xs">
          {c.how && (
            <div>
              <dt className="inline font-semibold">
                <span aria-hidden="true">💭 </span>AI interpretation:
              </dt>{" "}
              <dd className="inline">{c.how}</dd>
            </div>
          )}
          {c.reflection && (
            <div>
              <dt className="inline font-semibold">
                <span aria-hidden="true">🌱 </span>AI-suggested reflection:
              </dt>{" "}
              <dd className="inline">{c.reflection}</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  );
}

function PerspectiveCard({
  p,
  practice,
  onRemove,
}: {
  p: Perspective;
  practice: boolean;
  onRemove: () => void;
}) {
  const c = getCompanion(p.companion);
  return (
    <li data-companion={c.id} className="rounded-2xl border border-line bg-card p-4">
      <article aria-label={`${c.name}'s perspective`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold text-accent">{c.name}</span>{" "}
            <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
              AI interpretation{practice ? " · practice mode" : ""}
            </span>
            {!p.grounded && (
              <span className="ml-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                No passage directly addresses this: reflection only
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-muted underline"
            aria-label={`Remove ${c.name}'s perspective`}
          >
            Remove
          </button>
        </div>
        <p className="mt-2 whitespace-pre-wrap">{p.reply}</p>
        {p.citations.length > 0 && (
          <ul className="mt-3 space-y-2" aria-label={`Passages ${c.name} drew on`}>
            {p.citations.map((ct) => (
              <CitationCard key={ct.passageId} c={ct} companion={c.id} />
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

/** Ask one companion, or the whole Council, how they see the selected path. */
export function PerspectivesPanel({
  map,
  option,
  index,
  dispatch,
  aiStatus,
}: {
  map: DecisionMap;
  option: DecisionOption;
  index: number;
  dispatch: (a: Action) => void;
  aiStatus: { ai: string | null; practice: boolean } | null;
}) {
  const [who, setWho] = useState<CompanionId | "council">("krishna");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const name = useId();
  const whoLabel = who === "council" ? "the Divine Council" : getCompanion(who).name;

  async function ask() {
    if (!map.dilemma.trim()) return setMessage("Describe your decision first (step 1).");
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dharma-lab/perspective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma: map.dilemma,
          values: map.values || undefined,
          limits: map.limits || undefined,
          who,
          path: {
            title: option.title,
            summary: option.summary || undefined,
            upsides: option.points.filter((p) => p.kind === "up").map((p) => p.text),
            downsides: option.points.filter((p) => p.kind === "down").map((p) => p.text),
            unknowns: option.points.filter((p) => p.kind === "unknown").map((p) => p.text),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<PerspectiveResponse> & {
        error?: string;
      };
      if (!res.ok) return setMessage(data.error ?? "Something went wrong. Please try again.");
      if (data.mode === "crisis") return setMessage(data.crisisReply ?? null);
      const answers = (data.answers ?? []).filter((a) => a.mode === "ai" && a.reply);
      if (answers.length) {
        dispatch({
          type: "addPerspectives",
          optionId: option.id,
          perspectives: answers.map((a) => ({
            companion: a.companion,
            reply: a.reply!,
            grounded: Boolean(a.grounded),
            askedAt: new Date().toISOString(),
            citations: a.citations.map((c) => ({
              passageId: c.id,
              reference: c.passage.reference,
              translator: c.passage.translation.translator,
              excerpt: c.passage.translation.text.slice(0, 600),
              href: c.passage.href,
              how: c.how,
              reflection: c.reflection,
            })),
          })),
        });
      }
      setMessage(data.notice ?? (answers.length ? null : "No answer came back. Please try again."));
    } catch {
      setMessage("I couldn't reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="perspectives-title"
      className="rounded-2xl border border-line bg-card p-5"
    >
      <h2 id="perspectives-title" className="font-display text-2xl">
        4. Perspectives on path {index + 1}: {option.title}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Companions reflect on this path from their scriptures. They won&apos;t choose for you or
        predict how it turns out.
      </p>
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold">Whose perspective?</legend>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {COMPANIONS.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name={name}
                checked={who === c.id}
                onChange={() => setWho(c.id)}
              />
              {c.name}
            </label>
          ))}
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name={name}
              checked={who === "council"}
              onChange={() => setWho("council")}
            />
            All four (Divine Council)
          </label>
        </div>
      </fieldset>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={buttonPrimary}
          onClick={ask}
          disabled={busy || !aiStatus?.ai}
        >
          {busy ? "Asking…" : `Ask ${whoLabel} about this path`}
        </button>
        <span className="text-xs text-muted">
          {!aiStatus?.ai
            ? "The AI isn't connected on this site, so perspectives aren't available."
            : aiStatus.practice
              ? "Practice mode: placeholder answers."
              : `Sends your decision and this path to Google Gemini${who === "council" ? " (counts as 4 messages)" : ""}.`}
        </span>
      </div>
      {message && (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      )}
      {option.perspectives.length > 0 && (
        <ul className="mt-4 space-y-3">
          {option.perspectives.map((p) => (
            <PerspectiveCard
              key={p.id}
              p={p}
              practice={Boolean(aiStatus?.practice)}
              onRemove={() =>
                dispatch({ type: "removePerspective", optionId: option.id, perspectiveId: p.id })
              }
            />
          ))}
        </ul>
      )}
      <p className="mt-3">
        <button
          type="button"
          className={buttonSecondary}
          onClick={() =>
            document.getElementById(`path-${option.id}`)?.scrollIntoView?.({ behavior: "smooth" })
          }
        >
          Back to path {index + 1}
        </button>
      </p>
    </section>
  );
}
