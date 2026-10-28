# Architecture

## Overview

```
Browser (Next.js React pages)
  ├─ Avatar engine (2D SVG/React, swappable)        ── Phase 2
  ├─ Speech engine (Web Speech API, swappable)      ── Phase 2
  ├─ Local storage (memory, reflections, Sankalpa)  ── Phase 6
  └─ calls ▼
Next.js server (route handlers, Zod validation, rate limits)
  ├─ Retrieval: hybrid keyword + semantic search over versioned scripture JSON ── Phase 3 (done)
  └─ LLM provider adapter (Gemini first, swappable) ── Phase 4
Offline: scripture-pipeline/ (Python) → validated, licensed passages + index ── Phase 3
```

## Principles

- **Swappable providers:** LLM, embeddings, speech and avatar sit behind small interfaces so they
  can be replaced later.
- **Portable data:** scripture is stored as versioned JSON with a source manifest.
- **Graceful failure:** if the AI quota runs out, the Scripture Explorer still works.
- **Secrets stay on the server:** API keys are never sent to the browser.

## Folder layout

See the README. Each route lives in `src/app/<route>/page.tsx` and is listed once in
`src/lib/routes.ts` (the route registry). Companion profiles live in `src/lib/companions.ts`.

Key components (`src/components/`): `SiteHeader` / `SiteFooter` (navigation from the registry),
`ThemeToggle`, `ArchAvatar` (temple-arch frame; Phase 2 adds the animated portrait inside it),
`CompanionCard`, `avatars/IllustratedPortrait` (default: stacked expression images switched by CSS state) and `avatars/Portrait` (fallback SVG portraits), `ChatScreen` (conversation state, composer, honest placeholder replies until
Phase 4) and `ComingSoon` (honest placeholder pages).

## Speech (Phase 2)

`src/lib/speech/types.ts` defines `SpeechInputAdapter` (speech-to-text) and `SpeechOutputAdapter`
(text-to-speech). The current implementations use the browser's Web Speech API
(`webSpeechInput.ts`, `webSpeechOutput.ts`). `voices.ts` holds per-companion rate/pitch and
friendly error messages. `ChatScreen` accepts adapters as props, so tests (and future engines) can
replace them.

Avatar state is derived in one place: error > listening > thinking > speaking > idle.

## Scripture data and search (Phase 3)

```
scripture-pipeline/ (Python, offline, never deployed)
  fetch.py      download sources → raw/ (git-ignored) + raw_manifest.json (SHA-256)
  importers/    one per source: parse, clean, align → Passage records
  provenance.py validate: ids, sources, licence fields, status, companions, no boilerplate/URLs
  build.py      → src/data/scripture/{passages,works,manifest}.json   (data version 1.0.0)
  embed.py      MiniLM ONNX → src/data/scripture/embeddings.json (384 dims, int8, base64)

Next.js
  /scriptures, /scriptures/[work], /scriptures/[work]/[section]   prerendered (first 40 chapters per text; the rest on first visit)
  src/proxy.ts  unknown text/chapter paths → real 404 before rendering
  POST /api/scripture/search  Zod-validated, 60 requests/min per IP
     └─ searchScripture(): BM25 keyword ranks + optional vector ranks → reciprocal rank fusion (k=60)
  Server (Phase 4): the query is turned into a vector on the server (see below)
```

- **Why JSON files, not a database:** 9,321 passages (≈13 MB, plus 5 MB of vectors) fit in memory, need no hosting or keys,
  and are versioned with the code.
- **Query vectors on the server (Phase 4):** first done in the browser (opt-in, 30 MB download);
  moved to the server so chat retrieval always has meaning search. See "Chat" below.
- **Passage ids** are stable (`bg-2.47`, `katha-1.3.3`, `ram-5.1.41`, `devi-7.37.2-10.1`), so chat
  citations in Phase 4 can link straight to `/scriptures/<work>/<section>#<id>`.

## Chat (Phase 4)

```
Browser (ChatScreen)  ──POST /api/chat { companion, messages[≤20] }──▶  route.ts
  1. rate limits (12/min, daily cap) → Zod validation
  2. crisis check (safety.ts) → fixed support reply, AI never called
  3. embedQueryOnServer()  WordPiece tokenizer (wordpiece.ts) + MiniLM int8 via onnxruntime-web (WASM)
  4. chatPassages()  hybrid search, companion's own texts first, ≤2 per chapter, 6 in total
  5. provider = getProvider(env)
       none     → "scripture only" reply: the passages and a notice
       practice → deterministic stand-in (tests and screenshots only)
       gemini   → system prompt (persona style + 9 rules) + history + passages as quoted data
                  → JSON reply {reply, citations[{id, how}], grounded}
  6. parseReply()  keeps only citations whose id we supplied; grounded only if one survives
  7. response { mode, reply, citations (linked to /scriptures/…#id), related, notice }
```

- **Provider adapter** (`src/lib/ai/`): one `AiProvider` interface; Gemini uses REST with a 25 s
  timeout, maps errors to quota / unavailable / blocked / bad-response, and tries the fallback model
  on quota or outage. Any failure still returns passages with an honest notice.
- **The AI never writes scripture.** Passage text shown in the "wisdom thread" comes from our data,
  not from the model; the model only explains why a passage is relevant ("Why it's here (AI)").
- **Teaching preference:** for personal questions, passages from teaching texts (Gita, Upanishads,
  Devi Gita…) get a small ranking bonus over story passages.

## Phase 5: Truth Lens, Handoff, Divine Council, Living Leela

- **Shared grounded answer** (`src/lib/chat/answer.ts`): `groundedAnswer()` is used by chat and the
  Council. It builds the prompt, asks for the JSON reply, checks citations and retries once if the
  reply can't be read (not on quota, outage or safety blocks).
- **Truth Lens:** every citation carries three layers: the passage text from our library
  (📜 verified scripture), `how` (💭 AI interpretation) and `reflection` (🌱 AI-suggested
  reflection). `ThreadPassage` shows them as separate, labelled parts.
- **Companion Handoff:** client-side. Switching after real exchanges opens `HandoffDialog`; the
  chosen messages are stored on the handoff divider and sent as `shared` with each later request
  to that companion.
- **Divine Council** (`/api/council`, `CouncilScreen`): one embedding, then per companion
  `chatPassages(..., ownOnly: true)` and `groundedAnswer()` with Council instructions, in parallel
  (`Promise.allSettled`); then one comparison call (`SYNTHESIS_SCHEMA`) from the answers only.
  "Listen to all" speaks the answers in order with each companion's voice settings.
- **Living Leela** (`src/lib/leela/scenes.ts`, `LeelaPlayer`): static scene graphs, no AI. Each
  moment has a hand-written retelling and the passage ids it summarises; pages are prerendered and
  only the passages a scene uses are sent to the browser.
