import type { SpeechOutputAdapter, SpeechOutputOptions } from "./types";

function synth(): SpeechSynthesis | null {
  return (typeof window !== "undefined" && window.speechSynthesis) || null;
}

/**
 * For English, prefer an Indian English voice when the device has one; otherwise (and for
 * other languages, e.g. Hindi for Devanagari) use a voice in the requested language.
 */
export function pickVoice(s: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  const voices = s.getVoices();
  const base = lang.split("-")[0];
  const norm = (l: string) => l.replace("_", "-");
  return (
    (base === "en" ? voices.find((v) => norm(v.lang) === "en-IN") : undefined) ??
    voices.find((v) => norm(v.lang) === lang) ??
    voices.find((v) => norm(v.lang).startsWith(`${base}-`) || v.lang === base) ??
    null
  );
}

/** Text-to-speech using the browser's built-in voices. Nothing is sent to a server by our app. */
export function createWebSpeechOutput(): SpeechOutputAdapter {
  return {
    isSupported: () => synth() !== null && typeof SpeechSynthesisUtterance !== "undefined",

    speak(text: string, o: SpeechOutputOptions) {
      const s = synth();
      if (!s) {
        o.onError();
        return;
      }
      s.cancel(); // never talk over ourselves
      const u = new SpeechSynthesisUtterance(text);
      u.lang = o.lang;
      u.rate = o.rate;
      u.pitch = o.pitch;
      const voice = pickVoice(s, o.lang);
      if (voice) u.voice = voice;
      u.onstart = () => o.onStart();
      u.onend = () => o.onEnd();
      u.onerror = (e) => {
        // "interrupted"/"canceled" happen when we stop on purpose; treat them as a normal end.
        if (e.error === "interrupted" || e.error === "canceled") o.onEnd();
        else o.onError();
      };
      s.speak(u);
    },

    stop() {
      synth()?.cancel();
    },
  };
}
