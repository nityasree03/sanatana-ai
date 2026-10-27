import type { SpeechInputAdapter, SpeechInputCallbacks, SpeechInputError } from "./types";

/* Minimal typings for the Web Speech API (not yet in TypeScript's standard library). */
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function mapError(code: string): SpeechInputError {
  if (code === "not-allowed" || code === "service-not-allowed") return "not-allowed";
  if (code === "no-speech" || code === "audio-capture" || code === "network") return code;
  return "other";
}

/** Speech-to-text using the browser's built-in recognition (Chrome, Edge, Safari). */
export function createWebSpeechInput(): SpeechInputAdapter {
  let active: Recognition | null = null;

  return {
    isSupported: () => getCtor() !== null,

    start(lang: string, cb: SpeechInputCallbacks) {
      const Ctor = getCtor();
      if (!Ctor) {
        cb.onError("unsupported");
        cb.onEnd();
        return;
      }
      active?.abort();
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) cb.onFinal(r[0].transcript.trim());
          else interim += r[0].transcript;
        }
        cb.onInterim(interim.trim());
      };
      rec.onerror = (e) => cb.onError(mapError(e.error));
      rec.onend = () => {
        if (active === rec) active = null;
        cb.onEnd();
      };
      active = rec;
      try {
        rec.start();
      } catch {
        active = null;
        cb.onError("other");
        cb.onEnd();
      }
    },

    stop() {
      active?.stop();
    },
  };
}
