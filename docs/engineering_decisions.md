# Engineering decisions

| Date       | Decision                                                                                 | Why                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 2026-10-27 | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4                                   | Required stack; one codebase for pages and server routes                                                             |
| 2026-10-27 | `src/` folder layout with `@/*` import alias                                             | Keeps app code separate from config files                                                                            |
| 2026-10-27 | System font stack instead of Google Fonts                                                | Build environment could not reach Google Fonts; self-hosting is also more private. Self-hosted fonts come in Phase 1 |
| 2026-10-27 | Vitest + Testing Library for unit tests; Playwright (desktop + mobile) for browser tests | Fast unit feedback plus real-browser checks                                                                          |
| 2026-10-27 | `@types/node` 22 to match Node 22                                                        | Fixes a dependency conflict with Vitest                                                                              |
| 2026-10-27 | Provenance checklist written first in the Python pipeline                                | No passage may enter the site without source and license information                                                 |
