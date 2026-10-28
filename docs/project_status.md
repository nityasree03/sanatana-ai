# Project status

Last updated: 2026-10-28

Legend: **DONE** = built and tested · **IN PROGRESS** · **NOT STARTED**

## Phases

| Phase  | Scope                                                                                                                                                   | Status      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0      | Project setup: Next.js + TypeScript + Tailwind, tests (Vitest, Playwright, pytest), docs, GitHub                                                        | DONE        |
| 1 (M1) | Foundation: visual system, all routes and navigation, companion selection, left-avatar/right-chat layout, composer with honest "AI not connected" label | DONE        |
| 2 (M2) | Four animated 2D avatars, browser speech-to-text and text-to-speech, stop/replay, fallbacks                                                             | DONE        |
| 3 (M3) | Rights-cleared scripture collections, Python importer and validation, hybrid retrieval, Scripture Explorer                                              | DONE        |
| 4 (M4) | Gemini provider adapter (server-only key), persona styles, grounded multi-turn chat, citations and abstention                                           | DONE        |
| 5 (M5) | Companion handoff, Divine Council, Scripture Truth Lens, four Living Leela experiences                                                                  | DONE        |
| 6 (M6) | Life Journey Memory, Wisdom Tree, Karma Reflection Mirror, Daily Sankalpa                                                                               | DONE        |
| 7 (M7) | Dharma Lab, Scripture Learning Studio, Wisdom Knowledge Map, Shloka Practice Studio                                                                     | DONE        |
| 8 (M8) | Sanatana Kids with four Talking Storybooks, caregiver controls, age modes, Wisdom for Generations                                                       | DONE        |
| 9 (M9) | Evaluation, security and rights review, mobile/browser tests, Vercel deployment                                                                         | NOT STARTED |

## Features (all required for the MVP)

| #   | Feature                                                         | Route                          | Status                                                                                                                  |
| --- | --------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Four selectable animated companions, unified text + speech chat | /companions, /chat             | DONE (four animated companions, text + voice, grounded Gemini replies; live evaluation 18/18)                           |
| 2   | Companion handoff with shared-context choice                    | /chat                          | DONE (dialog to choose shared messages or start fresh; divider shows what was shared)                                   |
| 3   | Divine Council                                                  | /divine-council                | DONE (four separate cited answers, AI comparison, Listen to all; live evaluation pending)                               |
| 4   | Scripture Truth Lens                                            | (in chat, council, Dharma Lab) | DONE (verified passage · AI interpretation · AI suggestion) in chat, Council and Dharma Lab                             |
| 5   | Scripture Explorer                                              | /scriptures                    | DONE (17 texts, 9,322 passages, Sanskrit where matched; keyword + meaning search on the server)                         |
| 6   | Living Leela (one per companion)                                | /living-leela                  | DONE (Krishna, Shiva, Hanuman, Parvati scenes; 31 moments, passages and paths tested)                                   |
| 7   | Life Journey Memory                                             | /my-journey                    | DONE (opt-in, browser-only goals; edit/delete/export; share per conversation)                                           |
| 8   | Wisdom Tree                                                     | /my-journey                    | DONE (save from chat, Council, Leela, Explorer; branches by theme; search, edit, delete)                                |
| 9   | Karma Reflection Mirror                                         | /karma-reflection              | DONE (five-part private journal; discuss in chat only on request; no scores)                                            |
| 10  | Daily Sankalpa                                                  | /daily-sankalpa                | DONE (once/daily/chosen days; done today; 7-day progress; pause; calendar file)                                         |
| 11  | Dharma Lab                                                      | /dharma-lab                    | DONE (typed or spoken dilemma; AI or own paths; branch map; companion or Council perspectives; decide or not yet; save) |
| 12  | Scripture Learning Studio                                       | /scripture-learning            | DONE (8 lessons, 2 per companion; Sanskrit where available; Listen; 3 questions each answered by a quoted line)         |
| 13  | Wisdom Knowledge Map                                            | /wisdom-map                    | DONE (31 nodes, 41 links, every link backed by a verse naming both ends; companion filter; table view)                  |
| 14  | Shloka Practice Studio                                          | /shloka-practice               | DONE (12 verses; Devanagari + IAST line by line; slow Listen, repeat ×3 with pauses; optional recitation check)         |
| 15  | Wisdom for Generations                                          | /wisdom-for-generations        | DONE (8 teachings, all four companions; child/teen/adult explanations and conversation starters; no AI)                 |
| 16  | Sanatana Kids / Talking Storybook (4 full stories)              | /kids                          | DONE (4 cited stories, 3 age ranges, narration, picture choice, order puzzle, matching, caregiver controls)             |
| 17  | Engineering Evaluation page                                     | /evaluation                    | NOT STARTED                                                                                                             |
| 18  | About / Privacy / Transparency pages                            | /about                         | NOT STARTED                                                                                                             |

