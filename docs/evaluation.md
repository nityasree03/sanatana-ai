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

| Check                                         | Result                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit tests (Vitest)                           | 27/27 pass (Phase 2 + illustrated portraits)                                                                                                                                   |
| Browser tests (Playwright, desktop + Pixel 7) | 63/63 pass; 1 phone-only test skipped on desktop                                                                                                                               |
| Automated accessibility (axe, WCAG 2 A/AA)    | 0 violations on all 17 routes, both viewports; chat scanned in night theme and while speaking                                                                                  |
| Avatar states                                 | idle, listening, thinking, speaking and error verified for all four companions (screenshots); animation stops with reduced motion                                              |
| Voice                                         | Tested with a controllable fake microphone and voice in Chromium. Real microphones and installed voices vary by browser and device; real-device testing is planned for Phase 9 |
| Python tests (pytest)                         | 2/2 pass                                                                                                                                                                       |

Automated scans do not replace manual screen-reader testing, which is planned for Phase 9.
