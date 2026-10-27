import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/divine-council");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Ask one question and get four separate answers, one from each companion.",
  "Each answer is grounded in that companion's preferred scriptures, with citations.",
  "Listen to the answers one after another (optional speech).",
  "A transparent summary shows where the perspectives agree and differ.",
] as const;

export default function DivineCouncilPage() {
  return <ComingSoon path="/divine-council" details={DETAILS} />;
}
