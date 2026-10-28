"use client";

import type { ReactNode } from "react";
import { buttonDanger } from "@/components/ui/Dialog";
import type { Journey } from "@/lib/journey/schema";
import { deleteEverything } from "@/lib/journey/store";
import { useJourney } from "@/lib/journey/useJourney";
import { JourneyConsent } from "./JourneyConsent";

function hasData(j: Journey) {
  return (
    j.goals.length +
      j.leaves.length +
      j.reflections.length +
      j.sankalpas.length +
      j.decisions.length >
    0
  );
}

/**
 * Shared wrapper for the journey pages:
 * - waits for browser data (no flash of "nothing saved"),
 * - offers to delete data that can't be read,
 * - shows the opt-in panel until saving is on,
 * - shows kept data read-only after saving is turned off.
 */
export function JourneyGate({
  children,
}: {
  children: (journey: Journey, readOnly: boolean) => ReactNode;
}) {
  const { journey, damaged, ready } = useJourney();
  if (!ready) {
    return (
      <p role="status" className="text-muted">
        Opening what&apos;s saved in this browser…
      </p>
    );
  }
  if (damaged) {
    return (
      <section role="alert" className="rounded-2xl border border-red-700 p-5">
        <h2 className="font-display text-2xl">Your saved data can&apos;t be read</h2>
        <p className="mt-1 text-sm">
          Something changed it outside this site, so it doesn&apos;t match the expected format. It
          hasn&apos;t been touched. You can delete it and start again.
        </p>
        <button type="button" className={`${buttonDanger} mt-3`} onClick={deleteEverything}>
          Delete the unreadable data
        </button>
      </section>
    );
  }
  if (!journey.enabled && !hasData(journey)) return <JourneyConsent />;
  return (
    <>
      {!journey.enabled && (
        <div className="mb-6">
          <p className="mb-3 rounded-xl border border-line bg-card p-3 text-sm">
            Saving is off. What you saved earlier is shown read-only. Turn saving on again to add or
            change things.
          </p>
          <JourneyConsent />
        </div>
      )}
      {children(journey, !journey.enabled)}
    </>
  );
}
