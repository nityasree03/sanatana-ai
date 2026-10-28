"use client";

import { useEffect, useState } from "react";
import type { SpeechInputAdapter } from "@/lib/speech/types";
import { SPEECH_INPUT_MESSAGES, SPEECH_LANG } from "@/lib/speech/voices";
import { createWebSpeechInput } from "@/lib/speech/webSpeechInput";

/**
 * A microphone button that adds what the person says to a text field (never sends anything).
 * Uses the browser's speech recognition; in some browsers audio goes to the browser maker.
 */
export function DictateButton({
  onText,
  label,
  adapter,
}: {
  /** Receives each finished phrase. */
  onText: (text: string) => void;
  /** Accessible name, e.g. "Speak your decision". */
  label: string;
  adapter?: SpeechInputAdapter;
}) {
  const [input] = useState(() => adapter ?? createWebSpeechInput());
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => () => input.stop(), [input]);

  function toggle() {
    if (listening) {
      input.stop();
      setListening(false);
      return;
    }
    if (!input.isSupported()) {
      setMessage(SPEECH_INPUT_MESSAGES.unsupported);
      return;
    }
    setMessage("Listening… your words are added to the box so you can check them.");
    setListening(true);
    input.start(SPEECH_LANG, {
      onInterim: () => {},
      onFinal: (t) => t.trim() && onText(t.trim()),
      onError: (code) => setMessage(SPEECH_INPUT_MESSAGES[code]),
      onEnd: () => setListening(false),
    });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-accent-soft"
      >
        <span aria-hidden="true">{listening ? "■ " : "🎙 "}</span>
        {listening ? `Stop listening` : label}
      </button>
      {message && (
        <span role="status" className="text-xs text-muted">
          {message}
        </span>
      )}
    </span>
  );
}
