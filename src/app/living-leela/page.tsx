import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/living-leela");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "One interactive, source-linked scene for each of the four companions.",
  "Your choices change what you explore and discuss, never the original story.",
  "Every scene links back to the verified passages it is based on.",
] as const;

export default function LivingLeelaPage() {
  return <ComingSoon path="/living-leela" details={DETAILS} />;
}
