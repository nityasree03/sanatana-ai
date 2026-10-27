import Link from "next/link";
import { ArchAvatar } from "@/components/ArchAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { COMPANIONS } from "@/lib/companions";
import { ROUTE_GROUPS, routesInGroup } from "@/lib/routes";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-medium tracking-wider text-accent uppercase">
            Talk · Learn · Reflect
          </p>
          <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">{SITE.name}</h1>
          <p className="mt-4 max-w-xl text-xl text-muted">{SITE.tagline}</p>
          <p className="mt-4 max-w-xl text-sm text-muted">{SITE.aiDisclosure}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:opacity-90"
            >
              Start a conversation
            </Link>
            <Link
              href="/companions"
              className="rounded-full border border-line px-6 py-3 hover:border-accent"
            >
              Meet the companions
            </Link>
          </div>
          <p className="mt-6 inline-block rounded-2xl border border-gold/60 bg-leaf px-4 py-2 text-sm text-leaf-ink">
            Early preview (Phase {SITE.currentPhase}): the screens are in place, but the AI is not
            connected yet.
          </p>
        </div>
        <div className="flex justify-center" data-companion="krishna">
          <ArchAvatar companionId="krishna" showState={false} />
        </div>
      </section>

      {/* Companions */}
      <section aria-labelledby="companions-heading" className="py-10">
        <h2 id="companions-heading" className="text-3xl">
          Four companions, four voices
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANIONS.map((c) => (
            <li key={c.id} data-companion={c.id}>
              <Link
                href={`/chat?companion=${c.id}`}
                className="block h-full rounded-3xl border border-line bg-card p-5 hover:border-accent"
              >
                <span className="font-display text-2xl font-semibold text-accent">{c.name}</span>
                <span className="mt-1 block text-sm">{c.epithet}</span>
                <span className="mt-3 block text-xs text-muted">{c.voice}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Everything on the site, straight from the route registry */}
      <section aria-labelledby="explore-heading" className="py-10">
        <h2 id="explore-heading" className="text-3xl">
          Explore
        </h2>
        <p className="mt-2 text-muted">
          Every part of Sanatana AI, with an honest label showing what works today.
        </p>
        <div className="mt-6 space-y-8">
          {ROUTE_GROUPS.map((group) => {
            const routes = routesInGroup(group).filter((r) => r.path !== "/");
            return (
              <div key={group}>
                <h3 className="font-sans text-sm font-semibold tracking-wider text-muted uppercase">
                  {group}
                </h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {routes.map((r) => (
                    <li key={r.path}>
                      <Link
                        href={r.path}
                        className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-card p-4 hover:border-accent"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{r.label}</span>
                          <StatusBadge status={r.status} phase={r.phase} />
                        </span>
                        <span className="text-sm text-muted">{r.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
