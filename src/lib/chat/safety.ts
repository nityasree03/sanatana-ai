/**
 * A deliberately simple, high-recall check for messages that may mention suicide or self-harm.
 * When it matches, the chat does not send the message to the AI; it replies with care and
 * crisis resources instead. False positives are acceptable; missing someone in danger is not.
 */
const CRISIS = new RegExp(
  [
    String.raw`\b(kill|killing|hurt|hurting|harm|harming|cut|cutting|end|ending)\s+(my\s*self|myself)\b`,
    String.raw`\bsuicid\w*`,
    String.raw`\bself[\s-]?harm\w*`,
    String.raw`\b(want|wanna|going|plan(ning)?|ready|thinking about how)\s+to\s+die\b`,
    String.raw`\b(end|ending|ended|take|taking|took)\s+(my|it)\s+(own\s+)?(life|all)\b`,
    String.raw`\b(don'?t|do not|no longer|never)\s+(want|wanting)\s+to\s+(live|be alive|exist|wake up)\b`,
    String.raw`\bwish\s+(i\s+)?(was|were|could be)\s+dead\b`,
    String.raw`\bbetter\s+off\s+(dead|without\s+me)\b`,
    String.raw`\bno\s+(reason|point)\s+(to|in)\s+(live|living|going on)\b`,
    String.raw`\bkill\s+me\b`,
    String.raw`\boverdos(e|ing)\b`,
  ].join("|"),
  "i",
);

export function mentionsSelfHarm(text: string): boolean {
  return CRISIS.test(text);
}

export const CRISIS_REPLY =
  "I'm really glad you told me, and I'm sorry you're carrying this much pain. You deserve support from a real person right now. " +
  "If you might act on these thoughts or are in danger, please call your local emergency number. " +
  "In the US you can call or text 988 (Suicide & Crisis Lifeline); in India you can call Tele-MANAS at 14416; " +
  "elsewhere, findahelpline.com lists free, confidential lines in your country. " +
  "If you can, reach out to someone you trust and let them know how you're feeling. " +
  "I'm an AI and can't keep you safe, but you don't have to go through this alone.";
