/**
 * Speech adapters.
 *
 * The rest of the app talks only to these interfaces, never to a browser API directly,
 * so the speech engine can be swapped later (for example, for a cloud voice service)
 * without touching the chat code.
 */

export type SpeechInputError =
  | "not-allowed" // the person (or browser) blocked the microphone
  | "no-speech" // nothing was heard
  | "audio-capture" // no microphone found
  | "network" // the browser's recognition service could not be reached
  | "unsupported"
  | "other";

export interface SpeechInputCallbacks {
  /** Text recognised so far that may still change. */
  onInterim(text: string): void;
  /** A finished phrase. */
  onFinal(text: string): void;
  onError(error: SpeechInputError): void;
  /** Recognition stopped (by the person, by silence, or after an error). */
  onEnd(): void;
}

export interface SpeechInputAdapter {
  isSupported(): boolean;
  start(lang: string, callbacks: SpeechInputCallbacks): void;
  stop(): void;
}

export interface SpeechOutputOptions {
  rate: number;
  pitch: number;
  lang: string;
  onStart(): void;
  onEnd(): void;
  onError(): void;
}

export interface SpeechOutputAdapter {
  isSupported(): boolean;
  speak(text: string, options: SpeechOutputOptions): void;
  stop(): void;
}
