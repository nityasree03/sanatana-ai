import type { Metadata } from "next";
import { Suspense } from "react";
import { MyJourneyScreen } from "@/components/journey/MyJourneyScreen";
import { getRoute } from "@/lib/routes";

const route = getRoute("/my-journey");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function MyJourneyPage() {
  // MyJourneyScreen reads ?tab= from the URL, so it sits inside a Suspense boundary.
  return (
    <Suspense
      fallback={
        <p role="status" className="mx-auto max-w-5xl px-4 py-16 text-muted">
          Opening My Dharma Journey…
        </p>
      }
    >
      <MyJourneyScreen />
    </Suspense>
  );
}
