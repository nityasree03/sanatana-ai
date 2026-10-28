import Link from "next/link";
import { SaveLeafButton } from "@/components/journey/SaveLeafButton";
import { getCompanion } from "@/lib/companions";
import { STATUS_TEXT, type Passage, type SourceInfo } from "@/lib/scripture/types";

/**
 * One scripture passage on a palm-leaf card: original text (when we have it), transliteration,
 * English translation and full provenance. Works in both server and client components.
 */
export function VerseCard({
  passage,
  sources,
  href,
  matchedBy,
  saveHref,
}: {
  passage: Passage;
  sources: Record<string, SourceInfo>;
  /** Link to the passage in its chapter; omit on the chapter page itself. */
  href?: string;
  matchedBy?: ("keyword" | "meaning")[];
  /** Where a Wisdom Tree leaf should link back to; shows "Save to Wisdom Tree" when given. */
  saveHref?: string;
}) {
  const tr = sources[passage.translation.source_id];
  const orig = passage.original ? sources[passage.original.source_id] : undefined;
  return (
    <article
      id={passage.id}
      aria-labelledby={`${passage.id}-ref`}
      className="palm-leaf scroll-mt-24 px-5 py-4"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${passage.id}-ref`} className="font-sans text-sm font-semibold tracking-wide">
          {href ? (
            <Link href={href} className="underline decoration-dotted underline-offset-4">
              {passage.reference}
            </Link>
          ) : (
            passage.reference
          )}
        </h3>
        <span className="text-xs">Verified scripture</span>
      </header>
      {saveHref && (
        <p className="mt-1">
          <SaveLeafButton
            passage={{
              id: passage.id,
              reference: passage.reference,
              translator: passage.translation.translator,
              text: passage.translation.text,
              href: saveHref,
            }}
            source="explorer"
          />
        </p>
      )}

      {passage.original && (
        <div className="mt-3" lang="sa">
          <p className="font-sanskrit text-lg leading-8 whitespace-pre-line">
            {passage.original.text}
          </p>
          {passage.transliteration && (
            <p lang="sa-Latn" className="mt-1 text-sm italic whitespace-pre-line opacity-90">
              {passage.transliteration.text}
            </p>
          )}
        </div>
      )}

      <p lang="en" className="mt-3 leading-7 whitespace-pre-line text-ink">
        {passage.translation.text}
      </p>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer select-none">Source and licence</summary>
        <dl className="mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold">Translation</dt>
          <dd>
            {passage.translation.translator}, {tr?.edition}
          </dd>
          {passage.original && (
            <>
              <dt className="font-semibold">Original</dt>
              <dd>
                {passage.original.language} ({passage.original.script}) — {orig?.title}
              </dd>
            </>
          )}
          {passage.transliteration && (
            <>
              <dt className="font-semibold">Transliteration</dt>
              <dd>
                {passage.transliteration.scheme}: {passage.transliteration.method}
              </dd>
            </>
          )}
          <dt className="font-semibold">Licence</dt>
          <dd>
            {tr?.license}. {tr?.rightsNote}
          </dd>
          <dt className="font-semibold">Verification</dt>
          <dd>{STATUS_TEXT[passage.verification_status]}</dd>
          {passage.notes.length > 0 && (
            <>
              <dt className="font-semibold">Notes</dt>
              <dd>
                <ul className="list-disc pl-4">
                  {passage.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          <dt className="font-semibold">Link</dt>
          <dd>
            <a href={tr?.url} className="underline" rel="noopener noreferrer">
              View the source
            </a>
            {tr?.scanUrl && tr.scanUrl !== tr.url && (
              <>
                {" · "}
                <a href={tr.scanUrl} className="underline" rel="noopener noreferrer">
                  Original scan
                </a>
              </>
            )}
          </dd>
        </dl>
      </details>

      <footer className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {passage.companions.map((c) => (
          <span
            key={c}
            data-companion={c}
            className="rounded-full bg-accent-soft px-2 py-0.5 text-accent"
          >
            {getCompanion(c).name}
          </span>
        ))}
        {matchedBy && <span className="ml-auto">Found by {matchedBy.join(" and ")}</span>}
      </footer>
    </article>
  );
}
