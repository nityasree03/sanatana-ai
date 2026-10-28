"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { OptionsResponse } from "@/app/api/dharma-lab/options/route";
import { ConsentText } from "@/components/journey/JourneyConsent";
import { downloadFile } from "@/components/journey/MyDataPanel";
import { DictateButton } from "@/components/ui/DictateButton";
import {
  Dialog,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/Dialog";
import {
  DHARMA_LIMITS,
  DecisionMapSchema,
  emptyMap,
  reduce,
  type Action,
  type DecisionMap,
} from "@/lib/dharma/model";
import {
  addItem,
  enableSaving,
  localDate,
  newId,
  now,
  removeItem,
  storageAvailable,
  upsertDecision,
} from "@/lib/journey/store";
import { useJourney } from "@/lib/journey/useJourney";
import { DecisionMapSvg } from "./DecisionMapSvg";
import { PathCard } from "./PathCard";
import { PerspectivesPanel } from "./PerspectivesPanel";

const DRAFT_KEY = "sanatana-dharma-draft";

/** The path the person chose, if they chose one. */
function chosenOf(map: DecisionMap) {
  const d = map.decision;
  return d?.kind === "option" ? (map.options.find((o) => o.id === d.optionId) ?? null) : null;
}
const deps = { now, newId };

/** The unsaved map survives a reload in this tab (sessionStorage), and nowhere else. */
function loadDraft(): DecisionMap {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = DecisionMapSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    }
  } catch {
    // fall through to a new map
  }
  return emptyMap(deps);
}

