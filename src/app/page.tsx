import Link from "next/link";
import { DayHero } from "@/components/home/DayHero";
import { NightHero } from "@/components/home/NightHero";
import { MANIFEST, WORKS } from "@/lib/scripture/data";
import { SITE } from "@/lib/site";

const STEPS = [
  ["Ask", "Choose a companion and ask what is on your mind, by typing or speaking."],
  [
    "See the verses",
    "Each answer cites passages from public-domain translations, with chapter, verse and translator.",
  ],
  [
    "Reflect",
    "Save a leaf to your Wisdom Tree or set a small daily Sankalpa, privately in your browser.",
  ],
] as const;

export default function Home() {
  const features = [
    [
      "/divine-council",
      "Divine Council",
      "Ask one question, hear four perspectives, each with its own verses.",
    ],
    [
      "/dharma-lab",
      "Dharma Lab",
      "Map a hard decision into paths, with upsides, downsides and unknowns.",
    ],
    [
      "/living-leela",
      "Living Leela",
      "Step inside one story per companion and choose what to explore.",
    ],
    [
      "/scriptures",
      "Scripture Explorer",
      `${WORKS.length} texts and ${MANIFEST.passageCount.toLocaleString("en-US")} passages, with translator, source and licence.`,
    ],
    [
      "/scripture-learning",
      "Learning Studio",
      "8 short lessons; every answer points to the line that supports it.",
    ],
    [
      "/shloka-practice",
      "Shloka Practice",
      "12 verses line by line in Devanagari and IAST, with slow listening.",
    ],
    [
      "/my-journey",
      "My Dharma Journey",
      "Goals, a Wisdom Tree and daily Sankalpa, saved only in your browser.",
    ],
    ["/kids", "Sanatana Kids", "Four talking storybooks for children, run by a grown-up."],
  ] as const;

  return (
    <div>
      {/* The theme decides which hero shows (globals.css): Temple Dawn by day, Kailash Night by night. */}
      <div className="theme-day-only">
        <DayHero />
      </div>
      <div className="theme-night-only">
        <NightHero />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <ol className="grid gap-4 py-10 sm:grid-cols-3" aria-label="How it works">
          {STEPS.map(([title, text], i) => (
            <li
              key={title}
              className="home-fadeup rounded-3xl border border-line bg-card p-6"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <p className="text-xs font-semibold tracking-[.12em] text-muted uppercase">
                Step {i + 1}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold">{title}</h2>
              <p className="mt-1 leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>

        <section aria-labelledby="explore-heading">
          <h2 id="explore-heading" className="font-display text-[clamp(2.1rem,4vw,3rem)] font-bold">
            Everything in {SITE.name}
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([href, title, text], i) => (
              <li key={href}>
                <Link
                  href={href}
                  className="home-feat home-fadeup flex h-full flex-col gap-1.5 rounded-2xl border border-line bg-card p-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="font-display text-2xl font-bold">{title}</span>
                  <span className="leading-relaxed text-muted">{text}</span>
                  <span className="mt-auto pt-2 text-sm font-semibold text-accent">
                    Open <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
