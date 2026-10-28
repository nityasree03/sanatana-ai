"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui/Dialog";
import { compareRecitation, type RecitationResult } from "@/lib/shloka/compare";
import type { ShlokaLine } from "@/lib/shloka/verses";
import { createWebSpeechInput } from "@/lib/speech/webSpeechInput";
import { createWebSpeechOutput } from "@/lib/speech/webSpeechOutput";
import type { SpeechInputAdapter, SpeechOutputAdapter } from "@/lib/speech/types";

export interface ShlokaVerse {
  id: string;
  title: string;
  reference: string;
  href: string;
  lines: ShlokaLine[];
  english: string;
  translator: string;
}

/** Devanagari is read with a Hindi voice: browsers have no Sanskrit voice. */
const VOICE_LANG = "hi-IN";
const noop = () => () => {};

type Playing = { what: string; n: number; times: number; yourTurn: boolean } | null;

const BAND_TEXT: Record<RecitationResult["band"], string> = {
  close: "Very close",
  partly: "Partly matched",
  far: "Hard to match",
};

export function ShlokaStudio({
  verses,
  pauseMs = 3000,
  output: outputProp,
  input: inputProp,
}: {
  verses: ShlokaVerse[];
  /** Silence left for the learner to repeat after each playback. */
  pauseMs?: number;
  output?: SpeechOutputAdapter;
  input?: SpeechInputAdapter;
}) {
  const [output] = useState(() => outputProp ?? createWebSpeechOutput());
  const [input] = useState(() => inputProp ?? createWebSpeechInput());
  // null until the browser has been checked, so nothing flashes a wrong message.
  const canSpeak = useSyncExternalStore<boolean | null>(
    noop,
    () => output.isSupported(),
    () => null,
  );
  const canListen = useSyncExternalStore(
    noop,
    () => input.isSupported(),
    () => false,
  );

  const [verseIdx, setVerseIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [playing, setPlaying] = useState<Playing>(null);
  const [voiceFailed, setVoiceFailed] = useState(false);
  const [checkOn, setCheckOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<RecitationResult | null>(null);
  const [micError, setMicError] = useState("");
  const token = useRef(0);
  const recToken = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const selectId = useId();

  const verse = verses[verseIdx];
  const line = verse.lines[lineIdx];

  function stopAll() {
    token.current++;
    window.clearTimeout(timer.current);
    output.stop();
    setPlaying(null);
  }

  function resetCheck() {
    recToken.current++; // ignore late events from an earlier recitation
    input.stop();
    setListening(false);
    setHeard("");
    setResult(null);
    setMicError("");
  }

  useEffect(
    () => () => {
      token.current++;
      window.clearTimeout(timer.current);
      output.stop();
      input.stop();
    },
    [output, input],
  );

  /** Speak `text` `times` times, leaving a pause after each for the learner to repeat. */
  function play(text: string, what: string, rate: number, times: number) {
    stopAll();
    setVoiceFailed(false);
    const mine = ++token.current;
    let n = 0;
    const once = () => {
      n++;
      setPlaying({ what, n, times, yourTurn: false });
      output.speak(text, {
        lang: VOICE_LANG,
        rate,
        pitch: 1,
        onStart: () => {},
        onEnd: () => {
          if (token.current !== mine) return;
          if (times === 1) {
            setPlaying(null);
            return;
          }
          setPlaying({ what, n, times, yourTurn: true });
          timer.current = window.setTimeout(() => {
            if (token.current !== mine) return;
            if (n < times) once();
            else setPlaying(null);
          }, pauseMs);
        },
        onError: () => {
          if (token.current !== mine) return;
          setPlaying(null);
          setVoiceFailed(true);
        },
      });
    };
    once();
  }

  function chooseVerse(i: number) {
    stopAll();
    resetCheck();
    setVerseIdx(i);
    setLineIdx(0);
  }

  function chooseLine(i: number) {
    stopAll();
    resetCheck();
    setLineIdx(i);
  }

  function recite() {
    stopAll();
    resetCheck();
    setListening(true);
    const mine = recToken.current;
    const live = () => recToken.current === mine;
    let finalText = "";
    input.start(VOICE_LANG, {
      onInterim: (t) => live() && setHeard(t),
      onFinal: (t) => {
        if (!live()) return;
        finalText = `${finalText} ${t}`.trim();
        setHeard(finalText);
      },
      onError: (e) =>
        live() &&
        setMicError(
          e === "not-allowed"
            ? "The microphone is blocked. You can allow it in your browser's site settings."
            : e === "no-speech"
              ? "Nothing was heard. Try again a little closer to the microphone."
              : "Speech recognition did not work this time.",
        ),
      onEnd: () => {
        if (!live()) return;
        setListening(false);
        if (finalText) setResult(compareRecitation(finalText, line));
      },
    });
  }

  const lineName = `line ${lineIdx + 1}`;
  const status = playing
    ? playing.yourTurn
      ? `Your turn: say ${playing.what} (${playing.n} of ${playing.times}).`
      : `Playing ${playing.what}${playing.times > 1 ? ` (${playing.n} of ${playing.times})` : ""}…`
    : "";
  const words = { deva: line.devanagari.split(/\s+/), iast: line.iast.split(/\s+/) };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl">Shloka Practice Studio</h1>
        <p className="mt-2 text-muted">
          Learn a verse line by line: read the Sanskrit and its transliteration, listen slowly, then
          repeat in the pauses. The verses come from the Gita and the Upanishads, where the library
          has verified Sanskrit (Hanuman&apos;s texts are in English translation only for now).
        </p>
      </header>

      <div className="mt-6">
        <label htmlFor={selectId} className="block text-sm font-semibold">
          Choose a verse
        </label>
        <select
          id={selectId}
          className="mt-1 w-full max-w-xl rounded-xl border-2 border-line bg-card p-2.5"
          value={verseIdx}
          onChange={(e) => chooseVerse(Number(e.target.value))}
        >
          {verses.map((v, i) => (
            <option key={v.id} value={i}>
              {v.reference}: {v.title}
            </option>
          ))}
        </select>
      </div>

      <section aria-labelledby="verse-title" className="palm-leaf mt-6 px-5 py-5" lang="en">
        <h2 id="verse-title" className="font-display text-2xl">
          {verse.reference}
        </h2>
        <p className="text-sm">
          {verse.title} <span>(our title)</span>
        </p>
        <h3 className="sr-only">Lines</h3>
        <ol className="mt-3 space-y-2">
          {verse.lines.map((l, i) => (
            <li key={`${verse.id}-${i}`}>
              <button
                type="button"
                aria-pressed={i === lineIdx}
                onClick={() => chooseLine(i)}
                className={`w-full rounded-xl border-2 px-3 py-2 text-left ${
                  i === lineIdx ? "border-accent bg-card" : "border-transparent hover:bg-card/60"
                }`}
              >
                <span className="block text-xs font-semibold">Line {i + 1}</span>
                <span lang="sa" className="font-sanskrit block text-2xl leading-10">
                  {l.devanagari}
                </span>
                <span lang="sa-Latn" className="block text-sm italic">
                  {l.iast}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="text-xs font-semibold tracking-wide uppercase">
            English (whole verse) · {verse.translator}
          </h3>
          <p className="mt-1 leading-7">{verse.english}</p>
          <p className="mt-2 text-xs">
            <Link href={verse.href} className="underline">
              Read {verse.reference} in the Scripture Explorer
            </Link>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="practise"
        className="mt-6 rounded-2xl border border-line bg-card p-4"
      >
        <h2 id="practise" className="font-display text-2xl">
          Practise line {lineIdx + 1}
        </h2>
        {canSpeak === null ? null : canSpeak ? (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => play(line.devanagari, lineName, 0.8, 1)}
              >
                Listen to {lineName}
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => play(line.devanagari, lineName, 0.55, 1)}
              >
                Listen slowly to {lineName}
              </button>
              <button
                type="button"
                className={buttonPrimary}
                onClick={() => play(line.devanagari, lineName, 0.6, 3)}
              >
                Repeat {lineName} 3 times with pauses
              </button>
              <button
                type="button"
                className={buttonSecondary}
                onClick={() =>
                  play(verse.lines.map((l) => l.devanagari).join("\n"), "the whole verse", 0.7, 1)
                }
              >
                Listen to the whole verse
              </button>
              {playing && (
                <button type="button" className={buttonSecondary} onClick={stopAll}>
                  Stop
                </button>
              )}
            </div>
            <p aria-live="polite" className="mt-2 min-h-6 font-semibold">
              {status}
            </p>
            {voiceFailed && (
              <p role="status" className="text-sm">
                This device could not play the voice.
              </p>
            )}
            <p className="text-xs text-muted">
              Read aloud by your device&apos;s own voice, using a Hindi voice if your device has one
              (there are no Sanskrit voices). Pronunciation is approximate; it is not a trained
              recitation.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm">
            This browser has no voices for reading aloud. You can still practise from the text.
          </p>
        )}

        {canListen && (
          <div className="mt-4 border-t border-line pt-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checkOn}
                onChange={(e) => {
                  setCheckOn(e.target.checked);
                  resetCheck();
                }}
              />
              <span>
                <strong>Check my recitation (optional, approximate)</strong>
                <span className="block text-muted">
                  Uses your browser&apos;s speech recognition in Hindi, because there is no Sanskrit
                  option; some browsers send your voice to the browser maker to do this. Nothing is
                  recorded or saved by this site. It is a rough guide, not a judgement of your
                  pronunciation.
                </span>
              </span>
            </label>
            {checkOn && (
              <div className="mt-3">
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={listening ? () => input.stop() : recite}
                >
                  {listening ? "Stop listening" : `Recite ${lineName}`}
                </button>
                <div aria-live="polite" className="mt-2 text-sm">
                  {listening && <p>Listening… say line {lineIdx + 1} now.</p>}
                  {micError && <p>{micError}</p>}
                  {heard && !listening && (
                    <p>
                      Heard: <span lang={/[ऀ-ॿ]/.test(heard) ? "hi" : undefined}>{heard}</span>
                    </p>
                  )}
                  {result && (
                    <div className="mt-1">
                      <p className="font-semibold">
                        {BAND_TEXT[result.band]}: about {Math.round(result.similarity * 100)}%
                        similar (approximate).
                      </p>
                      {result.missed.length > 0 ? (
                        <p>
                          Words to practise:{" "}
                          {result.missed.map((i, k) => (
                            <span key={i}>
                              {k > 0 && ", "}
                              <span lang="sa" className="font-sanskrit">
                                {words.deva[i]}
                              </span>{" "}
                              {words.iast[i] && (
                                <span lang="sa-Latn" className="italic">
                                  ({words.iast[i]})
                                </span>
                              )}
                            </span>
                          ))}
                        </p>
                      ) : (
                        <p>Every word was heard.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
