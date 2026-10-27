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
import { ArchAvatar, type AvatarState } from "./ArchAvatar";

export const MAX_MESSAGE_LENGTH = 2000;

/** Text of the honest reply shown until the AI is connected in Phase 4. */
export const NOT_CONNECTED_REPLY =
  "I'm not connected to the AI yet, so I can't give you a real answer. Scripture-grounded replies arrive in Phase 4. Your message stayed in this browser tab and was not sent anywhere.";

type Message =
  | { id: number; role: "user"; text: string }
  | {
      id: number;
      role: "companion";
      companionId: CompanionId;
      text: string;
      notConnected?: boolean;
    }
  | { id: number; role: "notice"; text: string };

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

export function ChatScreen() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("companion");

  const [companionId, setCompanionId] = useState<CompanionId>(() =>
    isCompanionId(fromUrl) ? fromUrl : (readSavedCompanion() ?? DEFAULT_COMPANION_ID),
  );
  const nextId = useRef(1);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, role: "companion", companionId, text: getCompanion(companionId).greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [panelOpen, setPanelOpen] = useState(true);

  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const errorId = useId();
  const panelId = useId();

  const companion = getCompanion(companionId);
  const thinking = avatarState === "thinking";

  useEffect(() => {
    saveCompanion(companionId);
  }, [companionId]);

  useEffect(() => {
    // Scroll only the message list, never the whole page.
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, thinking]);

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    [],
  );

  function newId() {
    return nextId.current++;
  }

  function switchCompanion(id: CompanionId) {
    if (id === companionId) return;
    setCompanionId(id);
    setMessages((m) => [
      ...m,
      {
        id: newId(),
        role: "notice",
        text: `You're now talking with ${getCompanion(id).name}. Choosing what earlier context to share arrives in Phase 5.`,
      },
      { id: newId(), role: "companion", companionId: id, text: getCompanion(id).greeting },
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

    setError(null);
    setDraft("");
    setMessages((m) => [...m, { id: newId(), role: "user", text }]);
    setAvatarState("thinking");

    const speaker = companionId;
    replyTimer.current = setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "companion",
          companionId: speaker,
          text: NOT_CONNECTED_REPLY,
          notConnected: true,
        },
      ]);
      setAvatarState("idle");
    }, 700);
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
    setAvatarState("idle");
    setMessages([{ id: newId(), role: "companion", companionId, text: companion.greeting }]);
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
          <p className="hidden max-w-60 text-center text-xs text-muted md:block">
            Animated portrait and spoken replies arrive in Phase 2.
          </p>
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
            help.
          </p>
        </div>
      </section>

      {/* Right: conversation */}
      <section aria-label="Conversation" className="flex min-h-[70dvh] flex-col md:min-h-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm">
            Talking with <span className="font-semibold text-accent">{companion.name}</span>
            <span className="ml-2 rounded-full border border-gold/60 bg-leaf px-2 py-0.5 text-xs text-leaf-ink">
              AI not connected yet
            </span>
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
              if (m.role === "notice") {
                return (
                  <li key={m.id} className="text-center text-xs text-muted">
                    {m.text}
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
              return (
                <li key={m.id} className="flex justify-start" data-companion={m.companionId}>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-2.5">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-accent">
                      {speaker.name}
                      {m.notConnected && (
                        <span className="rounded-full border border-gold/60 bg-leaf px-2 py-0.5 font-normal text-leaf-ink">
                          Not connected
                        </span>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap">{m.text}</p>
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
              onClick={() =>
                setNotice("Voice input arrives in Phase 2. For now, type your message.")
              }
              aria-label="Voice input (arrives in Phase 2)"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-accent hover:border-accent"
            >
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
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-90"
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
                <span className="text-muted">Enter to send · Shift + Enter for a new line</span>
              )}
            </span>
            {remaining < 200 && (
              <span className={remaining < 0 ? "text-red-700" : "text-muted"}>
                {remaining} characters left
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
