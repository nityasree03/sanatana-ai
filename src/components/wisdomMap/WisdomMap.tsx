"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import { COMPANIONS, type CompanionId } from "@/lib/companions";
import { EDGES, NODES, nodeById, type MapNode, type NodeType } from "@/lib/wisdomMap/graph";

export interface EvidencePassage {
  id: string;
  reference: string;
  href: string;
  translator: string;
  excerpt: string;
}

const TYPE_STYLE: Record<NodeType, { r: number; fill: string; label: string }> = {
  person: { r: 20, fill: "#b93b0b", label: "Person" },
  concept: { r: 18, fill: "#1a6b7b", label: "Teaching or idea" },
  place: { r: 16, fill: "#8a6d1d", label: "Place" },
  text: { r: 16, fill: "#5b4a3a", label: "Text" },
};

function edgeText(from: string, label: string, to: string) {
  return `${nodeById(from)!.label} ${label} ${nodeById(to)!.label}`;
}

/** The Wisdom Knowledge Map: every link is backed by a passage you can open. */
export function WisdomMap({ evidence }: { evidence: Record<string, EvidencePassage> }) {
  const [selected, setSelected] = useState<string>("self");
  const [filter, setFilter] = useState<CompanionId | "all">("all");
  const name = useId();
  const visible = (n: MapNode) => filter === "all" || n.companions.includes(filter);
  const node = nodeById(selected)!;
  const links = EDGES.filter((e) => e.from === selected || e.to === selected);
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Wisdom Knowledge Map</h1>
        <p className="mt-2 text-muted">
          People, teachings, places and texts from the library, and how they connect. Every link is
          backed by a verse you can open; nothing is linked unless a passage shows it.
        </p>
      </header>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">Show</legend>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name={name}
              checked={filter === "all"}
              onChange={() => setFilter("all")}
            />
            Everything
          </label>
          {COMPANIONS.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name={name}
                checked={filter === c.id}
                onChange={() => setFilter(c.id)}
              />
              {c.name}&apos;s texts
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="rounded-2xl border border-line bg-card p-2 text-ink">
          <svg
            viewBox="0 0 1000 740"
            className="h-auto w-full"
            role="group"
            aria-label="Wisdom Knowledge Map"
          >
            {EDGES.map((e) => {
              const a = nodeById(e.from)!;
              const b = nodeById(e.to)!;
              const on = e.from === selected || e.to === selected;
              const shown = visible(a) && visible(b);
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="currentColor"
                  strokeOpacity={on ? 0.85 : shown ? 0.22 : 0.06}
                  strokeWidth={on ? 3.5 : 1.5}
                />
              );
            })}
            {NODES.map((n) => {
              const st = TYPE_STYLE[n.type];
              const isSel = n.id === selected;
              const dim = !visible(n);
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  onClick={() => setSelected(n.id)}
                  onKeyDown={(e) => onKey(e, n.id)}
                  opacity={dim ? 0.3 : 1}
                  className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[5]"
                >
                  {n.type === "text" ? (
                    <rect
                      x={n.x - st.r}
                      y={n.y - st.r}
                      width={st.r * 2}
                      height={st.r * 2}
                      rx={4}
                      fill={st.fill}
                      stroke={isSel ? "#1f1a14" : "#fff"}
                      strokeWidth={isSel ? 4 : 2}
                    />
                  ) : (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isSel ? st.r + 4 : st.r}
                      fill={st.fill}
                      stroke={isSel ? "#1f1a14" : "#fff"}
                      strokeWidth={isSel ? 4 : 2}
                    />
                  )}
                  <text
                    x={n.x}
                    y={n.y + st.r + 20}
                    textAnchor="middle"
                    className={`fill-current text-[17px] ${isSel ? "font-bold" : "font-semibold"}`}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <ul
            className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-xs text-muted"
            aria-label="Key"
          >
            {(Object.keys(TYPE_STYLE) as NodeType[]).map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`inline-block h-3 w-3 ${t === "text" ? "rounded-sm" : "rounded-full"}`}
                  style={{ background: TYPE_STYLE[t].fill }}
                />
                {TYPE_STYLE[t].label}
              </li>
            ))}
          </ul>
        </div>

        <section
          aria-labelledby="node-title"
          aria-live="polite"
          className="rounded-2xl border border-line bg-card p-5"
        >
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {TYPE_STYLE[node.type].label}
          </p>
          <h2 id="node-title" className="font-display text-3xl">
            {node.label}
          </h2>
          <p className="mt-1 text-sm">
            {node.note} <span className="text-muted">(our note)</span>
          </p>
          <h3 className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
            {links.length} {links.length === 1 ? "connection" : "connections"}, each with its verse
          </h3>
          <ul className="mt-2 space-y-3">
            {links.map((e) => (
              <li key={`${e.from}-${e.to}`} className="text-sm">
                <p>
                  <button
                    type="button"
                    className="font-semibold underline decoration-dotted underline-offset-4"
                    onClick={() => setSelected(e.from === selected ? e.to : e.from)}
                  >
                    {edgeText(e.from, e.label, e.to)}
                  </button>
                </p>
                <ul className="mt-1 space-y-1">
                  {e.evidence.map((id) => {
                    const p = evidence[id];
                    return (
                      <li key={id} className="palm-leaf px-4 py-2 text-xs">
                        <Link href={p.href} className="font-semibold underline">
                          {p.reference}
                        </Link>{" "}
                        <span className="text-leaf-ink">· Verified scripture · {p.translator}</span>
                        <p className="mt-1 whitespace-pre-line">{p.excerpt}</p>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <details className="mt-8 rounded-2xl border border-line bg-card p-4">
        <summary className="cursor-pointer font-semibold">
          All {EDGES.length} links as a list
        </summary>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">
            Every link in the Wisdom Knowledge Map with its evidence
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-1 pr-3">
                Link
              </th>
              <th scope="col" className="py-1">
                Shown by
              </th>
            </tr>
          </thead>
          <tbody>
            {EDGES.map((e) => (
              <tr key={`${e.from}-${e.to}`} className="border-b border-line/50 align-top">
                <td className="py-1.5 pr-3">{edgeText(e.from, e.label, e.to)}</td>
                <td className="py-1.5">
                  {e.evidence.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ", "}
                      <Link href={evidence[id].href} className="underline">
                        {evidence[id].reference}
                      </Link>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
