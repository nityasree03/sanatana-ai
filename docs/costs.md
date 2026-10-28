# Costs

Target: **$0 extra per month** at low usage. This is a goal, not a guarantee; free tiers can change.

| Service    | Plan             | Cost | Notes                                                                                             |
| ---------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------- |
| GitHub     | Free             | $0   | Public repository                                                                                 |
| Vercel     | Hobby            | $0   | Eligibility and limits checked before deployment (Phase 9)                                        |
| Gemini API | Free tier        | $0   | No billing enabled. Quota errors fall back to a second free model, then to scripture-only replies |
| Speech     | Browser built-in | $0   | Availability varies by browser                                                                    |

Rule: no paid billing, purchases or paid datasets without the owner's explicit approval.

## Gemini free tier notes (checked 2026-10-27)

- Default model `gemini-3.8-flash`, fallback `gemini-3.5-flash-lite`; both on the free tier, no card.
- Free-tier limits are per Google Cloud project and can change; the site's own daily limit
  (`CHAT_DAILY_LIMIT`, default 60 per visitor) keeps usage low.
- On the free tier Google may use prompts and replies to improve its products, and people may
  review them. This is disclosed on the About page and next to the chat box.
- Meaning search runs a small model on our own server: no API cost.
- A Divine Council question makes 5 AI calls (4 answers + 1 comparison) and counts as 5 messages
  toward the per-visitor daily limit. Living Leela uses no AI.
