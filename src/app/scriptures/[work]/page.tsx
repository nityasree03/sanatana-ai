import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanion } from "@/lib/companions";
import { WORKS, getWork, sectionHref } from "@/lib/scripture/data";

export function generateStaticParams() {
  return WORKS.map((w) => ({ work: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ work: string }>;
}): Promise<Metadata> {
  const work = getWork((await params).work);
  return { title: work?.title ?? "Scripture" };
}

export default async function WorkPage({ params }: { params: Promise<{ work: string }> }) {
  const work = getWork((await params).work);
  if (!work) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12" data-companion={work.companions[0]}>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/scriptures" className="underline">
          Scripture Explorer
        </Link>{" "}
        / {work.title}
      </nav>
      <header>
        <h1 className="text-4xl sm:text-5xl">{work.title}</h1>
        <p className="mt-3 text-lg text-muted">{work.description}</p>
        <p className="mt-3 flex flex-wrap gap-2 text-sm">
          {work.companions.map((c) => (
            <span
              key={c}
              data-companion={c}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-accent"
            >
              {getCompanion(c).name}
            </span>
          ))}
        </p>
      </header>

      <section aria-labelledby="sources-heading" className="space-y-3">
        <h2 id="sources-heading" className="text-2xl">
          Sources and rights
        </h2>
        {work.sources.map((s) => (
          <div key={s.id} className="palm-leaf px-5 py-3 text-sm">
            <p className="font-semibold">{s.title}</p>
            <p>
              {s.edition}. Language: {s.language}.
            </p>
            <p>
              <strong>{s.license}.</strong> {s.rightsNote}
            </p>
            <p>
              <a href={s.url} className="underline" rel="noopener noreferrer">
                View the source
              </a>
              {s.scanUrl && s.scanUrl !== s.url && (
                <>
                  {" · "}
                  <a href={s.scanUrl} className="underline" rel="noopener noreferrer">
                    Original scan
                  </a>
                </>
              )}
            </p>
          </div>
        ))}
      </section>

      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="text-2xl">
          Contents
        </h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {work.sections.map((s, i) => (
            <li key={s}>
              <Link
                href={sectionHref(work.id, i + 1)}
                className="block rounded-xl border border-line bg-card px-4 py-2.5 hover:border-accent"
              >
                {s}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
