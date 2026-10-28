"use client";

/**
 * Passing private text (e.g. a reflection) into the chat box without putting it in the URL, where it
 * would end up in browser history. It is kept in sessionStorage (this tab only) and read once.
 */
const KEY = "sanatana-chat-draft";
export const MAX_DRAFT = 2000;

export function setChatDraft(text: string) {
  try {
    sessionStorage.setItem(KEY, text.slice(0, MAX_DRAFT));
  } catch {
    // If storage is blocked the chat simply opens empty.
  }
}

/** Read the draft without removing it (safe to call more than once while rendering). */
export function peekChatDraft(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Remove the draft once it has been placed in the chat box, so a reload doesn't bring it back. */
export function clearChatDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
