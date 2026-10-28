# Evaluation

Only real, observed measurements are reported here.

## Planned evaluations

| Area              | Evidence                                                       | Phase |
| ----------------- | -------------------------------------------------------------- | ----- |
| Retrieval         | Recall@5 on manually reviewed questions, with failure examples | 3–4   |
| Grounding         | Citation ID validation and manual review of claim support      | 4     |
| Personas          | Four-way comparison prompts, rubric and multi-turn consistency | 4–5   |
| Memory            | Save, delete, export, opt-out and clear tests                  | 6     |
| Speech and avatar | Browser compatibility, fallback, interruption, avatar states   | 2     |
| Dharma Lab        | Branch state correctness                                       | 7     |
| Kids              | Four stories and quizzes, caregiver controls                   | 8     |
| Accessibility     | Keyboard, screen reader and mobile checks                      | 1–9   |
| Deployment        | Smoke tests against the live site                              | 9     |

## Scripture retrieval (Phase 3)

Run with `npm run eval:scripture`; raw output in `evaluation/scripture-retrieval/results.json`.

- **Test set:** 24 questions (`evaluation/scripture-retrieval/queries.json`): 14 phrased as topics
  ("Hanuman leaps across the ocean") and 10 as everyday questions ("how should I sit when I
  meditate"). Relevant passages were labelled by reading the passage text. After the first run the
  top results were read and one missed relevant passage was added (q01: Gita 6.1). The labels have
  **not** been reviewed by a scholar, and the set is small, so these numbers are a baseline for
  catching regressions, not a quality claim.
- **Metrics:** Recall@5 = share of a question's relevant passages (max 5) found in the top 5;
  Hit@5 = share of questions with at least one relevant passage in the top 5; MRR@10 = average of
  1/rank of the first relevant passage.

| Questions   | Mode                       | Recall@5 | Hit@5 | MRR@10 |
| ----------- | -------------------------- | -------- | ----- | ------ |
| all 24      | keyword (BM25)             | 0.47     | 0.83  | 0.72   |
| all 24      | meaning (MiniLM vectors)   | 0.35     | 0.67  | 0.59   |
| all 24      | hybrid (both, rank fusion) | 0.45     | 0.79  | 0.70   |
| 10 everyday | keyword                    | 0.42     | 0.70  | 0.53   |
| 10 everyday | meaning                    | 0.30     | 0.50  | 0.44   |
| 10 everyday | hybrid                     | 0.37     | 0.70  | 0.58   |
| 14 topic    | keyword                    | 0.50     | 0.93  | 0.85   |
| 14 topic    | meaning                    | 0.38     | 0.79  | 0.70   |
| 14 topic    | hybrid                     | 0.50     | 0.86  | 0.79   |

What this shows:

- Keyword search is the strongest mode on this set, so it is the default. Meaning search is
  opt-in and labelled "experimental".
- The small MiniLM model struggles with archaic English ("thy", "doth", Besant's "seat" for "sit").
  It helps on some questions (Hanuman's leap: 0.20 → 0.60) but hurts others (q24 "three paths":
  1.00 → 0.00), and on average hybrid does not beat keyword.
- Failure examples: "how should I sit when I meditate" finds nothing relevant in any mode (Gita
  6.11–6.13 say "seat" and "body, head and neck erect"); "I keep wanting what other people have"
  misses Isa 1 ("do not covet"); "the Goddess reveals her cosmic form" returns Krishna's cosmic form
  in Gita 11 instead of the Devi Gita.
- Next step (Phase 4 decision): test a stronger embedding model, or query rewriting by the LLM,
  against this same set before grounded chat relies on meaning search.

### After Phase 3b (17 texts, 9,321 passages)

The answer key was extended to v1.2.0 by reading the top 5 of every mode again (161 passages from
the new texts; 33 relevant ones added) and adding Hume's translations of verses already labelled
(18, checked by reading both). Same 24 questions, same metrics.

| Questions   | Mode    | Recall@5 | Hit@5 | MRR@10 |
| ----------- | ------- | -------- | ----- | ------ |
| all 24      | keyword | 0.44     | 0.75  | 0.65   |
| all 24      | meaning | 0.32     | 0.67  | 0.54   |
| all 24      | hybrid  | 0.39     | 0.75  | 0.66   |
| 10 everyday | keyword | 0.34     | 0.50  | 0.43   |
| 10 everyday | hybrid  | 0.31     | 0.60  | 0.47   |
| 14 topic    | keyword | 0.51     | 0.93  | 0.81   |
| 14 topic    | hybrid  | 0.44     | 0.86  | 0.79   |

- Topic questions held up (keyword Hit@5 0.93 before and after).
- Everyday questions got worse (keyword Hit@5 0.70 → 0.50): with seven times more text, long
  narrative passages (Ramayana dialogue, Ramcharitmanas) that share common words crowd the top 5.
- Phase 4 should improve ranking before grounded chat relies on it: e.g. favour the chosen
  companion's texts, let the AI rewrite an everyday question into scripture terms, or test a
  stronger embedding model, each measured on this set.

## Current results

| Check                                         | Result                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit tests (Vitest)                           | 52/52 pass (Phase 3b)                                                                                                                                                          |
| Browser tests (Playwright, desktop + Pixel 7) | 85/85 pass; 1 phone-only test skipped on desktop                                                                                                                               |
| Automated accessibility (axe, WCAG 2 A/AA)    | 0 violations on all 17 routes, both viewports; chat scanned in night theme and while speaking; scripture search results, chapter and text pages scanned                        |
| Avatar states                                 | idle, listening, thinking, speaking and error verified for all four companions (screenshots); animation stops with reduced motion                                              |
| Voice                                         | Tested with a controllable fake microphone and voice in Chromium. Real microphones and installed voices vary by browser and device; real-device testing is planned for Phase 9 |
| Python tests (pytest)                         | 25/25 pass                                                                                                                                                                     |

Automated scans do not replace manual screen-reader testing, which is planned for Phase 9.
