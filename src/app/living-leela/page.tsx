import type { Metadata } from "next";
import Link from "next/link";
import { ArchAvatar } from "@/components/ArchAvatar";
import { getCompanion } from "@/lib/companions";
import { SCENES } from "@/lib/leela/scenes";
import { getRoute } from "@/lib/routes";

const route = getRoute("/living-leela");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function LivingLeelaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Living Leela</h1>
        <p className="mt-2 text-muted">
          Step into one story with each companion. At each moment you choose what to explore next: a
          closer look, or the next part of the story. Your choices change what you explore, never
          the story itself, and every moment shows the verified passages it comes from.
        </p>
      </header>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {SCENES.map((s) => {
          const c = getCompanion(s.companion);
          return (
            <li key={s.id} data-companion={c.id}>
              <article className="flex h-full gap-4 rounded-2xl border border-line bg-card p-5">
                <div className="shrink-0">
                  <ArchAvatar companionId={c.id} size="sm" showState={false} caption={false} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-accent">With {c.name}</p>
                  <h2 className="font-display text-2xl">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted">{s.subtitle}</p>
                  <p className="mt-2 text-xs text-muted">{s.source}</p>
                  <p className="mt-auto pt-3">
                    <Link
                      href={`/living-leela/${s.id}`}
                      className="inline-block rounded-full bg-accent px-4 py-2 text-sm text-on-accent hover:opacity-90"
                    >
                      Begin<span className="sr-only"> {s.title}</span>
                    </Link>
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
