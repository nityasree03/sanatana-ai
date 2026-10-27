import type { SpeechOutputAdapter, SpeechOutputOptions } from "./types";

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

/** Prefer an Indian English voice when the device has one, then any voice in the language. */
function pickVoice(s: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  const voices = s.getVoices();
  return (
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ??
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
