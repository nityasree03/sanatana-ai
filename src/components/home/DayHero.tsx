import Link from "next/link";
import { ArchAvatar } from "@/components/ArchAvatar";
import { COMPANIONS } from "@/lib/companions";

const RAYS = Array.from({ length: 14 }, (_, i) => -78 + i * 12);
const DIYAS = [
  [8, 0],
  [18, 5],
  [30, 2.5],
  [46, 8],
  [62, 1.2],
  [74, 6.5],
  [86, 3.6],
  [94, 10],
] as const;

/** Day theme hero, "Temple Dawn": a rising sun, floating lamps, the companions in arches. */
export function DayHero() {
  return (
    <section className="home-day relative overflow-hidden bg-gradient-to-b from-[#f9e3bd] to-paper">
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <g className="dawn-rays">
          {RAYS.map((a) => (
            <rect
              key={a}
              x="596"
              y="40"
              width="8"
              height="600"
              fill="#f2c36b"
              opacity=".18"
              transform={`rotate(${a} 600 640)`}
            />
          ))}
        </g>
        <circle className="dawn-sun" cx="600" cy="640" r="230" fill="#f7cf7a" opacity=".55" />
        <circle className="dawn-sun" cx="600" cy="640" r="150" fill="#f6b73c" opacity=".5" />
      </svg>
      <div aria-hidden="true">
        {DIYAS.map(([left, delay]) => (
          <span
            key={left}
            className="diya"
            style={{ left: `${left}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="home-fadeup pt-14 pb-4 text-center sm:pt-16">
          <p className="text-sm font-semibold tracking-[.14em] text-[#7a4d0c] uppercase">
            Scripture-grounded conversations
          </p>
          <h1 className="mx-auto mt-3 max-w-4xl text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.04] font-bold">
            Talk with four AI companions, answered by the verses themselves
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Type or speak. Every reply cites real scripture you can open, and shows what is verse,
            what is interpretation and what is suggestion.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex min-h-12 items-center rounded-full bg-[#8a3b12] px-7 font-semibold text-white hover:brightness-110"
            >
              Start a conversation
            </Link>
            <Link
              href="/scriptures"
              className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-7 font-semibold hover:border-[#8a3b12]"
            >
              Explore the scriptures
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 pb-16 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-10">
          {COMPANIONS.map((c, i) => (
            <li key={c.id} data-companion={c.id}>
              <Link
                href={`/chat?companion=${c.id}`}
                className="arch-bob flex w-full flex-col items-center gap-1 rounded-3xl p-2 text-center sm:w-56"
                style={{ animationDelay: `${i * 0.7}s` }}
              >
                <ArchAvatar
                  companionId={c.id}
                  size="responsive"
                  showState={false}
                  caption={false}
                  animated
                />
                <span className="font-display text-2xl font-bold">{c.name}</span>
                <span className="text-sm leading-snug font-semibold text-accent">{c.epithet}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
