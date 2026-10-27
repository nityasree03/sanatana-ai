# Evaluation

Only real, observed measurements are reported here. Nothing has been measured yet.

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

## Current results

| Check                                         | Result                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| Unit tests (Vitest)                           | 16/16 pass (Phase 1)                                                            |
| Browser tests (Playwright, desktop + Pixel 7) | 47/47 pass; 1 phone-only test skipped on desktop (Phase 1)                      |
| Automated accessibility (axe, WCAG 2 A/AA)    | 0 violations on all 17 routes, both viewports; chat also scanned in night theme |
| Python tests (pytest)                         | 2/2 pass                                                                        |

Automated scans do not replace manual screen-reader testing, which is planned for Phase 9.
