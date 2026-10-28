"use client";

import { useId, useState } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui/Dialog";
import { normalise, type Question } from "@/lib/learning/lessons";

/** Reference text for each supporting passage id, e.g. "Bhagavad Gita 2.47". */
export type References = Record<string, string>;

function QuestionCard({
  q,
  n,
  refs,
  checked,
  onCheck,
}: {
  q: Question;
  n: number;
  refs: References;
  checked: number | null;
  onCheck: (choice: number) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const name = useId();
  const done = checked !== null;
  const right = checked === q.answer;
  return (
    <fieldset className="rounded-2xl border border-line bg-card p-4">
      <legend className="px-1 font-semibold">
        {n}. {q.prompt}
      </legend>
      <div className="mt-1 space-y-1.5">
        {q.options.map((o, i) => (
          <label key={o} className="flex items-start gap-2">
            <input
              type="radio"
              name={name}
              className="mt-1.5"
              checked={choice === i}
              disabled={done}
              onChange={() => setChoice(i)}
            />
            <span>
              {o}
              {done && i === q.answer && <strong className="ms-2 text-sm">· correct</strong>}
              {done && i === checked && i !== q.answer && (
                <span className="ms-2 text-sm text-muted">· your answer</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {!done && (
        <button
          type="button"
          className={`${buttonPrimary} mt-3`}
          disabled={choice === null}
          onClick={() => choice !== null && onCheck(choice)}
        >
          Check answer {n}
        </button>
      )}
      <div aria-live="polite">
        {done && (
          <div className="mt-3 text-sm">
            <p className="font-semibold">
              {right ? "Right." : `Not quite. The answer is: ${q.options[q.answer]}.`}
            </p>
            <blockquote className="palm-leaf mt-2 px-4 py-2">
              <p>“{normalise(q.support.quote)}”</p>
              <footer className="mt-1 text-xs">
                Where the verse says it:{" "}
                <a href={`#${q.support.passage}`} className="font-semibold underline">
                  {refs[q.support.passage]}
                </a>
              </footer>
            </blockquote>
            <p className="mt-2">
              {q.explain} <span className="text-muted">(our note)</span>
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

/** Three comprehension questions; every answer points to the line of the verse that supports it. */
export function LessonQuiz({ questions, refs }: { questions: Question[]; refs: References }) {
  const [round, setRound] = useState(0);
  const [checked, setChecked] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = checked.every((c) => c !== null);
  const score = checked.filter((c, i) => c === questions[i].answer).length;
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <QuestionCard
          key={`${round}-${q.id}`}
          q={q}
          n={i + 1}
          refs={refs}
          checked={checked[i]}
          onCheck={(c) => setChecked((prev) => prev.map((v, j) => (j === i ? c : v)))}
        />
      ))}
      {done && (
        <div className="flex flex-wrap items-center gap-3" role="status">
          <p className="font-semibold">
            You answered {score} of {questions.length} from the verses.
          </p>
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => {
              setChecked(questions.map(() => null));
              setRound((r) => r + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
