import { NextResponse, type NextRequest } from "next/server";
import works from "@/data/scripture/works.json";
import { SCENES } from "@/lib/leela/scenes";

/**
 * Scripture pages are prerendered from the dataset. With Cache Components an
 * unknown `[work]` or `[section]` would render on request and stream the
 * not-found UI with a 200 status. Checking here, before rendering starts,
 * lets unknown paths return a real 404.
 */
const SECTION_COUNTS = new Map(
  (works as { id: string; sections: string[] }[]).map((w) => [w.id, w.sections.length]),
);

export function isKnownScripturePath(pathname: string): boolean {
  const [, , workId, section, ...rest] = pathname.replace(/\/$/, "").split("/");
  if (!workId) return true; // /scriptures itself
  const count = SECTION_COUNTS.get(workId);
  if (count === undefined || rest.length > 0) return false;
  if (section === undefined) return true;
  const n = Number(section);
  return /^[1-9]\d*$/.test(section) && n <= count;
}

const SCENE_IDS = new Set(SCENES.map((s) => s.id));

/** /living-leela/<scene> exists only for the four scenes. */
export function isKnownLeelaPath(pathname: string): boolean {
  const [, , scene, ...rest] = pathname.replace(/\/$/, "").split("/");
  return !scene || (SCENE_IDS.has(scene) && rest.length === 0);
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const known = path.startsWith("/living-leela")
    ? isKnownLeelaPath(path)
    : isKnownScripturePath(path);
  if (known) return NextResponse.next();
  // A path with no route renders the app's not-found page with status 404.
  return NextResponse.rewrite(new URL("/__not-found", request.url));
}

export const config = {
  matcher: ["/scriptures/:path+", "/living-leela/:path+"],
};
