"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { getRoute, PRIMARY_NAV, ROUTE_GROUPS, routesInGroup } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuId = useId();

  // Close the menu after navigating to a new page
  // (React's recommended "adjust state when a value changes" pattern).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Let Escape close the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 text-xl font-semibold"
          aria-label={`${SITE.name} home`}
        >
          <span className="font-display text-2xl">Sanatana</span>{" "}
          <span className="text-accent">AI</span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((path) => {
              const route = getRoute(path);
              const active = pathname === path;
              return (
                <li key={path}>
                  <Link
                    href={path}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      active
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {route.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3 text-sm"
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
            {menuOpen ? "Close" : "All pages"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id={menuId} aria-label="All pages" className="border-t border-line bg-card">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
            {ROUTE_GROUPS.map((group) => (
              <div key={group}>
                <h2 className="mb-2 font-sans text-xs font-semibold tracking-wider text-muted uppercase">
                  {group}
                </h2>
                <ul className="space-y-1">
                  {routesInGroup(group).map((r) => (
                    <li key={r.path}>
                      <Link
                        href={r.path}
                        aria-current={pathname === r.path ? "page" : undefined}
                        className="block rounded-md px-2 py-1 text-sm hover:bg-card-2"
                      >
                        {r.label}
                        {r.status === "planned" && (
                          <span className="ml-1.5 text-xs text-muted">· Phase {r.phase}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
