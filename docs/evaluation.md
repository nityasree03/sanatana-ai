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

| Check                                        | Result |
| -------------------------------------------- | ------ |
| Unit tests (Vitest)                          | Pass   |
| Browser tests (Playwright, desktop + mobile) | Pass   |
| Python tests (pytest)                        | Pass   |
