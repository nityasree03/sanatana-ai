import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/my-journey");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Life Journey Memory: save only the goals you approve, stored in your browser.",
  "View, edit, export or delete your memories, or opt out entirely.",
  "Wisdom Tree: a visual tree of teachings you saved, each linked back to its scripture.",
] as const;

export default function MyJourneyPage() {
  return <ComingSoon path="/my-journey" details={DETAILS} />;
}
