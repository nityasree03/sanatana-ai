# Product requirements

Source of truth: _Sanatana AI — Complete Updated MVP Blueprint_ (27 Oct 2026) and the Claude Code
master prompt. This is a summary; nothing here removes a requirement from those documents.

## Product definition

ChatGPT-style chat + a visible animated companion on the left + authentic, attributed Hindu
scripture + optional speech input and voiced, animated output. Four AI-created, deity-inspired
personas: Krishna, Shiva, Hanuman, Parvati. These are clearly labelled simulations, not divine contact.

## Core experience

- **Desktop:** animated companion on the left; scrollable chat on the right; one composer with
  both keyboard and microphone. Speech never starts automatically; it can be stopped and replayed.
- **Mobile:** compact, collapsible avatar above the chat, with the same inputs and source cards.
- Loading, failure and fallback states are always shown.
- Avatar states: blink, idle, listening, thinking, speaking, error. Built from original or licensed
  2D artwork. No claims of phoneme-perfect lip sync.

## Companions and sources

| Companion | Voice                 | Source priorities                                            |
| --------- | --------------------- | ------------------------------------------------------------ |
| Krishna   | Warm, philosophical   | Bhagavad Gita; verified Mahabharata and Bhagavata selections |
| Shiva     | Calm, contemplative   | Legally reusable Shaiva and relevant Upanishadic passages    |
| Hanuman   | Encouraging, humble   | Valmiki Ramayana and verified devotional selections          |
| Parvati   | Compassionate, strong | Devi Gita, Devi Bhagavata and appropriate Shakta passages    |

Every passage carries provenance: scripture, section/verse, language, translation, translator,
edition, URL and license. Show original script + romanization (if available) + attributed English.

## Feature list

See the feature table in [project_status.md](project_status.md) (18 features, all required).

## Kids rules

Caregiver-operated, curated stories only. No child accounts, tracking, ads, stored voice
recordings, identifying data, default long-term memory or secrecy/dependency prompts. COPPA
review before any direct child use or data collection.

## Trust rules

No guaranteed karma, predictions, cures or divinely mandated decisions. Memory is opt-in. Ask
before sending saved journal text to an AI. Protect secrets, validate input, rate-limit, guard
against prompt injection, and support accessibility (labels, captions, reduced motion).
