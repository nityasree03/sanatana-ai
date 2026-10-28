"use client";

import Link from "next/link";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import {
  Dialog,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/Dialog";
import { getCompanion } from "@/lib/companions";
import type { Leaf } from "@/lib/journey/schema";
import { removeItem, updateItem } from "@/lib/journey/store";
import { ThemeFields } from "./SaveLeafButton";

const MAX_BRANCHES = 8;
const MAX_LEAVES_SHOWN = 12;
const COLORS = [
  "#2f7d4f",
  "#1a6b7b",
  "#b93b0b",
  "#b03458",
  "#3b4a80",
  "#8a6d1d",
  "#5b6b2f",
  "#7a3f8a",
];
const SOURCE_LABEL: Record<Leaf["source"], string> = {
  chat: "the chat",
  council: "the Divine Council",
  leela: "Living Leela",
  explorer: "the Scripture Explorer",
  "dharma-lab": "the Dharma Lab",
};

export interface Branch {
  theme: string;
  leaves: Leaf[];
}

/** Group leaves into branches: largest themes first; beyond 8 themes, the rest share "More themes". */
export function branchesOf(leaves: Leaf[]): Branch[] {
  const byTheme = new Map<string, Leaf[]>();
  for (const l of leaves) byTheme.set(l.theme, [...(byTheme.get(l.theme) ?? []), l]);
  const sorted = [...byTheme.entries()]
    .map(([theme, ls]) => ({ theme, leaves: ls }))
    .sort((a, b) => b.leaves.length - a.leaves.length || a.theme.localeCompare(b.theme));
  if (sorted.length <= MAX_BRANCHES) return sorted;
  const kept = sorted.slice(0, MAX_BRANCHES - 1);
  const rest = sorted.slice(MAX_BRANCHES - 1).flatMap((b) => b.leaves);
  return [...kept, { theme: "More themes", leaves: rest }];
}

/** The drawing: a trunk, one branch per theme, one focusable leaf per saved passage. */
function TreeDrawing({
  branches,
  selected,
  onSelect,
}: {
  branches: Branch[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const W = 1000;
  const H = 480;
  const cx = W / 2;
  const trunkTop = 110;
  const n = branches.length;
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="group"
      aria-label={`Wisdom Tree with ${n} ${n === 1 ? "branch" : "branches"}`}
    >
      {/* ground and trunk */}
      <ellipse cx={cx} cy={H - 18} rx={200} ry={14} fill="currentColor" opacity={0.08} />
      <path
        d={`M${cx - 16} ${H - 20} C${cx - 10} ${H - 140} ${cx - 8} ${trunkTop + 80} ${cx - 3} ${trunkTop} L${cx + 3} ${trunkTop} C${cx + 8} ${trunkTop + 80} ${cx + 10} ${H - 140} ${cx + 16} ${H - 20} Z`}
        fill="#7a5a3a"
      />
      {branches.map((b, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const y0 = H - 110 - (i * (H - 110 - trunkTop - 10)) / Math.max(n, 1);
        const len = 190 + (i % 3) * 25;
        const x1 = cx + side * len;
        const y1 = y0 - 70;
        const color = COLORS[i % COLORS.length];
        const shown = b.leaves.slice(0, MAX_LEAVES_SHOWN);
        const extra = b.leaves.length - shown.length;
        // Labels sit just beyond the branch tip, pointing outwards, so they never cross the trunk.
        const labelX = x1 + side * 8;
        return (
          <g key={b.theme}>
            <path
              d={`M${cx} ${y0} Q${cx + side * len * 0.45} ${y0 - 10} ${x1} ${y1}`}
              stroke="#7a5a3a"
              strokeWidth={6 - Math.min(i, 3)}
              fill="none"
              strokeLinecap="round"
            />
            <text
              x={labelX}
              y={y1 + 4}
              textAnchor={side < 0 ? "end" : "start"}
              className="fill-current text-[19px] font-semibold"
              aria-hidden="true"
            >
              {b.theme.length > 24 ? `${b.theme.slice(0, 23)}…` : b.theme} ({b.leaves.length})
            </text>
            {shown.map((leaf, j) => {
              const t = 0.25 + (0.75 * (j + 1)) / (shown.length + 1);
              // point on the quadratic curve
              const qx = cx + side * len * 0.45;
              const qy = y0 - 10;
              const px = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * qx + t * t * x1;
              const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * qy + t * t * y1;
              const up = j % 2 === 0 ? -1 : 1;
              const lx = px;
              const ly = py + up * 17;
              const isSel = selected === leaf.id;
              return (
                <g
                  key={leaf.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`${leaf.reference}, ${b.theme}`}
                  onClick={() => onSelect(leaf.id)}
                  onKeyDown={(e) => onKey(e, leaf.id)}
                  className="cursor-pointer outline-none [&:focus-visible>ellipse]:stroke-[3]"
                >
                  <line x1={px} y1={py} x2={lx} y2={ly} stroke="#7a5a3a" strokeWidth={1.5} />
                  <ellipse
                    cx={lx}
                    cy={ly}
                    rx={isSel ? 17 : 14}
                    ry={isSel ? 10 : 8}
                    transform={`rotate(${side * up * -30} ${lx} ${ly})`}
                    fill={color}
                    stroke={isSel ? "#1f1a14" : "#ffffff"}
                    strokeWidth={isSel ? 2.5 : 1}
                  />
                </g>
              );
            })}
            {extra > 0 && (
              <text
                x={labelX}
                y={y1 + 20}
                textAnchor={side < 0 ? "end" : "start"}
                className="fill-current text-[16px]"
                aria-hidden="true"
              >
                +{extra} more in the list
              </text>
            )}
          </g>
        );
      })}
      {n === 0 && (
        <text x={cx} y={trunkTop - 20} textAnchor="middle" className="fill-current text-[14px]">
          A young tree: save a passage to grow your first leaf
        </text>
      )}
    </svg>
  );
}

function LeafDetails({
  leaf,
  readOnly,
  onEdit,
  onDelete,
}: {
  leaf: Leaf;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article aria-labelledby={`leaf-${leaf.id}`} className="palm-leaf px-5 py-4 text-sm">
      <p className="text-xs font-semibold tracking-wide uppercase">{leaf.theme}</p>
      <h3 id={`leaf-${leaf.id}`} className="mt-1 font-sans text-base font-semibold">
        <Link href={leaf.href} className="underline decoration-dotted underline-offset-4">
          {leaf.reference}
        </Link>
      </h3>
      <p className="text-xs text-leaf-ink">
        <span aria-hidden="true">📜 </span>Verified scripture · {leaf.translator}
      </p>
      <p className="mt-2 whitespace-pre-line">{leaf.excerpt}</p>
      {leaf.note && (
        <p className="mt-2 border-t border-dashed border-leaf-ink/40 pt-2">
          <span className="font-semibold">My note:</span> {leaf.note}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Saved {new Date(leaf.createdAt).toLocaleDateString()} from {SOURCE_LABEL[leaf.source]}
        {leaf.companion ? ` with ${getCompanion(leaf.companion).name}` : ""}
      </p>
      {!readOnly && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={buttonSecondary}
            onClick={onEdit}
            aria-label={`Edit leaf ${leaf.reference}`}
          >
            Edit
          </button>
          <button
            type="button"
            className={buttonDanger}
            onClick={onDelete}
            aria-label={`Delete leaf ${leaf.reference}`}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

/** Wisdom Tree: the visual tree, the selected leaf, and a searchable list with edit and delete. */
export function WisdomTree({ leaves, readOnly }: { leaves: Leaf[]; readOnly: boolean }) {
  const branches = useMemo(() => branchesOf(leaves), [leaves]);
  const [selected, setSelected] = useState<string | null>(leaves[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [editing, setEditing] = useState<Leaf | null>(null);
  const [deleting, setDeleting] = useState<Leaf | null>(null);
  const [status, setStatus] = useState("");
  const searchId = useId();
  const filterId = useId();
  const current = leaves.find((l) => l.id === selected) ?? null;
  const themes = [...new Set(leaves.map((l) => l.theme))].sort();
  const q = query.trim().toLowerCase();
  const filtered = leaves.filter(
    (l) =>
      (!themeFilter || l.theme === themeFilter) &&
      (!q ||
        [l.reference, l.excerpt, l.note, l.theme, l.translator].some((x) =>
          x.toLowerCase().includes(q),
        )),
  );

  return (
    <section aria-labelledby="tree-title" className="space-y-6">
      <div>
        <h2 id="tree-title" className="font-display text-2xl">
          Wisdom Tree
        </h2>
        <p className="mt-1 text-sm text-muted">
          Each branch is a theme you chose; each leaf is a passage you saved, linked back to its
          scripture. Save passages with &ldquo;Save to Wisdom Tree&rdquo; in the chat, the Divine
          Council, Living Leela or the Scripture Explorer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="rounded-2xl border border-line bg-card p-2 text-ink">
          <TreeDrawing branches={branches} selected={selected} onSelect={setSelected} />
        </div>
        <div aria-live="polite">
          {current ? (
            <LeafDetails
              leaf={current}
              readOnly={readOnly}
              onEdit={() => setEditing(current)}
              onDelete={() => setDeleting(current)}
            />
          ) : (
            <p className="text-sm text-muted">
              {leaves.length ? "Choose a leaf to read it." : "No leaves yet."}
            </p>
          )}
        </div>
      </div>

      {leaves.length > 0 && (
        <div>
          <h3 className="font-display text-xl">All leaves</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            <div className="min-w-56 flex-1">
              <label htmlFor={searchId} className="text-sm font-semibold">
                Search your leaves
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={inputClass}
                placeholder="Words from the passage, your note or a reference"
              />
            </div>
            <div>
              <label htmlFor={filterId} className="text-sm font-semibold">
                Branch
              </label>
              <select
                id={filterId}
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className={inputClass}
              >
                <option value="">All branches</option>
                {themes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            Showing {filtered.length} of {leaves.length}
          </p>
          <ul className="mt-2 space-y-2" aria-label="Saved leaves">
            {filtered.map((l) => (
              <li key={l.id} className="rounded-xl border border-line bg-card p-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(l.id)}
                    className="text-left font-semibold underline decoration-dotted underline-offset-4"
                  >
                    {l.reference}
                  </button>
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                    {l.theme}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-muted">{l.excerpt}</p>
                {l.note && <p className="mt-1">Note: {l.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p aria-live="polite" className="text-sm">
        {status}
      </p>

      {editing && (
        <EditLeafDialog
          leaf={editing}
          themes={themes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setStatus("Leaf updated.");
          }}
        />
      )}
      {deleting && (
        <Dialog
          title="Delete this leaf?"
          description={`${deleting.reference} will be removed from your Wisdom Tree. The passage stays in the Scripture Explorer.`}
          onClose={() => setDeleting(null)}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setDeleting(null)}
              data-autofocus
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => {
                removeItem("leaves", deleting.id);
                setDeleting(null);
                setSelected(null);
                setStatus("Leaf deleted.");
              }}
            >
              Delete leaf
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}

function EditLeafDialog({
  leaf,
  themes,
  onClose,
  onSaved,
}: {
  leaf: Leaf;
  themes: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [theme, setTheme] = useState(leaf.theme);
  const [note, setNote] = useState(leaf.note);
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog title="Edit leaf" description={leaf.reference} onClose={onClose}>
      <ThemeFields
        theme={theme}
        setTheme={setTheme}
        note={note}
        setNote={setNote}
        existingThemes={themes}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonPrimary}
          onClick={() => {
            if (!theme.trim()) return setError("Choose a branch or name your own.");
            updateItem("leaves", leaf.id, { theme: theme.trim(), note: note.trim() });
            onSaved();
          }}
        >
          Save changes
        </button>
      </div>
    </Dialog>
  );
}
