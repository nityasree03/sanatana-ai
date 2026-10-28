import Link from "next/link";
import type { LinkedPassage } from "@/lib/chat/answer";
import type { CompanionId } from "@/lib/companions";
import type { Leaf } from "@/lib/journey/schema";
import { SaveLeafButton } from "@/components/journey/SaveLeafButton";

const PREVIEW_CHARS = 420;

/**
 * One verified passage in a "wisdom thread", shown through the Scripture Truth Lens:
 *  1. Verified scripture — the library's own text (never the AI's words), with reference,
 *     translator and a link to read it in context;
 *  2. AI interpretation — why the AI connected this passage to the question;
 *  3. AI-suggested reflection — a practical idea inspired by it, clearly not scripture.
 * Passages without AI layers (e.g. "related passages") show only the first layer.
 */
export function ThreadPassage({
  passage,
  how,
  reflection,
  save,
}: {
  passage: LinkedPassage;
  how?: string;
  reflection?: string;
  /** Show "Save to Wisdom Tree" (where the passage was found, and with which companion). */
  save?: { source: Leaf["source"]; companion?: CompanionId };
}) {
  const text = passage.translation.text;
  const preview =
    text.length > PREVIEW_CHARS ? `${text.slice(0, text.lastIndexOf(" ", PREVIEW_CHARS))} …` : text;
  const hasLens = Boolean(how || reflection);
  return (
    <li className="palm-leaf relative py-3 pr-3 pl-6 text-sm">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Link
          href={passage.href}
          className="font-semibold underline decoration-dotted underline-offset-4"
        >
          {passage.reference}
        </Link>
        <span className="text-xs text-leaf-ink">
          <span aria-hidden="true">📜 </span>Verified scripture · {passage.translation.translator}
        </span>
      </p>
      {passage.original?.script === "Devanagari" && (
        <p lang="sa" className="mt-1.5 font-sanskrit whitespace-pre-line">
          {passage.original.text.split("\n").slice(0, 2).join("\n")}
        </p>
      )}
      <p className="mt-1.5 whitespace-pre-line">{preview}</p>
      {save && (
        <p className="mt-1.5">
          <SaveLeafButton
            passage={{
              id: passage.id,
              reference: passage.reference,
              translator: passage.translation.translator,
              text: passage.translation.text,
              href: passage.href,
            }}
            source={save.source}
            companion={save.companion}
          />
        </p>
      )}
      {hasLens && (
        <dl className="mt-2.5 space-y-1.5 border-t border-dashed border-leaf-ink/40 pt-2 text-xs">
          {how && (
            <div>
              <dt className="inline font-semibold">
                <span aria-hidden="true">💭 </span>AI interpretation:
              </dt>{" "}
              <dd className="inline">{how}</dd>
            </div>
          )}
          {reflection && (
            <div>
              <dt className="inline font-semibold">
                <span aria-hidden="true">🌱 </span>AI-suggested reflection:
              </dt>{" "}
              <dd className="inline">{reflection}</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  );
}
