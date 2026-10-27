import type { Metadata } from "next";
import Link from "next/link";
import { ScriptureSearch } from "@/components/scripture/ScriptureSearch";
import { getCompanion } from "@/lib/companions";
import { getRoute } from "@/lib/routes";
import { MANIFEST, WORKS, sectionLinks, sourcesById } from "@/lib/scripture/data";

const route = getRoute("/scriptures");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ScripturesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <header>
        <h1 className="text-4xl sm:text-5xl">{route.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          {MANIFEST.passageCount.toLocaleString("en")} passages from public-domain translations,
          each with its translator, edition, licence and verification status.
        </p>
      </header>

      <ScriptureSearch
        works={WORKS.map((w) => ({ id: w.id, title: w.title }))}
        sources={sourcesById()}
        sectionLinks={sectionLinks()}
      />

      <section aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="text-3xl">
          Browse the texts
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {WORKS.map((w) => (
            <li key={w.id} data-companion={w.companions[0]}>
              <Link
                href={`/scriptures/${w.id}`}
                className="block h-full rounded-2xl border border-line bg-card p-5 hover:border-accent"
              >
                <span className="font-display text-2xl font-semibold">{w.title}</span>
                <span className="mt-1 block text-sm text-muted">{w.description}</span>
                <span className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-line px-2 py-0.5">
                    {w.passageCount} passages
                  </span>
                  {w.companions.map((c) => (
                    <span
                      key={c}
                      data-companion={c}
                      className="rounded-full bg-accent-soft px-2 py-0.5 text-accent"
                    >
                      {getCompanion(c).name}
                    </span>
                  ))}
                </span>
                <span className="mt-2 block text-xs text-muted">
                  Translation:{" "}
                  {w.sources
                    .filter((s) => s.language === "English")
                    .map((s) => `${s.translator} (${s.year})`)
                    .join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted">
        Scripture data version {MANIFEST.dataVersion}, built {MANIFEST.builtAt.slice(0, 10)}. Free
        to read does not mean free to reuse: only translations whose rights we could confirm are
        included. See the{" "}
        <Link href="/about#sources" className="underline">
          sources policy
        </Link>
        .
      </p>
    </div>
  );
}
