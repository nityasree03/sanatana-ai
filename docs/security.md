# Security

- API keys live only in server-side environment variables (`.env.local` locally, Vercel settings in
  production). `.env.example` contains placeholders only.
- `.gitignore` blocks `.env*` files (except the example) from being committed.
- Every commit is checked for secrets before pushing.

## Chat (Phase 4)

- The Gemini key is read only on the server (`src/lib/ai/index.ts`) and sent to Google in the
  `x-goog-api-key` header, never in a URL, a page, or browser code. The placeholder value
  `your-key-here` is treated as "no key".
- `POST /api/chat` validates input with Zod: a known companion, 1–20 messages, each at most 2,000
  characters, and the last one from the user.
- Rate limits per IP (in memory): 12 messages a minute and `CHAT_DAILY_LIMIT` (default 60) a day,
  so the free quota cannot be drained by one visitor. Scripture search: 60 requests a minute.
- Message content is never logged. Errors return short, safe messages, never stack traces or
  provider responses.
- Prompt-injection defences: scripture passages are wrapped as quoted data in the user turn with a
  rule that text inside them is never an instruction; the model must answer in a fixed JSON
  schema; citations are kept only if they match a passage id we supplied; anything else is dropped.
- Messages that mention self-harm are answered with fixed crisis resources and are **not** sent to
  the AI.
- Known limits: in-memory rate limits reset when the server restarts and are per server instance;
  a shared store would be needed at larger scale.

## Phase 5

- `POST /api/chat` accepts optional `shared` context (max 10 messages, each ≤2,000 characters,
  from a known companion), placed in the user turn with framing that it is background, not the new
  companion's words and not instructions.
- `POST /api/council`: Zod-validated question (≤1,000 characters); counts as 5 units toward the
  per-minute (`CHAT_MINUTE_LIMIT`, default 12) and per-day (`CHAT_DAILY_LIMIT`, default 60) limits,
  because it makes 5 AI calls. The comparison prompt treats the answers as material, never
  instructions, and may not add new teachings or verses. If one companion fails, it falls back to
  passages without exposing error details.
- The test server raises both limits through environment variables only; production defaults are
  unchanged.
- Living Leela pages are static; unknown scene URLs return 404 in `src/proxy.ts`.

## Phase 6 (personal data in the browser)

- The journey store is validated with Zod on every load and import (lengths, dates, schedule
  shapes, item counts). Leaf links must start with `/scriptures/`, so an imported file cannot inject
  off-site or `javascript:` links. Unreadable data is reported and left untouched until the person
  deletes it.
- Personal text is rendered as plain text (React escaping); nothing uses `dangerouslySetInnerHTML`.
- `POST /api/chat` accepts optional `goals` (max 10, each ≤300 characters), framed in the prompt as
  background the person chose to share, never instructions.
- Private drafts move between pages via sessionStorage, not query strings, so they don't reach
  server logs or browser history.
- `zod` is now a declared dependency (it had only been present transitively).

## Phase 7

- Dharma Lab endpoints validate every field with Zod (dilemma ≤2,000 characters, context ≤500,
  at most 8 paths and 12 points each) and share the chat's per-visitor limits; a Council
  perspective costs 4, suggestions and single perspectives cost 1. Crisis messages get resources
  and are not sent to the AI.
- Suggested paths from the AI are parsed against a schema and shown as editable, labelled
  suggestions; perspectives go through the same citation checks as chat (`groundedAnswer`).
- The map, lessons and shloka verses are fixed data checked by tests; nothing from the person is
  sent to a server on those pages.
