import Link from "next/link";
import { getRoute } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { StatusBadge } from "./StatusBadge";

/**
 * Honest placeholder for pages that are planned but not built yet.
 * It never pretends a feature works.
 */
export function ComingSoon({ path, details }: { path: string; details: readonly string[] }) {
  const route = getRoute(path);
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <StatusBadge status={route.status} phase={route.phase} />
      <h1 className="mt-4 text-4xl sm:text-5xl">{route.title}</h1>
      <p className="mt-4 text-lg text-muted">{route.description}</p>

      <section
        aria-labelledby="planned-heading"
        className="mt-10 rounded-3xl border border-line bg-card p-6"
      >
        <h2 id="planned-heading" className="text-2xl">
          What this page will do
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          This page is a placeholder. It becomes functional in Phase {route.phase}; the site is
          currently in Phase {SITE.currentPhase}.
        </p>
      </section>

      <p className="mt-8">
        <Link href="/companions" className="text-accent underline">
          Meet the companions
        </Link>{" "}
        while you wait.
      </p>
    </div>
  );
}
