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
  /scriptures, /scriptures/[work], /scriptures/[work]/[section]   prerendered from the JSON
  src/proxy.ts  unknown text/chapter paths → real 404 before rendering
  POST /api/scripture/search  Zod-validated, 60 requests/min per IP
     └─ searchScripture(): BM25 keyword ranks + optional vector ranks → reciprocal rank fusion (k=60)
  Browser (opt-in): transformers.js turns the query into a vector; engine files from /ort/
```

- **Why JSON files, not a database:** 1341 passages (≈2 MB) fit in memory, need no hosting or keys,
  and are versioned with the code.
- **Why query vectors in the browser:** the server stays free and fast (no model on Vercel), and
  the same model is used for passages and queries. Open question for Phase 4: compute query vectors
  on the server (or with the LLM provider) so chat retrieval does not depend on a 30 MB download.
- **Passage ids** are stable (`bg-2.47`, `katha-1.3.3`, `ram-5.1.41`, `devi-7.37.2-10.1`), so chat
  citations in Phase 4 can link straight to `/scriptures/<work>/<section>#<id>`.
