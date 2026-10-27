# Security

- API keys live only in server-side environment variables (`.env.local` locally, Vercel settings in
  production). `.env.example` contains placeholders only.
- `.gitignore` blocks `.env*` files (except the example) from being committed.
- Every commit is checked for secrets before pushing.
- Planned (Phase 4): Zod input validation, length limits, rate limiting, safe error messages, and
  prompt-injection defences (scripture text is treated as data, never as instructions).
