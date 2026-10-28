"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";

const noop = () => () => {};

/**
 * Reads text aloud with the device's own voice. Hidden where the browser has no voices.
 * `name` describes what is read, e.g. "Bhagavad Gita 2.47 in English".
 */
export function ListenButton({
  text,
  name,
  lang = "en-IN",
  rate = 0.95,
  label = "Listen",
}: {
  text: string;
  name: string;
  lang?: string;
  rate?: number;
  label?: string;
}) {
  const [output] = useState(createWebSpeechOutput);
  const supported = useSyncExternalStore(
    noop,
    () => output.isSupported(),
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => () => output.stop(), [output]);
  if (!supported) return null;

  function toggle() {
    if (speaking) {
      output.stop();
      setSpeaking(false);
      return;
    }
    setFailed(false);
    output.speak(text, {
      lang,
      rate,
      pitch: 1,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false);
        setFailed(true);
      },
    });
    setSpeaking(true);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={speaking ? `Stop reading ${name}` : `${label} to ${name}`}
        className="rounded-full border border-line px-3 py-1 text-sm font-semibold hover:bg-card"
      >
        <span aria-hidden="true">{speaking ? "■ " : "▶ "}</span>
        {speaking ? "Stop" : label}
      </button>
      {failed && (
        <span role="status" className="text-xs text-muted">
          This device could not play the voice.
        </span>
      )}
    </span>
  );
}
