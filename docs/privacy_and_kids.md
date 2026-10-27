# Privacy and kids

## Adults

- Conversation context lasts for the session only by default.
- Long-term memory is opt-in, stored in the browser, and can be viewed, edited, exported and deleted.
- Saved journal or reflection text is never sent to an AI without a user action and a clear notice.
- No cross-device sync is promised (data stays in one browser).

## Voice

- The microphone only starts when the person presses it; nothing is recorded or stored by the site.
- Speech-to-text uses the browser's built-in recognition, which may send audio to the browser
  maker's speech service (for example Google in Chrome). This is disclosed on the About page.
- Spoken replies use voices on the device and never autoplay.

## Scripture search

- Keyword search sends the search words to our server; nothing is stored (only an in-memory
  per-IP counter for rate limiting).
- Meaning search is off unless the person ticks it. It downloads the MiniLM model from Hugging Face
  (Hugging Face sees the download) and the ONNX Runtime engine from this site. The query is turned
  into a vector on the device; the words and the vector are sent to our server to find passages.
- Disclosed under the search box and on the About page.

## Kids (Sanatana Kids)

- Caregiver-operated, curated stories and guided choices. No open-ended child AI chat.
- No child accounts, behavioural tracking, ads, stored microphone recordings or identifying data.
- No default long-term memory and no secrecy or dependency prompts.
- Characters are clearly identified as AI-generated representations.
- A COPPA and privacy review must happen before any direct use by children under 13 or any
  collection of covered child data.
