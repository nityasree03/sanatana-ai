# Deployment

Not deployed yet. Planned for Phase 9 on Vercel (Hobby plan), only with the owner's permission.

## Planned steps

1. Connect the GitHub repository to Vercel.
2. Add `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` and `CHAT_DAILY_LIMIT` as Vercel
   environment variables (never in code). Do not set `AI_PROVIDER` (it is for tests only).
3. Deploy, then run smoke tests against the live URL.
4. Record the real live URL here only after it works.

## Notes for deployment

- The build downloads the meaning-search model (`scripts/fetch-model.mjs`, about 23 MB, pinned
  revision and checked by SHA-256) into `models/minilm/`. It is not in git. Vercel must be able
  to reach huggingface.co during the build.
- `next.config.ts` lists `onnxruntime-web` as a server package and includes the model files in the
  API functions, so search and chat can embed questions on the server.
- Google's terms do not allow a free-tier key to serve users in the EEA, UK or Switzerland. Before
  opening the site to visitors there, a paid tier would be needed; that needs the owner's approval.
