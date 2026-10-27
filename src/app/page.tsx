import { COMPANIONS, SITE } from "@/lib/site";

/**
 * Phase 0 placeholder home page.
 * It proves the website runs. Real features are built from Phase 1 onward.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <p className="rounded-full border border-accent/40 px-4 py-1 text-sm font-medium text-accent">
        Under construction · Phase 0
      </p>

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{SITE.name}</h1>
      <p className="max-w-xl text-lg leading-8 opacity-80">{SITE.tagline}</p>

      <section aria-labelledby="companions-heading" className="w-full">
        <h2 id="companions-heading" className="mb-4 text-xl font-semibold">
          Planned companions
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {COMPANIONS.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-foreground/15 bg-white/60 p-4 text-left"
            >
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm opacity-75">{c.focus}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="max-w-xl text-sm opacity-70">{SITE.aiDisclosure}</p>
      <p className="text-sm font-medium">AI chat is not connected yet.</p>
    </main>
  );
}
