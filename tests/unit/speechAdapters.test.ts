import { afterEach, describe, expect, it, vi } from "vitest";
import { createWebSpeechInput } from "@/lib/speech/webSpeechInput";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";

const w = window as unknown as Record<string, unknown>;
afterEach(() => {
  delete w.SpeechRecognition;
  delete w.webkitSpeechRecognition;
  delete w.speechSynthesis;
  delete (globalThis as Record<string, unknown>).SpeechSynthesisUtterance;
});

describe("browser speech-to-text adapter", () => {
  it("reports unsupported browsers honestly", () => {
    const input = createWebSpeechInput();
    expect(input.isSupported()).toBe(false);
    const onError = vi.fn();
    const onEnd = vi.fn();
    input.start("en-IN", { onInterim: vi.fn(), onFinal: vi.fn(), onError, onEnd });
    expect(onError).toHaveBeenCalledWith("unsupported");
    expect(onEnd).toHaveBeenCalled();
  });

  it("uses the prefixed Chrome/Safari engine and passes interim and final text", () => {
    class FakeRecognition {
      static last: FakeRecognition;
      lang = "";
      continuous = true;
      interimResults = false;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      constructor() {
        FakeRecognition.last = this;
      }
    }
    w.webkitSpeechRecognition = FakeRecognition;
    const input = createWebSpeechInput();
    expect(input.isSupported()).toBe(true);
    const cb = { onInterim: vi.fn(), onFinal: vi.fn(), onError: vi.fn(), onEnd: vi.fn() };
    input.start("en-IN", cb);
    const rec = FakeRecognition.last;
    expect(rec.lang).toBe("en-IN");
    expect(rec.interimResults).toBe(true);
    rec.onresult?.({
      resultIndex: 0,
      results: [
        { isFinal: true, 0: { transcript: " hello " } },
        { isFinal: false, 0: { transcript: "wor" } },
      ],
    });
    expect(cb.onFinal).toHaveBeenCalledWith("hello");
    expect(cb.onInterim).toHaveBeenLastCalledWith("wor");
    rec.onerror?.({ error: "service-not-allowed" });
    expect(cb.onError).toHaveBeenCalledWith("not-allowed");
  });
});

describe("browser text-to-speech adapter", () => {
  it("reports unsupported browsers honestly", () => {
    expect(createWebSpeechOutput().isSupported()).toBe(false);
  });

  it("cancels anything playing, applies voice settings and treats an interruption as a normal end", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    w.speechSynthesis = {
      speak,
      cancel,
      getVoices: () => [{ lang: "en-US" }, { lang: "en-IN", name: "Indian English" }],
    };
    class FakeUtterance {
      lang = "";
      rate = 1;
      pitch = 1;
      voice: unknown = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      constructor(public text: string) {}
    }
    (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = FakeUtterance;
    const out = createWebSpeechOutput();
    expect(out.isSupported()).toBe(true);
    const o = {
      rate: 0.9,
      pitch: 1.1,
      lang: "en-IN",
      onStart: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    };
    out.speak("Namaste", o);
    expect(cancel).toHaveBeenCalled();
    const u = speak.mock.calls[0][0] as FakeUtterance;
    expect(u).toMatchObject({ text: "Namaste", rate: 0.9, pitch: 1.1, lang: "en-IN" });
    expect((u.voice as { lang: string }).lang).toBe("en-IN");
    u.onerror?.({ error: "interrupted" });
    expect(o.onEnd).toHaveBeenCalled();
    expect(o.onError).not.toHaveBeenCalled();
    u.onerror?.({ error: "synthesis-failed" });
    expect(o.onError).toHaveBeenCalled();
  });
});
