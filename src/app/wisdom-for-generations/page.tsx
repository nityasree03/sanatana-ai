import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/wisdom-for-generations");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "The same teaching explained at three levels: child (with a caregiver), teen and adult.",
  "Age-appropriate content and privacy safeguards for each level.",
] as const;

export default function WisdomForGenerationsPage() {
  return <ComingSoon path="/wisdom-for-generations" details={DETAILS} />;
}
