# Privacy and kids

## Adults

- Conversation context lasts for the session only by default.
- Long-term memory is opt-in, stored in the browser, and can be viewed, edited, exported and deleted.
- Saved journal or reflection text is never sent to an AI without a user action and a clear notice.
- No cross-device sync is promised (data stays in one browser).

### How Phase 6 implements this

- **One store, off by default:** goals, Wisdom Tree leaves, reflections and Sankalpas live in one
  localStorage entry (`sanatana-journey`). Nothing is written until the person presses "Turn on
  saving on this device" (or confirms the same consent text inside a save dialog). The consent
  explains: browser-only, not synced, erased by private browsing or clearing browser data, visible
  to anyone using the same browser profile, never sent to an AI without a choice.
- **Control:** My data exports everything to a JSON file, imports it (merge or replace; invalid
  files are rejected without changes) and deletes everything. Turning saving off offers "keep
  read-only" or "delete".
- **Goals and the AI:** sent only while "Share my N saved goals with <companion> in this
  conversation" is ticked. It is off by default, resets when switching companion, and says that
  the goals go to Google Gemini.
- **Reflections and the AI:** "Discuss with a companion" shows exactly what will go in the chat box,
  passes it through this tab's sessionStorage (never the URL or history), and nothing is sent until
  the person presses Send. The draft is removed after it is placed in the box.
- **No profiling or scores:** the site never derives anything from saved text, and the Reflection
  Mirror and Daily Sankalpa show no karma scores, points or streaks.
- **Reminders:** calendar files (.ics) the person downloads; no notification permission is asked.

## Voice

- The microphone only starts when the person presses it; nothing is recorded or stored by the site.
- Speech-to-text uses the browser's built-in recognition, which may send audio to the browser
  maker's speech service (for example Google in Chrome). This is disclosed on the About page.
- Spoken replies use voices on the device and never autoplay.

## Scripture search

- Keyword search sends the search words to our server; nothing is stored (only an in-memory
  per-IP counter for rate limiting).
- Meaning search now runs on our server (Phase 4): nothing is downloaded to the device and no
  third party sees the query.
- Disclosed under the search box and on the About page.

## Chat (Phase 4)

- Messages go to our server, which finds passages and, when an AI is connected, sends the recent
  conversation (last 10 turns) plus those passages to Google Gemini. Nothing is stored on our side
  and message text is never logged.
- On Gemini's free tier Google may use and human-review what is sent. People are told not to share
  private details, next to the chat box and on the About page.
- Messages that mention self-harm are not sent to the AI; the person gets crisis resources
  (988 in the US, Tele-MANAS 14416 in India, findahelpline.com elsewhere, local emergency number).
- Without a key the chat shows only scripture passages and says so.

## Phase 5 features

- **Companion Handoff:** when switching companion after a conversation, a dialog lists the
  messages; only the ones the person ticks are sent to the new companion (framed as background
  from another AI companion). "Start fresh" sends nothing. Nothing is shared without this choice.
- **Divine Council:** the question goes to Gemini once per companion (four calls) and once more
  for the comparison. Not stored or logged. A crisis message is answered once with resources and
  is not sent to the AI.
- **Living Leela:** fixed, hand-written scenes; progress stays in the page and is never saved or
  sent. "Ask the companion" only pre-fills the chat box; the person decides whether to send.

## Phase 7 features

- **Dharma Lab:** the dilemma and fields are sent to Gemini only when the person asks for paths or
  a perspective (four times for the Council). The draft stays in sessionStorage for the tab; a
  decision is kept only if saved to My Dharma Journey (opt-in store), and can be exported or
  deleted.
- **Wisdom Map, Learning Studio, Shloka Practice:** no data leaves the browser; quiz answers and
  practice are not saved.
- **Recitation check:** off until the person ticks it; uses the browser's speech recognition
  (which may send audio to the browser maker, as stated on the page); the site records and stores
  nothing.

## Kids (Sanatana Kids)

- Caregiver-operated, curated stories and guided choices. No open-ended child AI chat.
- No child accounts, behavioural tracking, ads, stored microphone recordings or identifying data.
- No default long-term memory and no secrecy or dependency prompts.
- Characters are clearly identified as AI-generated representations.
- A COPPA and privacy review must happen before any direct use by children under 13 or any
  collection of covered child data.