function DecidePanel({ map, dispatch }: { map: DecisionMap; dispatch: (a: Action) => void }) {
  const [choice, setChoice] = useState<string>(
    map.decision?.kind === "option"
      ? map.decision.optionId
      : map.decision?.kind === "not-yet"
        ? "not-yet"
        : "",
  );
  const [note, setNote] = useState(map.decision?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const name = useId();
  const noteId = useId();
  const chosen = chosenOf(map);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!choice) return setError("Choose a path, or that you're not ready to decide yet.");
    dispatch({
      type: "decide",
      decision:
        choice === "not-yet"
          ? { kind: "not-yet", note }
          : { kind: "option", optionId: choice, note },
    });
    setError(null);
  }

  return (
    <section
      aria-labelledby="decide-title"
      className="rounded-2xl border border-gold/60 bg-accent-soft p-5"
    >
      <h2 id="decide-title" className="font-display text-2xl">
        5. My decision
      </h2>
      <p className="mt-1 text-sm">
        This is yours to make. The site doesn&apos;t rank the paths, judge anyone or predict what
        will happen. Not deciding yet is a real option too.
      </p>
      {map.decision && (
        <p role="status" className="mt-3 rounded-xl border border-line bg-card p-3">
          <strong>Recorded:</strong>{" "}
          {chosen ? `I choose “${chosen.title}”.` : "I'm not ready to decide yet."}
          {map.decision.note && (
            <span className="block text-sm text-muted">Note: {map.decision.note}</span>
          )}
        </p>
      )}
      <form onSubmit={submit} noValidate className="mt-3 space-y-3">
        <fieldset>
          <legend className="font-semibold">Where do I stand?</legend>
          <div className="mt-1 space-y-1">
            {map.options.map((o, i) => (
              <label key={o.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  checked={choice === o.id}
                  onChange={() => setChoice(o.id)}
                />
                Path {i + 1}: {o.title}
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={name}
                checked={choice === "not-yet"}
                onChange={() => setChoice("not-yet")}
              />
              I&apos;m not ready to decide yet
            </label>
          </div>
        </fieldset>
        <div>
          <label htmlFor={noteId} className="font-semibold">
            {choice === "not-yet"
              ? "What would help me decide?"
              : "Why, in my own words (optional)"}
          </label>
          <textarea
            id={noteId}
            value={note}
            maxLength={DHARMA_LIMITS.note}
            rows={2}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={buttonPrimary}>
            Record my decision
          </button>
          {map.decision && (
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => {
                dispatch({ type: "clearDecision" });
                setChoice("");
                setNote("");
              }}
            >
              Clear decision
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

/** Dharma Lab: think through a real decision; the person always decides. */
export function DharmaLab() {
  const [map, setMap] = useState<DecisionMap>(loadDraft);
  const [selected, setSelected] = useState<string | null>(map.options[0]?.id ?? null);
  const [newPath, setNewPath] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"save" | "delete" | "new" | "sankalpa" | null>(null);
  const [aiStatus, setAiStatus] = useState<{ ai: string | null; practice: boolean } | null>(null);
  const { journey } = useJourney();
  const saved = journey.decisions.some((d) => d.id === map.id);
  const base = useId();
  const perspectivesRef = useRef<HTMLDivElement>(null);

  const dispatch = (a: Action) => setMap((m) => reduce(m, a, deps));

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/chat", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAiStatus(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  // Keep the working copy in this tab; once saved, keep the saved copy in step too.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(map));
    } catch {
      // not critical
    }
    if (saved && journey.enabled) {
      const stored = journey.decisions.find((d) => d.id === map.id);
      if (stored && stored.updatedAt !== map.updatedAt) upsertDecision(map);
    }
  }, [map, saved, journey]);

  const selectedIndex = map.options.findIndex((o) => o.id === selected);
  const selectedOption = selectedIndex >= 0 ? map.options[selectedIndex] : null;
  const chosen = chosenOf(map);

  function selectPath(id: string) {
    setSelected(id);
    requestAnimationFrame(() =>
      perspectivesRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
    );
  }

  async function suggest() {
    if (!map.dilemma.trim()) return setMessage("Describe your decision first.");
    setSuggesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dharma-lab/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma: map.dilemma,
          values: map.values || undefined,
          limits: map.limits || undefined,
          existing: map.options.map((o) => o.title),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<OptionsResponse> & {
        error?: string;
      };
      if (!res.ok) return setMessage(data.error ?? "Something went wrong. Please try again.");
      if (data.mode === "crisis") return setMessage(data.crisisReply ?? null);
      if (data.options?.length) {
        const room = DHARMA_LIMITS.options - map.options.length;
        dispatch({ type: "addSuggested", options: data.options });
        setMessage(
          room < data.options.length
            ? `Added ${Math.max(room, 0)} of ${data.options.length} suggested paths (a map holds up to ${DHARMA_LIMITS.options}).`
            : `Added ${data.options.length} suggested paths. They're yours to edit, add to or remove.`,
        );
      } else setMessage(data.notice ?? "No paths came back. You can write your own.");
    } catch {
      setMessage("I couldn't reach the server. You can still write your own paths.");
    } finally {
      setSuggesting(false);
    }
  }

  function saveToJourney() {
    if (!journey.enabled) {
      if (!storageAvailable())
        return setMessage("This browser isn't letting the site save anything.");
      enableSaving();
    }
    upsertDecision(map);
    setDialog(null);
    setMessage("Saved in My Dharma Journey on this device. Changes are now saved as you go.");
  }

  function startNew() {
    setMap(emptyMap(deps));
    setSelected(null);
    setDialog(null);
    setMessage("Started a new decision.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Dharma Lab</h1>
        <p className="mt-2 text-muted">
          Think through a real decision: lay out the paths, see them side by side, hear how the
          companions see each one, and decide for yourself, or decide not to decide yet.
        </p>
        <p className="mt-2 text-sm text-muted">
          Nothing here predicts outcomes or tells you what to do. For health, legal, money or safety
          decisions, please also talk to a qualified person.
        </p>
      </header>

      {journey.decisions.length > 0 && (
        <details className="mt-4 rounded-2xl border border-line bg-card p-4">
          <summary className="cursor-pointer font-semibold">
            My saved decisions ({journey.decisions.length})
          </summary>
          <ul className="mt-2 space-y-1 text-sm">
            {journey.decisions.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {d.dilemma.slice(0, 80) || "(untitled)"}{" "}
                  <span className="text-muted">· {new Date(d.updatedAt).toLocaleDateString()}</span>
                </span>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => {
                    dispatch({ type: "load", map: d });
                    setSelected(d.options[0]?.id ?? null);
                    setMessage("Opened a saved decision.");
                  }}
                  aria-label={`Open saved decision: ${d.dilemma.slice(0, 60)}`}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-6 space-y-6">
        <section
          aria-labelledby="dilemma-title"
          className="rounded-2xl border border-line bg-card p-5"
        >
          <h2 id="dilemma-title" className="font-display text-2xl">
            1. My decision
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <label htmlFor={`${base}-d`} className="font-semibold">
                  What am I trying to decide?
                </label>
                <DictateButton
                  label="Speak it instead"
                  onText={(t) =>
                    dispatch({
                      type: "setText",
                      field: "dilemma",
                      value: `${map.dilemma} ${t}`.trim(),
                    })
                  }
                />
              </div>
              <textarea
                id={`${base}-d`}
                value={map.dilemma}
                maxLength={DHARMA_LIMITS.dilemma}
                rows={3}
                onChange={(e) =>
                  dispatch({ type: "setText", field: "dilemma", value: e.target.value })
                }
                placeholder="e.g. Should I take a job in another city or stay near my family?"
                className={inputClass}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor={`${base}-v`} className="font-semibold">
                  What matters to me <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id={`${base}-v`}
                  value={map.values}
                  maxLength={DHARMA_LIMITS.context}
                  rows={2}
                  onChange={(e) =>
                    dispatch({ type: "setText", field: "values", value: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${base}-l`} className="font-semibold">
                  My limits <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id={`${base}-l`}
                  value={map.limits}
                  maxLength={DHARMA_LIMITS.context}
                  rows={2}
                  onChange={(e) =>
                    dispatch({ type: "setText", field: "limits", value: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="paths-title" className="space-y-3">
          <h2 id="paths-title" className="font-display text-2xl">
            2. Paths I could take
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={buttonPrimary}
              onClick={suggest}
              disabled={suggesting || !aiStatus?.ai || map.options.length >= DHARMA_LIMITS.options}
            >
              {suggesting ? "Thinking…" : "Suggest 3 paths"}
            </button>
            <span className="text-xs text-muted">
              {!aiStatus?.ai
                ? "The AI isn't connected on this site; write your own paths below."
                : aiStatus.practice
                  ? "Practice mode: placeholder paths."
                  : "Sends your decision, values and limits to Google Gemini. Please leave out names and private details."}
            </span>
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPath.trim()) return setMessage("Write the path first.");
              dispatch({ type: "addOption", title: newPath });
              setNewPath("");
            }}
          >
            <label htmlFor={`${base}-n`} className="sr-only">
              A path of my own
            </label>
            <input
              id={`${base}-n`}
              value={newPath}
              maxLength={DHARMA_LIMITS.title}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="A path of my own, e.g. Talk to my parents first"
              className="min-w-64 flex-1 rounded-xl border-2 border-line bg-card p-2.5"
            />
            <button
              type="submit"
              className={buttonSecondary}
              disabled={map.options.length >= DHARMA_LIMITS.options}
            >
              Add my own path
            </button>
          </form>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
          {map.options.length > 0 && map.options.length < 3 && (
            <p className="text-sm text-muted">
              Try to consider at least three paths, for example waiting, or asking someone for help.
            </p>
          )}
          {map.options.length > 0 && (
            <ol className="space-y-3">
              {map.options.map((o, i) => (
                <PathCard
                  key={o.id}
                  option={o}
                  index={i}
                  selected={selected === o.id}
                  onSelect={() => selectPath(o.id)}
                  dispatch={dispatch}
                />
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="map-title" className="rounded-2xl border border-line bg-card p-4">
          <h2 id="map-title" className="font-display text-2xl">
            3. The map
          </h2>
          <p className="text-sm text-muted">
            Each branch is a path, with its upsides (+), downsides (−) and unknowns (?). Choose a
            branch to ask for perspectives on it.
          </p>
          <div className="mt-2">
            <DecisionMapSvg map={map} selectedId={selected} onSelect={selectPath} />
          </div>
        </section>

        <div ref={perspectivesRef} className="scroll-mt-20">
          {selectedOption ? (
            <PerspectivesPanel
              map={map}
              option={selectedOption}
              index={selectedIndex}
              dispatch={dispatch}
              aiStatus={aiStatus}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
              4. Perspectives: add a path, then select it to ask a companion about it.
            </p>
          )}
        </div>

        {map.options.length > 0 && (
          <DecidePanel
            key={`${map.id}-${map.decision ? "d" : "n"}`}
            map={map}
            dispatch={dispatch}
          />
        )}

        <section
          aria-labelledby="keep-title"
          className="rounded-2xl border border-line bg-card p-5"
        >
          <h2 id="keep-title" className="font-display text-2xl">
            6. Keep or clear
          </h2>
          <p className="mt-1 text-sm text-muted">
            {saved
              ? "Saved in My Dharma Journey on this device; changes are saved as you go."
              : "Not saved: this map lives only in this browser tab until you save it."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!saved && (
              <button
                type="button"
                className={buttonPrimary}
                onClick={() => (journey.enabled ? saveToJourney() : setDialog("save"))}
                disabled={!map.dilemma.trim()}
              >
                Save in My Dharma Journey
              </button>
            )}
            {chosen?.firstStep && (
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => setDialog("sankalpa")}
              >
                Make my first step a Sankalpa
              </button>
            )}
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                downloadFile(
                  `dharma-lab-${localDate()}.json`,
                  JSON.stringify(
                    { app: "sanatana-ai", kind: "dharma-lab-map", version: 1, map },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              Export this map
            </button>
            <button type="button" className={buttonSecondary} onClick={() => setDialog("new")}>
              Start a new decision
            </button>
            {saved && (
              <button type="button" className={buttonDanger} onClick={() => setDialog("delete")}>
                Delete this saved map
              </button>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">
            Export or delete everything you&apos;ve saved in{" "}
            <Link href="/my-journey?tab=data" className="underline">
              My data
            </Link>
            .
          </p>
        </section>
      </div>

      {dialog === "save" && (
        <Dialog title="Save this decision on this device?" onClose={() => setDialog(null)}>
          <ConsentText />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={buttonSecondary} onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button type="button" className={buttonPrimary} onClick={saveToJourney} data-autofocus>
              Turn on saving and save
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "new" && (
        <Dialog
          title="Start a new decision?"
          description={
            saved
              ? "This map stays saved in My Dharma Journey."
              : "This map isn't saved; it will be cleared."
          }
          onClose={() => setDialog(null)}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setDialog(null)}
              data-autofocus
            >
              Cancel
            </button>
            <button
              type="button"
              className={saved ? buttonPrimary : buttonDanger}
              onClick={startNew}
            >
              Start new
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "delete" && (
        <Dialog
          title="Delete this saved map?"
          description="It will be removed from this browser."
          onClose={() => setDialog(null)}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setDialog(null)}
              data-autofocus
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonDanger}
              onClick={() => {
                removeItem("decisions", map.id);
                startNew();
                setMessage("The saved map was deleted.");
              }}
            >
              Delete map
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "sankalpa" && chosen && (
        <Dialog
          title="Make my first step a Sankalpa"
          description={chosen.firstStep}
          onClose={() => setDialog(null)}
        >
          {!journey.enabled && <ConsentText />}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={buttonSecondary} onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={buttonPrimary}
              data-autofocus
              onClick={() => {
                if (!journey.enabled) enableSaving();
                addItem("sankalpas", {
                  text: chosen.firstStep.slice(0, 200),
                  schedule: { kind: "once", date: localDate() },
                  status: "active",
                  done: [],
                });
                setDialog(null);
                setMessage("Added to Daily Sankalpa for today.");
              }}
            >
              {journey.enabled ? "Add for today" : "Turn on saving and add"}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
