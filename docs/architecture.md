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

See the README. Each route lives in `src/app/<route>/page.tsx`. A central route registry is added
in Phase 1.
