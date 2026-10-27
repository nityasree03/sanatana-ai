# Sanatana AI

A scripture-grounded conversational and learning website. Four AI companions inspired by
tradition (Krishna, Shiva, Hanuman and Parvati) appear as animated avatars on the left, with a
ChatGPT-style text and voice chat on the right.

> **Status: Phase 0 (project setup).** The site currently shows a placeholder page. No AI,
> avatars or scripture features are working yet. See [`docs/project_status.md`](docs/project_status.md).

The companions are **AI simulations inspired by tradition**. They are not the deities themselves
and do not offer divine contact, predictions or guaranteed outcomes.

## Tech stack

| Area                | Tools                                                               |
| ------------------- | ------------------------------------------------------------------- |
| Website             | Next.js (App Router), React, TypeScript, Tailwind CSS               |
| Server & validation | Next.js route handlers, Zod (Phase 4)                               |
| AI                  | Gemini free tier behind a swappable provider adapter (Phase 4)      |
| Scripture data      | Python offline pipeline, versioned JSON, hybrid retrieval (Phase 3) |
| Speech & avatars    | Browser Web Speech APIs, layered 2D SVG/React animation (Phase 2)   |
| Tests               | Vitest, Playwright, pytest                                          |
| Hosting             | GitHub + Vercel Hobby (Phase 9)                                     |

## Run it on your computer

Requirements: [Node.js](https://nodejs.org) 20.9 or newer, and Python 3.11+ for the scripture pipeline.

```bash
npm install          # download the project's building blocks
npm run dev          # start the site at http://localhost:3000
```

## Checks

```bash
npm run lint         # code-quality rules
npm run typecheck    # TypeScript type checks
npm test             # unit tests (Vitest)
npm run build        # production build
npx playwright install chromium   # first time only
npm run test:e2e     # browser tests (Playwright, desktop + mobile)
npm run test:py      # Python pipeline tests (pytest)
```

## Project layout

```
src/app/              pages (one folder per route)
src/components/       reusable UI pieces
src/lib/              logic: site info, providers, retrieval, storage
src/data/             companion profiles, stories, processed scripture JSON
public/               images, avatar artwork, audio
scripture-pipeline/   Python tools to import and validate scripture
tests/unit/           Vitest tests
tests/e2e/            Playwright tests
docs/                 requirements, architecture, status and policies
```

## Secrets

Copy `.env.example` to `.env.local` and put real keys only there. `.env.local` is ignored by git.
Never commit API keys.

## Documentation

See the [`docs/`](docs) folder, starting with [`project_status.md`](docs/project_status.md) and
[`architecture.md`](docs/architecture.md).
