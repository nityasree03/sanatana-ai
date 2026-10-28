"use client";

import { useState } from "react";
import { buttonPrimary } from "@/components/ui/Dialog";
import { enableSaving, storageAvailable } from "@/lib/journey/store";

/** What the person agrees to when turning saving on. Shown wherever saving would start. */
export function ConsentText() {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      <li>
        What you save stays <strong>only in this browser on this device</strong>. There are no
        accounts and nothing is sent to our server.
      </li>
      <li>
        It isn&apos;t synced: another device or browser won&apos;t see it. Private browsing, or
        clearing this browser&apos;s data, erases it, so export a copy if it matters to you.
      </li>
      <li>Anyone who uses this browser profile can open these pages and see it.</li>
      <li>
        Nothing you save is sent to an AI unless you choose to share it in a conversation, and the
        site tells you when it will be.
      </li>
      <li>You can export, import or delete everything at any time, and turn saving off again.</li>
    </ul>
  );
}

/** Opt-in panel: nothing is saved until the person presses the button. */
export function JourneyConsent({ onEnabled }: { onEnabled?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <section
      aria-labelledby="consent-title"
      className="rounded-2xl border border-gold/60 bg-accent-soft p-5"
    >
      <h2 id="consent-title" className="font-display text-2xl">
        Save your journey on this device?
      </h2>
      <p className="mt-1 text-sm">Saving is off until you turn it on. If you turn it on:</p>
      <div className="mt-2">
        <ConsentText />
      </div>
      <button
        type="button"
        className={`${buttonPrimary} mt-4`}
        onClick={() => {
          if (!storageAvailable()) {
            setError(
              "This browser isn't letting the site save anything (for example in some private modes).",
            );
            return;
          }
          try {
            enableSaving();
            onEnabled?.();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Turn on saving on this device
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
