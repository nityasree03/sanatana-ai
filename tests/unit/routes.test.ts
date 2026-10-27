import { readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PRIMARY_NAV, ROUTE_GROUPS, ROUTES, getRoute } from "@/lib/routes";

const APP_DIR = path.resolve(__dirname, "../../src/app");

describe("route registry", () => {
  it("lists all 17 routes from the blueprint exactly once", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect([...paths].sort()).toEqual(
      [
        "/",
        "/about",
        "/chat",
        "/companions",
        "/daily-sankalpa",
        "/dharma-lab",
        "/divine-council",
        "/evaluation",
        "/karma-reflection",
        "/kids",
        "/living-leela",
        "/my-journey",
        "/scripture-learning",
        "/scriptures",
        "/shloka-practice",
        "/wisdom-for-generations",
        "/wisdom-map",
      ].sort(),
    );
  });

  it("has a real page file for every route", () => {
    for (const r of ROUTES) {
      const file = path.join(APP_DIR, r.path === "/" ? "" : r.path, "page.tsx");
      expect(existsSync(file), `missing ${file}`).toBe(true);
    }
  });

  it("has no page folders that are missing from the registry", () => {
    const folders = readdirSync(APP_DIR).filter(
      (f) =>
        statSync(path.join(APP_DIR, f)).isDirectory() &&
        existsSync(path.join(APP_DIR, f, "page.tsx")),
    );
    for (const f of folders) expect(() => getRoute(`/${f}`)).not.toThrow();
  });

  it("puts every route in a known group, and primary links exist", () => {
    for (const r of ROUTES) expect(ROUTE_GROUPS).toContain(r.group);
    for (const p of PRIMARY_NAV) expect(() => getRoute(p)).not.toThrow();
  });

  it("never marks a page ready before its phase", () => {
    for (const r of ROUTES.filter((r) => r.status === "ready"))
      expect(r.phase).toBeLessThanOrEqual(1);
  });
});
