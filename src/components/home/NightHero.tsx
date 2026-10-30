"use client";

import Link from "next/link";
import { useState } from "react";
import { IllustratedPortrait } from "@/components/avatars/IllustratedPortrait";
import { COMPANIONS, getCompanion, type CompanionId } from "@/lib/companions";

/** Fixed, non-random star field so the server and browser draw the same sky. */
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 389) % 1200,
  y: (i * 157) % 760,
  r: [1, 1.3, 1.8, 2.4][i % 4],
  d: ((i * 37) % 36) / 10,
}));
const POS: Record<CompanionId, [number, number]> = {
  krishna: [170, 90],
  shiva: [330, 230],
  hanuman: [110, 370],
  parvati: [300, 470],
};
const LINKS: [CompanionId, CompanionId][] = [
  ["krishna", "shiva"],
  ["shiva", "parvati"],
  ["parvati", "hanuman"],
  ["hanuman", "krishna"],
  ["krishna", "parvati"],
];

/** Night theme hero, "Kailash Night": a starry sky and a constellation of companions. */
export function NightHero() {
  const [pick, setPick] = useState<CompanionId>("shiva");
  const c = getCompanion(pick);
  return (
    <section className="home-night relative overflow-hidden bg-[radial-gradient(1200px_700px_at_75%_10%,#2b3a6b_0%,#141a33_55%,#0d1124_100%)] text-[#f4ecdc]">
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 760"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            className="star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff6d8"
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}
        <circle cx="1030" cy="170" r="46" fill="#f4efd6" />
        <circle cx="1048" cy="158" r="44" fill="#1f2a50" />
      </svg>

      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-10 px-4 pt-14 pb-20">
        <div className="home-fadeup min-w-0 flex-[1_1_26rem]">
          <p className="text-sm font-semibold tracking-[.14em] text-[#f6d68c] uppercase">
            Scripture-grounded conversations
          </p>
          <h1 className="mt-3 text-[clamp(2.6rem,5.6vw,4.5rem)] leading-[1.04] font-bold">
            Four companions. One sky of verses.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#d9cdb4]">
            Choose a companion from the constellation. Each answers from its own scriptures, and
            every passage links to its source.
          </p>
          <div
            aria-live="polite"
            className="mt-6 max-w-xl rounded-2xl border border-[#f4ecdc]/20 bg-white/[.07] px-5 py-4"
          >
            <p className="text-sm font-semibold tracking-wide text-[#f6d68c] uppercase">
              {c.name} · {c.epithet}
            </p>
            <p className="mt-2 text-lg">“{c.greeting}”</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/chat?companion=${pick}`}
              className="inline-flex min-h-12 items-center rounded-full bg-[#f6d68c] px-7 font-bold text-[#1a1430] hover:brightness-105"
            >
              Talk with {c.name}
            </Link>
            <Link
              href="/divine-council"
              className="inline-flex min-h-12 items-center rounded-full border border-[#f4ecdc]/40 px-7 font-semibold hover:border-[#f6d68c]"
            >
              Ask the Divine Council
            </Link>
          </div>
        </div>

        <div className="flex flex-[1_1_26rem] justify-center">
          <div
            className="relative h-[580px] w-[440px] max-w-full"
            role="group"
            aria-label="Choose a companion"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 440 580"
              className="absolute inset-0 h-full w-full"
            >
              {LINKS.map(([a, b]) => (
                <line
                  key={a + b}
                  className="constellation"
                  x1={POS[a][0]}
                  y1={POS[a][1]}
                  x2={POS[b][0]}
                  y2={POS[b][1]}
                  stroke="#f6d68c"
                  strokeWidth="2"
                  opacity=".55"
                />
              ))}
            </svg>
            {COMPANIONS.map((comp, i) => {
              const [x, y] = POS[comp.id];
              const on = comp.id === pick;
              return (
                <div
                  key={comp.id}
                  className="absolute flex w-36 flex-col items-center"
                  style={{ left: `${((x - 72) / 440) * 100}%`, top: y - 60 }}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPick(comp.id)}
                    className={`orb relative h-[120px] w-[120px] overflow-hidden rounded-full border-[3px] bg-[#1c2440] ${
                      on ? "border-[#f6d68c]" : "border-[#f4ecdc]/35"
                    }`}
                    style={{ animationDelay: `${i * 1.1}s` }}
                  >
                    <IllustratedPortrait companionId={comp.id} animated={false} />
                    <span className="sr-only">{comp.name}</span>
                  </button>
                  <span className="mt-1.5 font-display text-xl font-bold" aria-hidden="true">
                    {comp.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
