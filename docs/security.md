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
