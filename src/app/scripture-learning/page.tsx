import type { Metadata } from "next";
import Link from "next/link";
import { COMPANIONS } from "@/lib/companions";
import { LESSONS } from "@/lib/learning/lessons";
import { getRoute } from "@/lib/routes";

const route = getRoute("/scripture-learning");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ScriptureLearningPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Scripture Learning Studio</h1>
        <p className="mt-2 text-muted">
          Short lessons built on verses from the library. Read each verse (in Sanskrit where we have
          it), listen to it, learn a few key words, then answer three questions. Every answer points
          to the line of the verse that supports it.
        </p>
      </header>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {COMPANIONS.map((c) => (
          <section key={c.id} aria-labelledby={`lessons-${c.id}`}>
            <h2 id={`lessons-${c.id}`} className="font-display text-2xl">
              With {c.name}
            </h2>
            <ul className="mt-2 space-y-3">
              {LESSONS.filter((l) => l.companion === c.id).map((l) => (
                <li key={l.id} className="rounded-2xl border border-line bg-card p-4">
                  <Link
                    href={`/scripture-learning/${l.id}`}
                    className="font-semibold underline decoration-dotted underline-offset-4"
                  >
                    {l.title}
                  </Link>
                  <p className="mt-1 text-sm">{l.summary}</p>
                  <p className="mt-1 text-xs text-muted">
                    {l.passages.length} verses · {l.questions.length} questions
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
