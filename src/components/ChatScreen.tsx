"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  COMPANIONS,
  DEFAULT_COMPANION_ID,
  getCompanion,
  isCompanionId,
  type CompanionId,
} from "@/lib/companions";
import { STORAGE_KEYS } from "@/lib/site";
import type { SpeechInputAdapter, SpeechOutputAdapter } from "@/lib/speech/types";
import { SPEECH_INPUT_MESSAGES, SPEECH_LANG, VOICE_SETTINGS } from "@/lib/speech/voices";
import { createWebSpeechInput } from "@/lib/speech/webSpeechInput";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";
import type { ChatResponse, LinkedPassage } from "@/app/api/chat/route";
import { ArchAvatar, VoiceWaveform, type AvatarState } from "./ArchAvatar";
import { HandoffDialog, type HandoffCandidate } from "./chat/HandoffDialog";
import { ThreadPassage } from "./chat/ThreadPassage";

export const MAX_MESSAGE_LENGTH = 2000;

/** Shown when the server cannot be reached at all. */
export const OFFLINE_REPLY =
  "I couldn't reach the server, so I can't answer right now. Please check your connection and try again.";

/** Text of the scripture-only reply when no AI is connected (the notice comes from the server). */
export const SCRIPTURE_ONLY_INTRO = "Here are passages from the library related to what you wrote.";

const SPEECH_OUTPUT_UNSUPPORTED =
  "Spoken replies aren't available in this browser. You can still read every reply here.";

type Message =
  | { id: number; role: "user"; text: string }
  | {
      id: number;
      role: "companion";
      companionId: CompanionId;
      text: string;
      /** The opening greeting (UI text, not sent to the AI as conversation). */
      greeting?: boolean;
      kind?: ChatResponse["mode"] | "offline";
      grounded?: boolean;
      practice?: boolean;
      citations?: ChatResponse["citations"];
      related?: LinkedPassage[];
      notice?: string;
    }
  | {
      id: number;
      /** Companion Handoff divider: who took over and what the person chose to share. */
      role: "handoff";
      from: CompanionId;
      to: CompanionId;
      shared: { role: "user" | "companion"; text: string }[];
    };

type CompanionMessage = Extract<Message, { role: "companion" }>;

