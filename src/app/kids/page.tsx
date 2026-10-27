import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/kids");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "A caregiver chooses an age range: 4–5, 6–9 or 10–12.",
  "One complete illustrated, narrated story for each companion, with source and adaptation notes.",
  "Play, pause, replay and move between scenes.",
  "Picture choices, simple puzzles and comprehension questions.",
  "No child accounts, tracking, ads or open-ended AI chat.",
] as const;

export default function KidsPage() {
  return <ComingSoon path="/kids" details={DETAILS} />;
}
