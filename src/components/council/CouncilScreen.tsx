"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { CouncilAnswer, CouncilResponse } from "@/app/api/council/route";
import { ArchAvatar } from "@/components/ArchAvatar";
import { ThreadPassage } from "@/components/chat/ThreadPassage";
import { getCompanion, type CompanionId } from "@/lib/companions";
import { COUNCIL_ORDER, MAX_QUESTION } from "@/lib/council/council";
import type { SpeechOutputAdapter } from "@/lib/speech/types";
import { SPEECH_LANG, VOICE_SETTINGS } from "@/lib/speech/voices";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";

export const EXAMPLE_QUESTIONS = [
  "How do I handle anger towards someone I love?",
  "How can I find courage to start something new?",
  "What should I do when my hard work isn't recognised?",
] as const;

const SPEECH_UNSUPPORTED =
  "Spoken answers aren't available in this browser. You can still read every answer here.";

type Status = "idle" | "asking" | "done" | "error";

export function CouncilScreen({ speechOutput }: { speechOutput?: SpeechOutputAdapter } = {}) {
  const [output] = useState(() => speechOutput ?? createWebSpeechOutput());
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<CompanionId | null>(null);
  const [aiStatus, setAiStatus] = useState<{ ai: string | null; practice: boolean } | null>(null);
  const pending = useRef<AbortController | null>(null);
  const queue = useRef<CompanionId[]>([]);
  const inputId = useId();
  const errorId = useId();
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  // When the answers arrive, bring them into view (they start below the question on phones)
  // and move keyboard/screen-reader focus to them.
  useEffect(() => {
    if (status !== "done" || !resultsHeading.current) return;
    resultsHeading.current.focus({ preventScroll: true });
    resultsHeading.current.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [status]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/chat", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAiStatus(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(
    () => () => {
      pending.current?.abort();
      output.stop();
    },
    [output],
  );

  /* ---------- Speech: one answer, or all four in turn ---------- */

  function stopSpeaking() {
    queue.current = [];
    output.stop();
    setSpeaking(null);
  }

  function speakNext(answers: CouncilAnswer[]) {
    const id = queue.current.shift();
    const answer = answers.find((a) => a.companion === id);
    if (!id || !answer?.reply) {
      setSpeaking(null);
      return;
    }
    setSpeaking(id);
    output.speak(`${getCompanion(id).name}. ${answer.reply}`, {
      ...VOICE_SETTINGS[id],
      lang: SPEECH_LANG,
      onStart: () => setSpeaking(id),
      onEnd: () => speakNext(answers),
      onError: () => {
        queue.current = [];
        setSpeaking(null);
        setNotice("The answers couldn't be spoken. You can still read them here.");
      },
    });
  }

  function listen(ids: CompanionId[]) {
    if (!result) return;
    if (!output.isSupported()) {
      setNotice(SPEECH_UNSUPPORTED);
      return;
    }
    // Clear the queue before stopping: stopping fires "end", which would continue the old queue.
    queue.current = [];
    output.stop();
    queue.current = ids.filter((id) => result.answers.some((a) => a.companion === id && a.reply));
    speakNext(result.answers);
  }

  /* ---------- Asking ---------- */

  function ask(e?: FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q) {
      setError("Write a question first.");
      return;
    }
    if (q.length > MAX_QUESTION) {
      setError(`Questions can be up to ${MAX_QUESTION} characters. Shorten it a little.`);
      return;
    }
    if (status === "asking") return;
    stopSpeaking();
    setError(null);
    setNotice(null);
    setStatus("asking");
    setAsked(q);
    setResult(null);
    const ctrl = new AbortController();
    pending.current = ctrl;
    fetch("/api/council", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }
        setResult(data as CouncilResponse);
        setStatus("done");
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError("I couldn't reach the server. Please check your connection and try again.");
        setStatus("error");
      })
      .finally(() => {
        if (pending.current === ctrl) pending.current = null;
      });
  }

  const remaining = MAX_QUESTION - question.length;
  const spoken = result?.answers.filter((a) => a.reply).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Divine Council</h1>
        <p className="mt-2 text-muted">
          Ask one question and compare four separate answers. Each companion answers on its own,
          from its own scriptures, and cites the passages it draws on.
        </p>
        <p className="mt-2 text-sm text-muted">
          These are AI simulations inspired by tradition, not the deities. Not a substitute for
          professional help.
          {aiStatus && (
            <span className="ml-2 inline-block rounded-full border border-gold/60 bg-accent-soft px-2 py-0.5 text-xs text-ink">
              {aiStatus.practice
                ? "Practice mode (no real AI)"
                : aiStatus.ai
                  ? `AI: ${aiStatus.ai}`
                  : "AI not connected: scripture passages only"}
            </span>
          )}
        </p>
      </header>

      <form onSubmit={ask} className="mt-6 max-w-3xl" noValidate>
        <label htmlFor={inputId} className="font-semibold">
          Your question for the Council
        </label>
        <textarea
          id={inputId}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) ask(e);
          }}
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder="e.g. How do I stay calm when everything feels uncertain?"
          className="mt-2 w-full resize-y rounded-2xl border-2 border-line bg-card p-3 focus:border-accent focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" aria-label="Example questions">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                className="rounded-full border border-line px-3 py-1 text-xs hover:bg-accent-soft"
              >
                {q}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={status === "asking"}
            className="rounded-full bg-accent px-5 py-2 font-semibold text-on-accent hover:opacity-90 disabled:opacity-60"
          >
            {status === "asking" ? "Asking…" : "Ask the Council"}
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          Enter to ask · {remaining < 200 ? `${remaining} characters left · ` : ""}
          Your question goes to our server and{" "}
          {aiStatus?.ai && !aiStatus.practice
            ? "Google Gemini (free tier: Google may use it to improve its products). Please don't share private details."
            : "is not stored."}{" "}
          One Council question counts as 5 messages towards the daily limit.
        </p>
      </form>

      <div aria-live="polite" className="sr-only">
        {status === "asking"
          ? "The Council is reflecting on your question."
          : status === "done"
            ? "The Council has answered."
            : ""}
      </div>

      {status === "asking" && (
        <section aria-label="The Council is reflecting" className="mt-8">
          <p className="text-sm text-muted">The Council is reflecting… this takes 10–20 seconds.</p>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {COUNCIL_ORDER.map((id) => (
              <li key={id} data-companion={id} className="flex justify-center">
                <ArchAvatar
                  companionId={id}
                  state="thinking"
                  size="sm"
                  showState={false}
                  animated
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {notice && (
        <p role="status" className="mt-6 text-sm text-muted">
          {notice}
        </p>
      )}

      {result?.mode === "crisis" && (
        <section className="mt-8 max-w-3xl rounded-2xl border border-line bg-card p-5">
          <p className="mb-2">
            <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
              Support resources
            </span>
          </p>
          <p>{result.crisisReply}</p>
        </section>
      )}

      {result && result.mode !== "crisis" && (
        <section aria-labelledby="council-answers" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="council-answers"
              ref={resultsHeading}
              tabIndex={-1}
              className="scroll-mt-20 font-display text-2xl focus:outline-none"
            >
              The Council on: <span className="italic">“{asked}”</span>
            </h2>
            {spoken > 0 &&
              (speaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
                >
                  ■ Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => listen(COUNCIL_ORDER)}
                  className="rounded-full border border-line px-4 py-2 text-sm hover:bg-accent-soft"
                >
                  ▶ Listen to all, in turn
                </button>
              ))}
          </div>
          {result.notice && <p className="mt-2 text-sm text-muted">{result.notice}</p>}
          <p className="mt-1 text-xs text-muted">
            Truth Lens: <span aria-hidden="true">📜</span> verified scripture ·{" "}
            <span aria-hidden="true">💭</span> AI interpretation ·{" "}
            <span aria-hidden="true">🌱</span> AI suggestion
          </p>

          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {result.answers.map((a) => (
              <CouncilCard
                key={a.companion}
                answer={a}
                practice={Boolean(result.practice)}
                speaking={speaking === a.companion}
                onListen={() => (speaking === a.companion ? stopSpeaking() : listen([a.companion]))}
              />
            ))}
          </ul>

          {result.synthesis && (
            <section
              aria-labelledby="council-compare"
              className="mt-6 rounded-2xl border border-dashed border-line bg-card p-5"
            >
              <h2 id="council-compare" className="font-display text-2xl">
                Where they agree and differ
              </h2>
              <p className="mt-1 text-xs text-muted">
                AI comparison of the answers above, written only from what they say. Not scripture,
                and not a verdict on who is right.
              </p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Common ground</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                    {result.synthesis.agree.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Different emphases</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                    {result.synthesis.differ.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}

function CouncilCard({
  answer,
  practice,
  speaking,
  onListen,
}: {
  answer: CouncilAnswer;
  practice: boolean;
  speaking: boolean;
  onListen: () => void;
}) {
  const c = getCompanion(answer.companion);
  const headingId = `council-${c.id}`;
  return (
    <li
      data-companion={c.id}
      className={`rounded-2xl border bg-card p-4 ${speaking ? "border-accent ring-2 ring-accent/40" : "border-line"}`}
    >
      <article aria-labelledby={headingId}>
        <div className="flex gap-4">
          <div className="shrink-0">
            <ArchAvatar
              companionId={c.id}
              state={speaking ? "speaking" : "idle"}
              size="sm"
              showState={false}
              caption={false}
              animated
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={headingId} className="font-display text-2xl text-accent">
              {c.name}
            </h3>
            <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
              {answer.mode === "ai" ? (
                <span className="rounded-full border border-line px-2 py-0.5 text-muted">
                  AI interpretation{practice ? " · practice mode" : ""}
                </span>
              ) : (
                <span className="rounded-full border border-line px-2 py-0.5 text-muted">
                  Passages only
                </span>
              )}
              {answer.mode === "ai" && answer.grounded === false && (
                <span className="rounded-full border border-line px-2 py-0.5 text-muted">
                  No passage directly addresses this: reflection only
                </span>
              )}
            </p>
            {answer.reply ? (
              <p className="mt-2 whitespace-pre-wrap">{answer.reply}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Passages from {c.name}&apos;s texts related to your question:
              </p>
            )}
            {answer.reply && (
              <button
                type="button"
                onClick={onListen}
                aria-label={
                  speaking ? `Stop reading ${c.name}'s answer` : `Listen to ${c.name}'s answer`
                }
                className="mt-2 rounded-full border border-line px-3 py-1 text-xs hover:bg-accent-soft"
              >
                {speaking ? "■ Stop" : "▶ Listen"}
              </button>
            )}
          </div>
        </div>
        {answer.citations.length > 0 && (
          <section aria-label={`${c.name}'s wisdom thread`} className="mt-3">
            <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">
              Wisdom thread
            </h4>
            <ul className="mt-1.5 space-y-2">
              {answer.citations.map((ct) => (
                <ThreadPassage
                  key={ct.id}
                  passage={ct.passage}
                  how={ct.how}
                  reflection={ct.reflection}
                />
              ))}
            </ul>
          </section>
        )}
        {answer.related.length > 0 && (
          <details className="mt-3" open={answer.mode !== "ai"}>
            <summary className="cursor-pointer text-xs font-semibold text-muted">
              {answer.mode === "ai" ? "More passages to explore" : "Related passages"}
            </summary>
            <ul className="mt-1.5 space-y-2">
              {answer.related.map((p) => (
                <ThreadPassage key={p.id} passage={p} />
              ))}
            </ul>
          </details>
        )}
      </article>
    </li>
  );
}
