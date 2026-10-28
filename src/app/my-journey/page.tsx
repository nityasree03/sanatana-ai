import type { Metadata } from "next";
import { MyJourneyScreen } from "@/components/journey/MyJourneyScreen";
import { getRoute } from "@/lib/routes";

const route = getRoute("/my-journey");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function MyJourneyPage() {
  return <MyJourneyScreen />;
}
