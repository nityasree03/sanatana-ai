import Link from "next/link";
import type { Companion } from "@/lib/companions";
import { ArchAvatar } from "./ArchAvatar";

/** A companion profile card with a link that opens the chat with them. */
export function CompanionCard({ companion }: { companion: Companion }) {
  return (
    <article
      data-companion={companion.id}
      aria-labelledby={`companion-${companion.id}`}
      className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6"
    >
      <ArchAvatar companionId={companion.id} size="sm" showState={false} />
      <div className="text-center">
        <h3 id={`companion-${companion.id}`} className="sr-only">
          {companion.name}
        </h3>
        <p className="text-accent">{companion.epithet}</p>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Voice</dt>
          <dd className="text-muted">{companion.voice}</dd>
        </div>
        <div>
          <dt className="font-semibold">Explores</dt>
          <dd>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {companion.themes.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent"
                >
                  {t}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Prefers sources from</dt>
          <dd className="palm-leaf mt-1 px-3 py-2 text-xs">
            {companion.sourcePreferences.join(" · ")}
          </dd>
        </div>
      </dl>
      <Link
        href={`/chat?companion=${companion.id}`}
        className="mt-auto rounded-full bg-accent px-4 py-2.5 text-center text-sm font-medium text-on-accent hover:opacity-90"
      >
        Chat with {companion.name}
      </Link>
    </article>
  );
}
