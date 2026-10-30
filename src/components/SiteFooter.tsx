import Link from "next/link";
import { ROUTE_GROUPS, routesInGroup } from "@/lib/routes";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-card-2">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav aria-label="Footer">
          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {ROUTE_GROUPS.map((group) => (
              <div key={group}>
                <h2 className="mb-2 font-sans text-xs font-semibold tracking-wider text-muted uppercase">
                  {group}
                </h2>
                <ul className="space-y-1 text-sm">
                  {routesInGroup(group).map((r) => (
                    <li key={r.path}>
                      <Link href={r.path} className="hover:underline">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
        <div className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <p>{SITE.aiDisclosure}</p>
          <p>
            {SITE.name} is created by {SITE.creator}. {SITE.portraitCredit}
          </p>
          <p>
            Not a substitute for professional, medical, legal or emergency help. Open source on{" "}
            <a href={SITE.repoUrl} className="underline">
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
