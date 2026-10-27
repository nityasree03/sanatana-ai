# Architecture

## Overview

```
Browser (Next.js React pages)
  ├─ Avatar engine (2D SVG/React, swappable)        ── Phase 2
  ├─ Speech engine (Web Speech API, swappable)      ── Phase 2
  ├─ Local storage (memory, reflections, Sankalpa)  ── Phase 6
  └─ calls ▼
Next.js server (route handlers, Zod validation, rate limits)
  ├─ Retrieval: hybrid keyword + semantic search over versioned scripture JSON ── Phase 3
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
`CompanionCard`, `avatars/Portrait` (four original SVG portraits sharing one animated face rig), `ChatScreen` (conversation state, composer, honest placeholder replies until
Phase 4) and `ComingSoon` (honest placeholder pages).

## Speech (Phase 2)

`src/lib/speech/types.ts` defines `SpeechInputAdapter` (speech-to-text) and `SpeechOutputAdapter`
(text-to-speech). The current implementations use the browser's Web Speech API
(`webSpeechInput.ts`, `webSpeechOutput.ts`). `voices.ts` holds per-companion rate/pitch and
friendly error messages. `ChatScreen` accepts adapters as props, so tests (and future engines) can
replace them.

Avatar state is derived in one place: error > listening > thinking > speaking > idle.
