import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/karma-reflection");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "A private journal: intention, action, outcome, learning and next step.",
  "Stored in your browser. Export or delete whenever you like.",
  "No numerical karma scores or spiritual judgments.",
] as const;

export default function KarmaReflectionPage() {
  return <ComingSoon path="/karma-reflection" details={DETAILS} />;
}