function readSavedCompanion(): CompanionId | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.companion);
    return isCompanionId(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveCompanion(id: CompanionId) {
  try {
    localStorage.setItem(STORAGE_KEYS.companion, id);
  } catch {
    // Not critical: the choice simply isn't remembered next visit.
  }
}

function joinText(...parts: string[]) {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

export function ChatScreen({
  speechInput,
  speechOutput,
}: {
  /** Optional replacements for the browser speech engines (used by tests). */
  speechInput?: SpeechInputAdapter;
  speechOutput?: SpeechOutputAdapter;
} = {}) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("companion");

  const [input] = useState(() => speechInput ?? createWebSpeechInput());
  const [output] = useState(() => speechOutput ?? createWebSpeechOutput());

  const [companionId, setCompanionId] = useState<CompanionId>(() =>
    isCompanionId(fromUrl) ? fromUrl : (readSavedCompanion() ?? DEFAULT_COMPANION_ID),
  );
  const nextId = useRef(1);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0,
      role: "companion",
      companionId,
      text: getCompanion(companionId).greeting,
      greeting: true,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [handoffTo, setHandoffTo] = useState<CompanionId | null>(null);

  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AbortController | null>(null);
  const [aiStatus, setAiStatus] = useState<{ ai: string | null; practice: boolean } | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const errorId = useId();
  const panelId = useId();

  const companion = getCompanion(companionId);
  const avatarState: AvatarState = errorFlash
    ? "error"
    : listening
      ? "listening"
      : thinking
        ? "thinking"
        : speakingId !== null
          ? "speaking"
          : "idle";

  useEffect(() => {
    saveCompanion(companionId);
  }, [companionId]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/chat", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAiStatus(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    // Scroll only the message list, never the whole page.
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, thinking]);

  // Stop timers, speech and listening when leaving the page.
  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
      pending.current?.abort();
      input.stop();
      output.stop();
    },
    [input, output],
  );

  function newId() {
    return nextId.current++;
  }

  function flashError() {
    setErrorFlash(true);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorFlash(false), 3000);
  }

  /* ---------- Speaking (text-to-speech) ---------- */

  function stopSpeaking() {
    output.stop();
    setSpeakingId(null);
  }

  function speak(m: CompanionMessage) {
    if (!output.isSupported()) {
      setNotice(SPEECH_OUTPUT_UNSUPPORTED);
      return;
    }
    stopListening();
    setSpeakingId(m.id);
    output.speak(m.text, {
      ...VOICE_SETTINGS[m.companionId],
      lang: SPEECH_LANG,
      onStart: () => setSpeakingId(m.id),
      onEnd: () => setSpeakingId((current) => (current === m.id ? null : current)),
      onError: () => {
        setSpeakingId(null);
        setNotice("The reply couldn't be spoken. You can still read it here.");
        flashError();
      },
    });
  }

  function toggleSpeakReplies() {
    if (speakReplies) {
      stopSpeaking();
      setSpeakReplies(false);
      return;
    }
    if (!output.isSupported()) {
      setNotice(SPEECH_OUTPUT_UNSUPPORTED);
      return;
    }
    setSpeakReplies(true);
    setNotice("New replies will be read aloud. Turn this off any time to mute.");
  }

  /* ---------- Listening (speech-to-text) ---------- */

  function stopListening() {
    input.stop();
    setListening(false);
  }

  function toggleMic() {
    if (listening) {
      stopListening();
      return;
    }
    if (!input.isSupported()) {
      setNotice(SPEECH_INPUT_MESSAGES.unsupported);
      return;
    }
    stopSpeaking();
    setError(null);
    const base = draft;
    let finals = "";
    setListening(true);
    setNotice(
      "Listening… Speak now. Your words appear in the box so you can check and edit them before sending.",
    );
    input.start(SPEECH_LANG, {
      onInterim: (text) => setDraft(joinText(base, finals, text)),
      onFinal: (text) => {
        finals = joinText(finals, text);
        setDraft(joinText(base, finals));
      },
      onError: (code) => {
        setNotice(SPEECH_INPUT_MESSAGES[code]);
        if (code !== "no-speech") flashError();
      },
      onEnd: () => setListening(false),
    });
  }

  /* ---------- Conversation ---------- */

  /** Real exchanges with the current companion since the last switch (no greetings or errors). */
  function currentExchanges(list: Message[] = messages): HandoffCandidate[] {
    const lastHandoff = list.map((m) => m.role).lastIndexOf("handoff");
    return list
      .slice(lastHandoff + 1)
      .filter(
        (m): m is Extract<Message, { role: "user" }> | CompanionMessage =>
          m.role === "user" || (m.role === "companion" && m.kind === "ai"),
      )
      .map((m) => ({ id: m.id, role: m.role, text: m.text }))
      .slice(-10);
  }

  function switchCompanion(id: CompanionId) {
    if (id === companionId) return;
    // With nothing to share there is nothing to decide: switch straight away.
    if (currentExchanges().length === 0) completeSwitch(id, []);
    else setHandoffTo(id);
  }

  function completeSwitch(id: CompanionId, sharedIds: number[]) {
    pending.current?.abort();
    setThinking(false);
    stopSpeaking();
    stopListening();
    setHandoffTo(null);
    const shared = currentExchanges()
      .filter((m) => sharedIds.includes(m.id))
      .map(({ role, text }) => ({ role, text }));
    const from = companionId;
    setCompanionId(id);
    setMessages((m) => [
      ...m,
      { id: newId(), role: "handoff", from, to: id, shared },
      {
        id: newId(),
        role: "companion",
        companionId: id,
        text: getCompanion(id).greeting,
        greeting: true,
      },
    ]);
  }

  function send() {
    const text = draft.trim();
    if (!text) {
      setError("Write a message first.");
      return;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Messages can be up to ${MAX_MESSAGE_LENGTH} characters. Shorten it a little.`);
      return;
    }
    if (thinking) return;

    stopListening();
    stopSpeaking();
    setError(null);
    setNotice(null);
    setDraft("");
    setMessages((m) => [...m, { id: newId(), role: "user", text }]);
    setThinking(true);

    const speaker = companionId;
    const shouldSpeak = speakReplies;
    // This companion's conversation since the last switch (real exchanges only, no greetings),
    // plus whatever the person chose to share at that switch.
    const history = currentExchanges().map(({ role, text }) => ({ role, text }));
    const handoff = messages.findLast(
      (m): m is Extract<Message, { role: "handoff" }> => m.role === "handoff",
    );
    const shared =
      handoff && handoff.shared.length > 0
        ? { from: handoff.from, messages: handoff.shared }
        : undefined;
    const ctrl = new AbortController();
    pending.current = ctrl;

    const finish = (reply: CompanionMessage) => {
      if (ctrl.signal.aborted) return;
      setMessages((m) => [...m, reply]);
      setThinking(false);
      pending.current = null;
      if (shouldSpeak) speak(reply);
    };

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companion: speaker,
        messages: [...history, { role: "user", text }],
        ...(shared && { shared }),
      }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setThinking(false);
          pending.current = null;
          return;
        }
        const r = data as ChatResponse;
        finish({
          id: newId(),
          role: "companion",
          companionId: speaker,
          kind: r.mode,
          text: r.reply ?? (r.notice ? "" : SCRIPTURE_ONLY_INTRO),
          grounded: r.grounded,
          practice: r.practice,
          citations: r.citations,
          related: r.related,
          notice: r.notice,
        });
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        finish({
          id: newId(),
          role: "companion",
          companionId: speaker,
          kind: "offline",
          text: OFFLINE_REPLY,
        });
      });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    pending.current?.abort();
    stopSpeaking();
    stopListening();
    setThinking(false);
    setMessages([
      { id: newId(), role: "companion", companionId, text: companion.greeting, greeting: true },
    ]);
  }

  const remaining = MAX_MESSAGE_LENGTH - draft.length;

  return (
    <div
      data-companion={companionId}
      className="mx-auto grid max-w-7xl gap-0 md:h-[calc(100dvh-4rem)] md:grid-cols-[320px_minmax(0,1fr)]"
    >
      <h1 className="sr-only">Chat with {companion.name}</h1>

      {/* Left: companion panel (collapsible on phones) */}
      <section
        aria-label="Companion"
        className="border-b border-line bg-card-2 md:overflow-y-auto md:border-r md:border-b-0"
      >
        <div className="flex items-center justify-between px-4 py-2 md:hidden">
          <span className="font-display text-lg font-semibold">{companion.name}</span>
          <button
            type="button"
            aria-expanded={panelOpen}
            aria-controls={panelId}
            onClick={() => setPanelOpen((o) => !o)}
            className="rounded-full border border-line px-3 py-1 text-sm"
          >
            {panelOpen ? "Hide companion" : "Show companion"}
          </button>
        </div>
        <div
          id={panelId}
          className={`${panelOpen ? "flex" : "hidden"} flex-col items-center gap-3 px-4 pt-2 pb-4 md:flex md:gap-5 md:py-6`}
        >
          <ArchAvatar companionId={companionId} state={avatarState} size="responsive" />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              aria-pressed={speakReplies}
              onClick={toggleSpeakReplies}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                speakReplies ? "border-accent bg-accent-soft text-accent" : "border-line bg-card"
              }`}
            >
              {speakReplies ? "Speak replies: on" : "Speak replies: off"}
            </button>
            {speakingId !== null && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="rounded-full bg-accent px-3 py-1.5 text-sm text-on-accent"
              >
                Stop speaking
              </button>
            )}
          </div>

          <fieldset className="w-full">
            <legend className="sr-only md:not-sr-only md:mb-2 md:block md:w-full md:text-center md:text-sm md:font-semibold">
              Choose a companion
            </legend>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
              {COMPANIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-companion={c.id}
                  aria-pressed={c.id === companionId}
                  onClick={() => switchCompanion(c.id)}
                  className={`rounded-full border px-2 py-1.5 text-sm md:px-3 ${
                    c.id === companionId
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-card text-ink hover:border-accent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-center text-xs text-muted">
            AI simulation inspired by tradition, not the deity. Not a substitute for professional
            help. Mouth movement is approximate.
          </p>
        </div>
      </section>

      {/* Right: conversation */}
      <section aria-label="Conversation" className="flex min-h-[70dvh] flex-col md:min-h-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm">
            Talking with <span className="font-semibold text-accent">{companion.name}</span>
            {aiStatus && (
              <span className="ml-2 rounded-full border border-gold/60 bg-leaf px-2 py-0.5 text-xs text-leaf-ink">
                {aiStatus.practice
                  ? "Practice mode (no real AI)"
                  : aiStatus.ai
                    ? `AI: ${aiStatus.ai}`
                    : "AI not connected: scripture search only"}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={clearChat}
            className="text-sm text-muted underline hover:text-ink"
          >
            Clear chat
          </button>
        </div>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Messages"
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <ol className="space-y-4">
            {messages.map((m) => {
              if (m.role === "handoff") {
                const n = m.shared.length;
                return (
                  <li key={m.id} className="flex items-center gap-3 text-xs text-muted">
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    <span className="text-center">
                      Now talking with{" "}
                      <strong className="text-ink">{getCompanion(m.to).name}</strong> ·{" "}
                      {n > 0
                        ? `${n} ${n === 1 ? "message" : "messages"} shared from ${getCompanion(m.from).name}`
                        : `started fresh (nothing shared from ${getCompanion(m.from).name})`}
                    </span>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  </li>
                );
              }
              if (m.role === "user") {
                return (
                  <li key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft px-4 py-2.5 whitespace-pre-wrap">
                      <span className="sr-only">You: </span>
                      {m.text}
                    </div>
                  </li>
                );
              }
              const speaker = getCompanion(m.companionId);
              const isSpeaking = speakingId === m.id;
              return (
                <li key={m.id} className="flex justify-start" data-companion={m.companionId}>
                  <div
                    className={`max-w-[85%] rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 ${
                      isSpeaking ? "border-accent ring-2 ring-accent/40" : "border-line"
                    }`}
                  >
                    <p className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-accent">
                      {speaker.name}
                      {m.kind === "ai" && (
                        <span className="rounded-full border border-line px-2 py-0.5 font-normal text-muted">
                          AI interpretation{m.practice ? " · practice mode" : ""}
                        </span>
                      )}
                      {m.kind === "ai" && !m.grounded && (
                        <span className="rounded-full border border-gold/60 bg-leaf px-2 py-0.5 font-normal text-leaf-ink">
                          No passage directly addresses this: reflection only
                        </span>
                      )}
                      {m.kind === "crisis" && (
                        <span className="rounded-full border border-line px-2 py-0.5 font-normal text-muted">
                          Support resources
                        </span>
                      )}
                      {isSpeaking && <VoiceWaveform active />}
                    </p>
                    {m.notice && <p className="mb-1.5 text-sm text-muted">{m.notice}</p>}
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                    {m.citations && m.citations.length > 0 && (
                      <section
                        aria-label="Wisdom thread: passages this reply draws on"
                        className="mt-3"
                      >
                        <h3 className="font-sans text-xs font-semibold tracking-wide text-muted uppercase">
                          Wisdom thread
                        </h3>
                        <p className="mt-0.5 text-xs text-muted">
                          Truth Lens: <span aria-hidden="true">📜</span> verified scripture ·{" "}
                          <span aria-hidden="true">💭</span> AI interpretation ·{" "}
                          <span aria-hidden="true">🌱</span> AI suggestion
                        </p>
                        <ul className="mt-1.5 space-y-2">
                          {m.citations.map((c) => (
                            <ThreadPassage
                              key={c.id}
                              passage={c.passage}
                              how={c.how}
                              reflection={c.reflection}
                            />
                          ))}
                        </ul>
                      </section>
                    )}
                    {m.related && m.related.length > 0 && (
                      <details className="mt-3" open={m.kind !== "ai"}>
                        <summary className="cursor-pointer text-xs font-semibold text-muted">
                          {m.kind === "ai" ? "More passages to explore" : "Related passages"}
                        </summary>
                        <ul className="mt-1.5 space-y-2">
                          {m.related.map((p) => (
                            <ThreadPassage key={p.id} passage={p} />
                          ))}
                        </ul>
                      </details>
                    )}
                    <button
                      type="button"
                      onClick={() => (isSpeaking ? stopSpeaking() : speak(m))}
                      aria-label={
                        isSpeaking
                          ? `Stop reading ${speaker.name}'s reply`
                          : `Listen to ${speaker.name}'s reply`
                      }
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden="true">{isSpeaking ? "■" : "▶"}</span>
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                  </div>
                </li>
              );
            })}
            {thinking && (
              <li className="flex justify-start" aria-label={`${companion.name} is thinking`}>
                <div
                  className="flex gap-1.5 rounded-2xl border border-line bg-card px-4 py-3"
                  aria-hidden="true"
                >
                  <span className="thinking-dot h-2 w-2 rounded-full bg-accent" />
                  <span className="thinking-dot h-2 w-2 rounded-full bg-accent [animation-delay:150ms]" />
                  <span className="thinking-dot h-2 w-2 rounded-full bg-accent [animation-delay:300ms]" />
                </div>
              </li>
            )}
          </ol>
        </div>

        <form
          onSubmit={onSubmit}
          className="sticky bottom-0 border-t border-line bg-paper px-4 py-3"
          noValidate
        >
          <label htmlFor={inputId} className="sr-only">
            Message {companion.name}
          </label>
          <div className="flex items-end gap-2 rounded-2xl border border-accent bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <textarea
              id={inputId}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder={`Type or speak to ${companion.name}…`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="composer-input max-h-40 min-h-11 flex-1 resize-y bg-transparent py-1.5 placeholder:text-muted"
            />
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={listening}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                listening
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line text-accent hover:border-accent"
              }`}
            >
              {listening && (
                <span
                  aria-hidden="true"
                  className="aura aura-fast absolute -inset-1 rounded-full border-2 border-accent"
                />
              )}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-90"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="mt-1.5 flex min-h-5 justify-between gap-4 text-xs">
            <span>
              {error && (
                <span id={errorId} role="alert" className="text-red-700 dark:text-red-300">
                  {error}
                </span>
              )}
              {!error && notice && (
                <span role="status" className="text-muted">
                  {notice}
                </span>
              )}
              {!error && !notice && (
                <span className="text-muted">
                  Enter to send ·{" "}
                  {aiStatus?.ai && !aiStatus.practice
                    ? "Messages go to our server and Google Gemini (free tier: Google may use them to improve its products). Please don't share private details."
                    : "Messages go only to our server, to find passages. Nothing is stored."}
                </span>
              )}
            </span>
            {remaining < 200 && (
              <span className={remaining < 0 ? "text-red-700 dark:text-red-300" : "text-muted"}>
                {remaining} characters left
              </span>
            )}
          </div>
        </form>
      </section>
      {handoffTo && (
        <HandoffDialog
          from={companion}
          to={getCompanion(handoffTo)}
          candidates={currentExchanges()}
          onShare={(ids) => completeSwitch(handoffTo, ids)}
          onFresh={() => completeSwitch(handoffTo, [])}
          onCancel={() => setHandoffTo(null)}
        />
      )}
    </div>
  );
}
