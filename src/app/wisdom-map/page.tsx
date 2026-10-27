import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/wisdom-map");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "An interactive map linking teachings, concepts, people and stories.",
  "Only verified connections are shown. No links are invented.",
  "Each connection links back to its source passage.",
] as const;

export default function WisdomMapPage() {
  return <ComingSoon path="/wisdom-map" details={DETAILS} />;
}
