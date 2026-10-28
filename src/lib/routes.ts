/**
 * Central route registry.
 *
 * Every page of the website is listed here exactly once. The header menu, the footer,
 * the home page feature list and the automated tests all read from this list, so a page
 * can never be in the menu but missing from the tests (or the other way round).
 */

export type RouteGroup = "Talk" | "Learn" | "Reflect" | "Family" | "About";

/**
 * ready    = works as described today
 * preview  = the screen exists and works, but an important part is not connected yet
 * planned  = a placeholder page that explains what is coming and when
 */
export type RouteStatus = "ready" | "preview" | "planned";

export interface SiteRoute {
  path: `/${string}`;
  /** Short label for menus. */
  label: string;
  /** Page heading. */
  title: string;
  /** One sentence describing what the page does (or will do). */
  description: string;
  group: RouteGroup;
  status: RouteStatus;
  /** Build phase in which this page becomes fully functional. */
  phase: number;
}

export const ROUTES: readonly SiteRoute[] = [
  {
    path: "/",
    label: "Home",
    title: "Sanatana AI",
    description: "An overview of the companions and everything you can explore.",
    group: "About",
    status: "ready",
    phase: 1,
  },
  {
    path: "/companions",
    label: "Companions",
    title: "Meet the companions",
    description: "Choose Krishna, Shiva, Hanuman or Parvati and see how each one speaks.",
    group: "Talk",
    status: "ready",
    phase: 1,
  },
  {
    path: "/chat",
    label: "Chat",
    title: "Chat",
    description: "Talk by typing or speaking; replies are grounded in verified scripture.",
    group: "Talk",
    status: "ready",
    phase: 4,
  },
  {
    path: "/divine-council",
    label: "Divine Council",
    title: "Divine Council",
    description: "Ask one question and compare four separate, cited perspectives.",
    group: "Talk",
    status: "ready",
    phase: 5,
  },
  {
    path: "/living-leela",
    label: "Living Leela",
    title: "Living Leela",
    description:
      "Explore a source-grounded scene with each companion. Your choices change what you explore, never the original story.",
    group: "Talk",
    status: "ready",
    phase: 5,
  },
  {
    path: "/scriptures",
    label: "Scripture Explorer",
    title: "Scripture Explorer",
    description:
      "Search and browse licensed verses with full source, translator and license details.",
    group: "Learn",
    status: "ready",
    phase: 3,
  },
  {
    path: "/scripture-learning",
    label: "Learning Studio",
    title: "Scripture Learning Studio",
    description: "Source-backed lessons with meanings, playback and comprehension questions.",
    group: "Learn",
    status: "planned",
    phase: 7,
  },
  {
    path: "/wisdom-map",
    label: "Wisdom Map",
    title: "Wisdom Knowledge Map",
    description: "A map of verified links between teachings, concepts, people and stories.",
    group: "Learn",
    status: "planned",
    phase: 7,
  },
  {
    path: "/shloka-practice",
    label: "Shloka Practice",
    title: "Shloka Practice Studio",
    description: "Practise verses line by line with text, transliteration and audio.",
    group: "Learn",
    status: "planned",
    phase: 7,
  },
  {
    path: "/wisdom-for-generations",
    label: "Wisdom for Generations",
    title: "Wisdom for Generations",
    description: "The same teaching explained for a child (with a caregiver), a teen or an adult.",
    group: "Learn",
    status: "planned",
    phase: 8,
  },
  {
    path: "/dharma-lab",
    label: "Dharma Lab",
    title: "Dharma Lab",
    description:
      "Map a real dilemma into options and trade-offs, with cited perspectives. The choice stays yours.",
    group: "Reflect",
    status: "planned",
    phase: 7,
  },
  {
    path: "/my-journey",
    label: "My Journey",
    title: "My Dharma Journey",
    description:
      "Opt-in goal memory and a Wisdom Tree of teachings you choose to save, kept in your browser.",
    group: "Reflect",
    status: "planned",
    phase: 6,
  },
  {
    path: "/karma-reflection",
    label: "Karma Reflection",
    title: "Karma Reflection Mirror",
    description:
      "A private journal for intention, action, outcome, learning and next step. No scores.",
    group: "Reflect",
    status: "planned",
    phase: 6,
  },
  {
    path: "/daily-sankalpa",
    label: "Daily Sankalpa",
    title: "Daily Sankalpa",
    description: "Set optional daily intentions and track, pause or delete them.",
    group: "Reflect",
    status: "planned",
    phase: 6,
  },
  {
    path: "/kids",
    label: "Sanatana Kids",
    title: "Sanatana Kids",
    description:
      "Caregiver-guided talking storybooks with pictures, narration, questions and puzzles.",
    group: "Family",
    status: "planned",
    phase: 8,
  },
  {
    path: "/about",
    label: "About and privacy",
    title: "About, privacy and transparency",
    description: "What Sanatana AI is, how it handles your data and how it uses sources.",
    group: "About",
    status: "ready",
    phase: 1,
  },
  {
    path: "/evaluation",
    label: "Evaluation",
    title: "Engineering evaluation",
    description: "Real, reproducible measurements of accuracy, privacy, speech and accessibility.",
    group: "About",
    status: "planned",
    phase: 9,
  },
] as const;

export const ROUTE_GROUPS: readonly RouteGroup[] = ["Talk", "Learn", "Reflect", "Family", "About"];

/** Links shown directly in the desktop header. Everything else is in the menu. */
export const PRIMARY_NAV: readonly SiteRoute["path"][] = [
  "/chat",
  "/companions",
  "/divine-council",
  "/dharma-lab",
  "/scriptures",
  "/kids",
];

export function getRoute(path: string): SiteRoute {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) throw new Error(`Route not in registry: ${path}`);
  return route;
}

export function routesInGroup(group: RouteGroup): SiteRoute[] {
  return ROUTES.filter((r) => r.group === group);
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  ready: "Ready",
  preview: "Preview",
  planned: "Planned",
};
