import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/dharma-lab");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Type or speak a real dilemma, then clarify your goals, values and constraints.",
  "See at least three possible paths. You can edit them or add your own.",
  "A visual branch map shows upsides, downsides and uncertainty. Nothing is predicted.",
  "Invite a companion or the Divine Council to reflect, with cited sources.",
  "You choose, or decide not to decide yet. Save, export or delete the map privately.",
] as const;

export default function DharmaLabPage() {
  return <ComingSoon path="/dharma-lab" details={DETAILS} />;
}
