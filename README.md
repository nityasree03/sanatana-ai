# Sanatana AI

A scripture-grounded conversational and learning website. Four AI companions inspired by
tradition (Krishna, Shiva, Hanuman and Parvati) appear as animated avatars on the left, with a
ChatGPT-style text and voice chat on the right.

> **Status: Phase 6 complete.** All pages and navigation work; the four companions are animated
> and you can talk and listen in supported browsers. The **Scripture Explorer** holds 17
> public-domain texts and translations (9,321 passages, with Sanskrit where it could be matched)
> with full source and licence details and search. The chat answers with cited, verified passages
> (Gemini when a key is set; scripture-only replies without one), with a Truth Lens that separates
> verified text from AI interpretation. You can switch companions and choose what to share, ask
> the **Divine Council** one question for four perspectives, and explore one **Living Leela**
> story scene per companion. **My Dharma Journey** (goals, Wisdom Tree, Karma Reflection Mirror,
> Daily Sankalpa) keeps what you choose to save privately in your browser. Every page shows an
> honest status label. See [`docs/project_status.md`](docs/project_status.md).

The companions are **AI simulations inspired by tradition**. They are not the deities themselves
and do not offer divine contact, predictions or guaranteed outcomes.

## Tech stack

| Area                | Tools                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Website             | Next.js (App Router), React, TypeScript, Tailwind CSS                |
| Server & validation | Next.js route handlers, Zod, in-memory rate limit                    |
| AI                  | Gemini free tier behind a swappable provider adapter (Phase 4)       |
| Scripture data      | Python offline pipeline, versioned JSON, BM25 + MiniLM hybrid search |
| Speech & avatars    | Browser Web Speech APIs, illustrated expression portraits (Phase 2)  |
| Tests               | Vitest, Playwright, pytest                                           |
| Hosting             | GitHub + Vercel Hobby (Phase 9)                                      |

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
npm run eval:scripture   # retrieval evaluation → evaluation/scripture-retrieval/results.json
```

## Rebuild the scripture data (optional)

The processed data is already in `src/data/scripture/`. To rebuild it from the original sources:

```bash
cd scripture-pipeline
pip install -r requirements.txt
python -m sanatana_pipeline.fetch    # download sources (checksummed)
python -m sanatana_pipeline.build    # import, validate, write JSON
python -m sanatana_pipeline.embed    # meaning-search vectors
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
Never commit API keys. For AI replies, create a free key at <https://aistudio.google.com/apikey>
and set `GEMINI_API_KEY` in `.env.local`, then restart `npm run dev`. `npm run eval:chat` runs the
chat evaluation against the real model.

## Documentation

See the [`docs/`](docs) folder, starting with [`project_status.md`](docs/project_status.md) and
[`architecture.md`](docs/architecture.md).
