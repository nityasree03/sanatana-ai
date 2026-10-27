import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/scripture-learning");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Source-backed lessons with contextual meanings.",
  "Verse audio where available.",
  "Comprehension questions to check understanding.",
] as const;

export default function ScriptureLearningPage() {
  return <ComingSoon path="/scripture-learning" details={DETAILS} />;
}
