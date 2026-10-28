import type { Metadata } from "next";
import { CouncilScreen } from "@/components/council/CouncilScreen";
import { getRoute } from "@/lib/routes";

const route = getRoute("/divine-council");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function DivineCouncilPage() {
  return <CouncilScreen />;
}
