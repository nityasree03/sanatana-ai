import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListenButton } from "@/components/learning/ListenButton";
import { LessonQuiz, type References } from "@/components/learning/LessonQuiz";
import { VerseCard } from "@/components/scripture/VerseCard";
import { getCompanion } from "@/lib/companions";
import { LESSONS, getLesson } from "@/lib/learning/lessons";
import { getPassage, sourcesById } from "@/lib/scripture/data";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lesson: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lesson: string }>;
}): Promise<Metadata> {
  const lesson = getLesson((await params).lesson);
  return { title: lesson ? `${lesson.title} · Learning Studio` : "Learning Studio" };
}

export default async function LessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const lesson = getLesson((await params).lesson);
  if (!lesson) notFound();
  const companion = getCompanion(lesson.companion);
  const passages = lesson.passages.map((id) => getPassage(id)!);
  const sources = sourcesById();
  const refs: References = Object.fromEntries(passages.map((p) => [p.id, p.reference]));
  const i = LESSONS.indexOf(lesson);
  const prev = LESSONS[i - 1];
  const next = LESSONS[i + 1];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <p className="text-sm">
        <Link href="/scripture-learning" className="underline">
          Learning Studio
        </Link>{" "}
        · With {companion.name}
      </p>
      <h1 className="mt-1 font-display text-4xl">{lesson.title}</h1>
      <p className="mt-2">
        {lesson.summary} <span className="text-muted">(our summary)</span>
      </p>

      <section aria-labelledby="terms" className="mt-6 rounded-2xl border border-line bg-card p-4">
        <h2 id="terms" className="font-display text-2xl">
          Key words
        </h2>
        <p className="text-xs text-muted">Short meanings in our own words, not scripture.</p>
        <dl className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
          {lesson.terms.map((t) => (
            <div key={t.term} className="contents">
              <dt className="font-semibold">
                <span lang={t.devanagari ? "sa-Latn" : undefined}>{t.term}</span>
                {t.devanagari && (
                  <span lang="sa" className="font-sanskrit ms-2 font-normal">
                    {t.devanagari}
                  </span>
                )}
              </dt>
              <dd>{t.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="verses" className="mt-8">
        <h2 id="verses" className="font-display text-2xl">
          The verses
        </h2>
        <ol className="mt-3 space-y-4">
          {passages.map((p) => (
            <li key={p.id}>
              <VerseCard passage={p} sources={sources} />
              <p className="mt-2">
                <ListenButton text={p.translation.text} name={`${p.reference} in English`} />
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted">
          Listen uses your device&apos;s own voice; pronunciation is approximate.
        </p>
      </section>

      <section aria-labelledby="questions" className="mt-8">
        <h2 id="questions" className="font-display text-2xl">
          Check your understanding
        </h2>
        <div className="mt-3">
          <LessonQuiz questions={lesson.questions} refs={refs} />
        </div>
      </section>

      <nav aria-label="Lessons" className="mt-10 flex flex-wrap justify-between gap-3 text-sm">
        {prev ? (
          <Link href={`/scripture-learning/${prev.id}`} className="underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/scripture-learning/${next.id}`} className="underline">
            {next.title} →
          </Link>
        )}
      </nav>
    </div>
  );
}
