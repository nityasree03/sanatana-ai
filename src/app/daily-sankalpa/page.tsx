import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/daily-sankalpa");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Set optional one-off or recurring intentions.",
  "Track progress, edit, pause or delete intentions at any time.",
] as const;

export default function DailySankalpaPage() {
  return <ComingSoon path="/daily-sankalpa" details={DETAILS} />;
}
