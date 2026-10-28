import Link from "next/link";
import type { LinkedPassage } from "@/app/api/chat/route";

const PREVIEW_CHARS = 420;

/**
 * One verified passage in the chat's "wisdom thread". The text shown is the library's own
 * (never the AI's words), with its reference, translator and a link to read it in context.
 */
export function ThreadPassage({ passage, how }: { passage: LinkedPassage; how?: string }) {
  const text = passage.translation.text;
  const preview =
    text.length > PREVIEW_CHARS ? `${text.slice(0, text.lastIndexOf(" ", PREVIEW_CHARS))} …` : text;
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
          Verified scripture · {passage.translation.translator}
        </span>
      </p>
      {passage.original?.script === "Devanagari" && (
        <p lang="sa" className="mt-1.5 font-sanskrit whitespace-pre-line">
          {passage.original.text.split("\n").slice(0, 2).join("\n")}
        </p>
      )}
      <p className="mt-1.5 whitespace-pre-line">{preview}</p>
      {how && <p className="mt-1.5 text-xs text-muted italic">Why it&apos;s here (AI): {how}</p>}
    </li>
  );
}