## Phase 8 evidence (Sanatana Kids and Wisdom for Generations)

- **Four Talking Storybooks:** The Mountain Umbrella (Vishnu Purana 5.10–13), Hanuman's Great Leap
  (Valmiki Ramayana, Sundara Kanda), Nachiketa's Big Question (Katha Upanishad 1), Uma and the
  Piece of Straw (Kena Upanishad 3–4). Each: 6–7 original SVG scenes with descriptions, text for
  ages 4–5, 6–9 and 10–12, a verse line with reference for 10–12, narration with Play / Pause /
  Back / Next, picture choice, question, order puzzle and matching game, a gentle takeaway, source
  and "our changes" notes, and learning goals for the caregiver.
- **Caregiver controls:** grown-up check (a speed bump), age range, narration and speed,
  activities on/off, break reminder; settings for this tab only; optional progress (finished story
  ids only), deletable.
- **Wisdom for Generations:** 8 teachings across all four companions, each explained at three
  levels with a conversation starter; no AI.
- **Checks:** every scene cites existing passages of its companion; every 10–12 verse line and
  every key line appears word for word; a gentle-words test (it caught "plan fail" and
  "punishment"); our own phrases in single quotes, verse words in double quotes; all four stories
  played to the end at every age; browser tests prove no `/api` calls and nothing in localStorage
  unless progress is on; keyboard-only play; axe-clean on every story, desktop and phone; rain
  animation off with reduced motion.
- Tests: 334 unit, 127 browser (+1 skip), 28 Python.

## Phase 7 evidence (reflect and learn)

- **Dharma Lab:** dilemma typed or dictated, with "what matters" and "limits"; three AI-suggested
  paths (upsides, downsides, unknowns, first step), all editable, or your own paths; SVG branch map
  with keyboard-operable branches; perspectives from one companion or the Council, each with Truth
  Lens citations; "decide" or "not ready to decide"; save to My Dharma Journey, export, delete;
  first step → Daily Sankalpa.
- **Wisdom Knowledge Map:** 31 people, teachings, places and texts and 41 links. A test checks that
  every link's evidence passage names both ends (whole-word match); it caught one weak link, which
  was removed.
- **Scripture Learning Studio:** 8 lessons (2 per companion). A test checks every passage exists and
  that every answer's quote appears word for word in its verse; another checks each Devanagari key
  word really appears in the lesson's Sanskrit (it caught two sandhi forms).
- **Shloka Practice Studio:** 12 verses with verified Sanskrit and IAST paired line by line (test);
  device voice in Hindi when available, disclosed as approximate; opt-in recitation check, labelled
  as a rough guide.
- Tests: 292 unit, 113 browser (+1 skip), 28 Python; axe-clean on all new pages, desktop and phone.

## Phase 6 evidence (My Dharma Journey)

- **Private store:** one browser-only, Zod-validated entry, written only after opt-in; export,
  import (merge/replace), delete everything, turn off (keep read-only or delete); damaged data
  reported, never overwritten.
- **Life Journey Memory:** goals on /my-journey; "Remember as a goal" from your own chat messages
  (editable, consent first); "Share my goals" per conversation, off by default, reset on switching
  companion.
- **Wisdom Tree:** "Save to Wisdom Tree" on passages in chat, Council, Living Leela and the
  Scripture Explorer; SVG tree (branch per theme, keyboard leaves) plus searchable list.
- **Karma Reflection Mirror:** five-part journal, no scores; "Discuss with a companion" via the chat
  box (sessionStorage, never sent automatically); next step to Sankalpa.
- **Daily Sankalpa:** once/daily/chosen days, today checklist, gentle 7-day progress, pause/resume,
  .ics calendar reminders.
- Tests: 179 unit, 101 browser (+1 skip), 28 Python; axe-clean on all new pages. Fixes found on the
  way: Next.js build rule for "today", tab links on client navigation, "Label in Name" for save and
  card buttons, `zod` declared as a dependency.

## Phase 5 evidence (interaction features)

- **Truth Lens:** each cited passage shows three labelled layers; the passage text always comes
  from the library. The AI reply is retried once if it can't be read.
- **Companion Handoff:** accessible dialog (focus trapped, Escape cancels, axe-clean); only the
  ticked messages are sent, framed as background from another companion.
