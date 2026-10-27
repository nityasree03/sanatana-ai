import type { CompanionId } from "@/lib/companions";

/**
 * Small per-companion adjustments to the browser voice so each sounds a little different.
 * The actual voice depends on what the visitor's device has installed.
 */
export const VOICE_SETTINGS: Record<CompanionId, { rate: number; pitch: number }> = {
  krishna: { rate: 1, pitch: 1.05 },
  shiva: { rate: 0.88, pitch: 0.85 },
  hanuman: { rate: 1.05, pitch: 0.95 },
  parvati: { rate: 0.95, pitch: 1.15 },
};

export const SPEECH_LANG = "en-IN";

/** Friendly explanations for speech problems. */
export const SPEECH_INPUT_MESSAGES = {
  unsupported:
    "Voice input isn't available in this browser. Try Chrome, Edge or Safari, or type your message.",
  "not-allowed":
    "The microphone is blocked. Allow microphone access in your browser settings, or type your message.",
  "no-speech": "I didn't hear anything. Press the microphone and try again.",
  "audio-capture": "No microphone was found. Check that one is connected, or type your message.",
  network:
    "Your browser's speech service couldn't be reached. Check your connection, or type your message.",
  other: "Voice input stopped unexpectedly. Try again, or type your message.",
} as const;
