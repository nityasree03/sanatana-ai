# Project status

Last updated: 2026-10-27

Legend: **DONE** = built and tested · **IN PROGRESS** · **NOT STARTED**

## Phases

| Phase  | Scope                                                                                                                                                   | Status      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0      | Project setup: Next.js + TypeScript + Tailwind, tests (Vitest, Playwright, pytest), docs, GitHub                                                        | DONE        |
| 1 (M1) | Foundation: visual system, all routes and navigation, companion selection, left-avatar/right-chat layout, composer with honest "AI not connected" label | DONE        |
| 2 (M2) | Four animated 2D avatars, browser speech-to-text and text-to-speech, stop/replay, fallbacks                                                             | DONE        |
| 3 (M3) | Rights-cleared scripture collections, Python importer and validation, hybrid retrieval, Scripture Explorer                                              | NOT STARTED |
| 4 (M4) | Gemini provider adapter (server-only key), persona styles, grounded multi-turn chat, citations and abstention                                           | NOT STARTED |
| 5 (M5) | Companion handoff, Divine Council, Scripture Truth Lens, four Living Leela experiences                                                                  | NOT STARTED |
| 6 (M6) | Life Journey Memory, Wisdom Tree, Karma Reflection Mirror, Daily Sankalpa                                                                               | NOT STARTED |
| 7 (M7) | Dharma Lab, Scripture Learning Studio, Wisdom Knowledge Map, Shloka Practice Studio                                                                     | NOT STARTED |
| 8 (M8) | Sanatana Kids with four Talking Storybooks, caregiver controls, age modes, Wisdom for Generations                                                       | NOT STARTED |
| 9 (M9) | Evaluation, security and rights review, mobile/browser tests, Vercel deployment                                                                         | NOT STARTED |

## Features (all required for the MVP)

| #   | Feature                                                         | Route                          | Status                                                                                                               |
| --- | --------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Four selectable animated companions, unified text + speech chat | /companions, /chat             | IN PROGRESS (selection, layout, animated avatars, text + voice input and spoken replies done; AI answers in Phase 4) |
| 2   | Companion handoff with shared-context choice                    | /chat                          | NOT STARTED                                                                                                          |
| 3   | Divine Council                                                  | /divine-council                | NOT STARTED                                                                                                          |
| 4   | Scripture Truth Lens                                            | (in chat, council, Dharma Lab) | NOT STARTED                                                                                                          |
| 5   | Scripture Explorer                                              | /scriptures                    | NOT STARTED                                                                                                          |
| 6   | Living Leela (one per companion)                                | /living-leela                  | NOT STARTED                                                                                                          |
| 7   | Life Journey Memory                                             | /my-journey                    | NOT STARTED                                                                                                          |
| 8   | Wisdom Tree                                                     | /my-journey                    | NOT STARTED                                                                                                          |
| 9   | Karma Reflection Mirror                                         | /karma-reflection              | NOT STARTED                                                                                                          |
| 10  | Daily Sankalpa                                                  | /daily-sankalpa                | NOT STARTED                                                                                                          |
| 11  | Dharma Lab                                                      | /dharma-lab                    | NOT STARTED                                                                                                          |
| 12  | Scripture Learning Studio                                       | /scripture-learning            | NOT STARTED                                                                                                          |
| 13  | Wisdom Knowledge Map                                            | /wisdom-map                    | NOT STARTED                                                                                                          |
| 14  | Shloka Practice Studio                                          | /shloka-practice               | NOT STARTED                                                                                                          |
| 15  | Wisdom for Generations                                          | /wisdom-for-generations        | NOT STARTED                                                                                                          |
| 16  | Sanatana Kids / Talking Storybook (4 full stories)              | /kids                          | NOT STARTED                                                                                                          |
| 17  | Engineering Evaluation page                                     | /evaluation                    | NOT STARTED                                                                                                          |
| 18  | About / Privacy / Transparency pages                            | /about                         | NOT STARTED                                                                                                          |

## Phase 2 evidence

- Four original SVG portraits (gentle grown-up style): Krishna (blue skin, crown, peacock feather,
  tilak, garland), Shiva (jata with crescent moon and Ganga, tripundra, rudraksha, snake), Hanuman
  (crown, sindoor tilak, kundal, mace), Parvati (tiara, sindoor, maang tikka, bindi, saree).
- States: idle (breathing + blinking), listening (head tilt, fast aura), thinking (eyes up),
  speaking (mouth loop + waveform), error (concerned brows, red aura). Reduced motion stops animation.
- Speech-to-text: editable transcript, never auto-sends; clear messages for unsupported browsers,
  blocked microphone, no speech, no microphone, network.
- Text-to-speech: never auto-starts; per-message Listen / Stop / replay, "Speak replies" switch
  (off by default, also mutes), per-companion rate and pitch; starting the mic, sending or switching
  companion interrupts speech.
- Mouth movement is an approximate animation loop, not phoneme-accurate lip sync.
- Checks: 26 unit tests, 61 browser tests (desktop + phone) with controllable fake microphone and
  voice, axe scan while speaking, reduced-motion check.

## Phase 1 evidence

- All 17 routes exist and come from one registry (`src/lib/routes.ts`). Planned pages say honestly
  when they become functional.
- Visual system: ivory "Temple lamp" day theme, "Kailash night" theme (remembered), per-companion
  accent colours, temple-arch frame with AI aura and constellation, palm-leaf source cards,
  self-hosted fonts including Devanagari. All motion respects reduced-motion settings.
- Chat: companion from the URL or last choice, switching with a notice, text composer
  (Enter / Shift+Enter, 2000-character limit, clear errors), honest "not connected" reply,
  microphone button explains voice arrives in Phase 2, compact collapsible companion on phones.
- Checks: lint, typecheck, 16 unit tests, production build, 47 browser tests on desktop and
  phone including automated WCAG 2 A/AA scans (axe) of every page and of the chat in night theme.

## Phase 0 evidence

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` and
  `npm run test:py` all pass (see the Phase 0 commit).
- Home page is a placeholder that says "AI chat is not connected yet".

## Decisions and notes

- Design (approved 2026-10-27): ivory base, temple-arch companion frame, palm-leaf scripture cards,
  per-companion accents, AI aura / waveform / "wisdom thread", optional night theme, softer lotus
  look for Kids. Avatars: original art only; cute style for Kids, gentler grown-up style for chat.

- Google Fonts are not used (the build could not download them, and self-hosting avoids sending
  visitors' requests to Google). Self-hosted fonts arrive in Phase 1.