- **Divine Council:** four parallel answers from each companion's own texts, an AI comparison
  labelled as such, sequential speech; a question counts as 5 messages toward the limits.
- **Living Leela:** four hand-written scenes (31 moments, 92 passage links), each moment labelled
  "our summary, not scripture" beside its verified passages; tests check passages, order and paths.
- Data 1.1.2: 100 scanning/typo corrections in total.
- Tests: 138 unit, 95 browser (+1 skip), 28 Python; lint, types, formatting clean; full axe scans
  on the new pages. Accessibility fix: header names now match their visible text.
- **Pending:** run `npm run eval:chat` on the Mac (now includes 3 Divine Council questions).

## Phase 4 evidence (grounded chat)

- Chat replies cite verified passages shown as a "wisdom thread" with links to the Scripture
  Explorer; the AI's explanation is labelled "Why it's here (AI)".
- Three honest modes: Gemini (with key), scripture-only (no key or AI error), practice (tests).
- Crisis messages answered with fixed resources, never sent to the AI.
- Meaning search moved to the server; held-out retrieval Hit@5 0.17 (keyword) → 0.42 (hybrid +
  teaching preference). See `docs/evaluation.md`.
- Tests: 92 unit, 87 browser (+1 skip), 25 Python; lint, types and formatting clean.
- Real Gemini evaluation, run 1: 17/18 automatic checks passed; reading the replies found 4 more
  problems, all fixed (see `docs/evaluation.md`). Scripture data 1.1.1: 91 scanning corrections.
- Run 2 confirmed the fixes: 18/18 (after correcting one checker regex).

## Phase 3b evidence (more translations)

- 10 more public-domain sources: Telang and Arnold Gitas, Ganguli's Mahabharata (Krishna's peace
  mission, the Gita, Shiva's thousand names), Dutt's Vishnu Purana and complete Ramayana, Growse's
  Ramcharitmanas, Hume's 13 Upanishads (fills the 7 Svetasvatara verses Müller's scan lacked),
  Griffith's Kumarasambhava, Pargiter's Devi Mahatmya, Sastry's Lalita Sahasranama.
- Sanskrit from Sanskrit Wikisource for 472 Upanishad verses and the Devi Mahatmya, paired only
  where verse counts agree (a mismatch in Kena 1 was caught and left unpaired).
- Partial work found in the workspace (made outside this conversation) was reviewed and fixed:
  a 14,800-word Ramcharitmanas passage, leaked page headers and footnotes, dropped verse lines in
  the Devi Mahatmya, OCR name damage in Telang and Lalita.
- Texts are grouped by companion; long texts prerender their first 40 chapters and render the rest
  on first visit. Hanuman Chalisa not included (no verifiable free source or free translation).
- Evaluation: topic questions unchanged, everyday questions worse with the larger library
  (docs/evaluation.md) — input for Phase 4 ranking work.
- Checks: 52 unit, 25 Python, 85 browser tests (+1 phone-only skip).

## Phase 3 evidence

- Seven public-domain texts, 1341 passages: Bhagavad Gita 701 (Sanskrit + IAST + Besant), Ramayana
  Sundara Kanda 232 (Griffith), Isa 18 / Katha 119 / Kena 34 (Paramananda), Svetasvatara 106 of 113
  (Müller, OCR-cleaned), Devi Gita 131 (Vijnanananda, 128 checked against the scan). Register and
  caveats: docs/data_sources.md.
- Python pipeline: fetch with checksums, importers, validation (0 problems), build, embeddings.
- Scripture Explorer: search with text and companion filters, ~100 prerendered chapter pages, verse
  cards with Devanagari, IAST, English and a "Source and licence" panel; real 404s for unknown pages.
- Search: BM25 keyword (default) + opt-in meaning search in the browser, fused by rank. Measured on
  24 labelled questions: keyword Hit@5 0.83, meaning 0.67, hybrid 0.79 (docs/evaluation.md).
- Fixed along the way: a contrast failure on search results (found by axe), the hidden third-party
  CDN download in transformers.js, the meaning-search fallback message being overwritten, and a
  capital-V transcription artifact in the Devi Gita ("IsVara" → "Isvara").
- Checks: 51 unit, 22 Python, 79 browser tests (+1 phone-only skip), retrieval evaluation.

## Phase 2 evidence

- Update (2026-10-27): the default portraits are now the owner's illustrated artwork (24 expression
  images, see docs/data_sources.md); the drawn SVG portraits remain as a fallback style.

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
