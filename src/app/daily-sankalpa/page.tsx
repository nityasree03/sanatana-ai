import type { Metadata } from "next";
import { DailySankalpa } from "@/components/journey/DailySankalpa";
import { getRoute } from "@/lib/routes";

const route = getRoute("/daily-sankalpa");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function DailySankalpaPage() {
  return <DailySankalpa />;
}
