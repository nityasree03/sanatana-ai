import type {
  SpeechInputAdapter,
  SpeechInputCallbacks,
  SpeechOutputAdapter,
  SpeechOutputOptions,
} from "@/lib/speech/types";

/** Test doubles for the speech engines, so tests can play the role of the browser. */
export function fakeInput(supported = true) {
  let cb: SpeechInputCallbacks | null = null;
  const adapter: SpeechInputAdapter & { stopped: number } = {
    stopped: 0,
    isSupported: () => supported,
    start: (_lang, callbacks) => {
      cb = callbacks;
    },
    stop() {
      adapter.stopped++;
      cb?.onEnd();
      cb = null;
    },
  };
  return {
    adapter,
    interim: (t: string) => cb?.onInterim(t),
    final: (t: string) => cb?.onFinal(t),
    error: (e: Parameters<SpeechInputCallbacks["onError"]>[0]) => cb?.onError(e),
    end: () => cb?.onEnd(),
  };
}

export function fakeOutput(supported = true) {
  let current: SpeechOutputOptions | null = null;
  const spoken: { text: string; rate: number; pitch: number }[] = [];
  const adapter: SpeechOutputAdapter = {
    isSupported: () => supported,
    speak: (text, o) => {
      current = o;
      spoken.push({ text, rate: o.rate, pitch: o.pitch });
      o.onStart();
    },
    stop: () => {
      const c = current;
      current = null;
      c?.onEnd();
    },
  };
  return {
    adapter,
    spoken,
    finish: () => {
      const c = current;
      current = null;
      c?.onEnd();
    },
    fail: () => current?.onError(),
  };
}
