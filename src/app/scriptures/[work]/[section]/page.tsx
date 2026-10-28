import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerseCard } from "@/components/scripture/VerseCard";
import { WORKS, getSectionPassages, getWork, sectionHref, sourcesById } from "@/lib/scripture/data";

type Params = Promise<{ work: string; section: string }>;

/**
 * Prerender every chapter of shorter texts, and the first chapters of long ones (the complete
 * Ramayana alone has 653 sections). Other chapters render on first request from the same JSON,
 * which is fast, and src/proxy.ts already turns unknown chapters into 404s.
 */
const PRERENDER_LIMIT = 40;

export function generateStaticParams() {
  return WORKS.flatMap((w) =>
    w.sections.slice(0, PRERENDER_LIMIT).map((_, i) => ({ work: w.id, section: String(i + 1) })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { work: workId, section } = await params;
  const work = getWork(workId);
  const title = work?.sections[Number(section) - 1];
  return { title: work && title ? `${work.title} — ${title}` : "Scripture" };
}

export default async function SectionPage({ params }: { params: Params }) {
  const { work: workId, section } = await params;
  const index = Number(section);
  const work = getWork(workId);
  const passages = work ? getSectionPassages(workId, index) : [];
  if (!work || !Number.isInteger(index) || passages.length === 0) notFound();
  const sources = sourcesById();
  const prev = index > 1 ? index - 1 : null;
  const next = index < work.sections.length ? index + 1 : null;
  const pager = (
    <nav aria-label="Chapters" className="flex justify-between gap-4 text-sm">
      {prev ? (
        <Link href={sectionHref(work.id, prev)} className="underline">
          ← {work.sections[prev - 1]}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={sectionHref(work.id, next)} className="text-right underline">
          {work.sections[next - 1]} →
        </Link>
      )}
    </nav>
  );
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12" data-companion={work.companions[0]}>
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/scriptures" className="underline">
          Scripture Explorer
        </Link>{" "}
        /{" "}
        <Link href={`/scriptures/${work.id}`} className="underline">
          {work.title}
        </Link>
      </nav>
      <header>
        <h1 className="text-3xl sm:text-4xl">{work.sections[index - 1]}</h1>
        <p className="mt-2 text-muted">
          {work.title} · {passages.length} passages
        </p>
      </header>
      {pager}
      <div className="space-y-4">
        {passages.map((p) => (
          <VerseCard
            key={p.id}
            passage={p}
            sources={sources}
            saveHref={`${sectionHref(work.id, index)}#${p.id}`}
          />
        ))}
      </div>
      {pager}
    </div>
  );
}
