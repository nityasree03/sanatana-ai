"use client";

import type { KeyboardEvent } from "react";
import { pointCounts, type DecisionMap } from "@/lib/dharma/model";

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** Split text into at most `lines` lines of about `width` characters (for SVG text). */
function wrap(s: string, width: number, lines: number): string[] {
  const words = s.replace(/\s+/g, " ").trim().split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      out.push(cur);
      cur = w;
      if (out.length === lines) break;
    } else cur = (cur + " " + w).trim();
  }
  if (out.length < lines && cur) out.push(cur);
  if (out.length === lines && words.join(" ").length > out.join(" ").length)
    out[lines - 1] = clip(out[lines - 1], width - 1) + (out[lines - 1].endsWith("…") ? "" : "…");
  return out;
}

/**
 * The branch map: the decision on the left, one branch per path on the right, each showing its
 * upsides (+), downsides (−) and unknowns (?) and whether it is the person's choice. Paths are
 * keyboard buttons that select the path below.
 */
export function DecisionMapSvg({
  map,
  selectedId,
  onSelect,
}: {
  map: DecisionMap;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const n = map.options.length;
  const W = 1000;
  const rowH = 96;
  const H = Math.max(220, n * rowH + 40);
  const rootX = 30;
  const rootW = 300;
  const rootY = H / 2 - 50;
  const nodeX = 560;
  const nodeW = 410;
  const chosen = map.decision?.kind === "option" ? map.decision.optionId : null;
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full text-ink"
      role="group"
      aria-label={`Decision map with ${n} ${n === 1 ? "path" : "paths"}`}
    >
      <rect
        x={rootX}
        y={rootY}
        width={rootW}
        height={100}
        rx={18}
        fill="currentColor"
        opacity={0.06}
        stroke="currentColor"
        strokeOpacity={0.3}
      />
      <text
        x={rootX + 16}
        y={rootY + 26}
        className="fill-current text-[15px] font-semibold"
        aria-hidden="true"
      >
        My decision
      </text>
      {wrap(map.dilemma || "(not written yet)", 34, 3).map((line, i) => (
        <text
          key={i}
          x={rootX + 16}
          y={rootY + 50 + i * 20}
          className="fill-current text-[16px]"
          aria-hidden="true"
        >
          {line}
        </text>
      ))}
      {map.options.map((o, i) => {
        const y = 20 + i * rowH;
        const c = pointCounts(o);
        const isSel = selectedId === o.id;
        const isChosen = chosen === o.id;
        const midY = y + 38;
        return (
          <g key={o.id}>
            <path
              d={`M${rootX + rootW} ${rootY + 50} C${rootX + rootW + 120} ${rootY + 50} ${nodeX - 120} ${midY} ${nodeX} ${midY}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={isChosen ? 0.9 : 0.35}
              strokeWidth={isChosen ? 4 : 2}
            />
            <g
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              onClick={() => onSelect(o.id)}
              onKeyDown={(e) => onKey(e, o.id)}
              className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[4]"
            >
              <rect
                x={nodeX}
                y={y}
                width={nodeW}
                height={76}
                rx={16}
                className={isChosen ? "fill-accent-soft" : "fill-card"}
                stroke={isSel ? "var(--color-accent)" : "currentColor"}
                strokeOpacity={isSel ? 1 : 0.3}
                strokeWidth={isSel ? 3 : 1.5}
              />
              <text x={nodeX + 16} y={y + 30} className="fill-current text-[17px] font-semibold">
                {`Path ${i + 1}: ${clip(o.title, 34)}`}
              </text>
              <text x={nodeX + 16} y={y + 58} className="fill-current text-[15px]">
                {/* Visible text doubles as the accessible name (WCAG 2.5.3 Label in Name). */}
                {[
                  `${c.up} up · ${c.down} down · ${c.unknown} unknown`,
                  o.perspectives.length
                    ? `${o.perspectives.length} perspective${o.perspectives.length === 1 ? "" : "s"}`
                    : "",
                  isChosen ? "✓ my choice" : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </text>
            </g>
          </g>
        );
      })}
      {n === 0 && (
        <text x={nodeX} y={H / 2} className="fill-current text-[16px]" aria-hidden="true">
          Paths you add will branch out here.
        </text>
      )}
    </svg>
  );
}
