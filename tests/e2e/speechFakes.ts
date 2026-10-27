import type { Page } from "@playwright/test";

/**
 * Replaces the browser's microphone recognition and speech synthesis with controllable fakes,
 * so tests can "speak" into the page and finish speech on demand. Everything else is the real app.
 */
export async function installSpeechFakes(
  page: Page,
  opts: { mic?: boolean; voice?: boolean } = {},
) {
  const { mic = true, voice = true } = opts;
  await page.addInitScript(
    ({ mic, voice }) => {
      type Ctl = Record<string, unknown> & { spoken: string[] };
      const ctl: Ctl = { spoken: [] };
      (window as unknown as { __speech: Ctl }).__speech = ctl;

      if (mic) {
        class FakeRecognition {
          lang = "";
          continuous = false;
          interimResults = false;
          onresult: ((e: unknown) => void) | null = null;
          onerror: ((e: { error: string }) => void) | null = null;
          onend: (() => void) | null = null;
          start() {
            ctl.rec = this;
          }
          stop() {
            this.onend?.();
          }
          abort() {
            this.onend?.();
          }
        }
        Object.assign(window, {
          SpeechRecognition: FakeRecognition,
          webkitSpeechRecognition: FakeRecognition,
        });
        ctl.say = (text: string, isFinal: boolean) => {
          const rec = ctl.rec as FakeRecognition;
          rec.onresult?.({ resultIndex: 0, results: [{ isFinal, 0: { transcript: text } }] });
        };
        ctl.micError = (error: string) => (ctl.rec as FakeRecognition).onerror?.({ error });
        ctl.micEnd = () => (ctl.rec as FakeRecognition).onend?.();
      } else {
        // Simulate a browser without speech recognition (e.g. Firefox).
        delete (window as unknown as Record<string, unknown>).SpeechRecognition;
        delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      }

      if (voice) {
        let current: SpeechSynthesisUtterance | null = null;
        const fakeSynth = {
          speak(u: SpeechSynthesisUtterance) {
            current = u;
            ctl.spoken.push(u.text);
            ctl.lastRate = u.rate;
            ctl.lastPitch = u.pitch;
            u.onstart?.(new Event("start") as SpeechSynthesisEvent);
          },
          cancel() {
            const u = current;
            current = null;
            u?.onend?.(new Event("end") as SpeechSynthesisEvent);
          },
          getVoices: () => [],
        };
        Object.defineProperty(window, "speechSynthesis", { value: fakeSynth, configurable: true });
        ctl.finishSpeech = () => {
          const u = current;
          current = null;
          u?.onend?.(new Event("end") as SpeechSynthesisEvent);
        };
      }
    },
    { mic, voice },
  );
}

export const speechCtl = {
  say: (page: Page, text: string, isFinal = true) =>
    page.evaluate(
      ([t, f]) =>
        (window as unknown as { __speech: { say: (t: string, f: boolean) => void } }).__speech.say(
          t as string,
          f as boolean,
        ),
      [text, isFinal] as const,
    ),
  micEnd: (page: Page) =>
    page.evaluate(() =>
      (window as unknown as { __speech: { micEnd: () => void } }).__speech.micEnd(),
    ),
  micError: (page: Page, code: string) =>
    page.evaluate(
      (c) =>
        (window as unknown as { __speech: { micError: (c: string) => void } }).__speech.micError(c),
      code,
    ),
  finishSpeech: (page: Page) =>
    page.evaluate(() =>
      (window as unknown as { __speech: { finishSpeech: () => void } }).__speech.finishSpeech(),
    ),
  spoken: (page: Page) =>
    page.evaluate(() => (window as unknown as { __speech: { spoken: string[] } }).__speech.spoken),
};
