import type { Metadata } from "next";
import { KidsLoader } from "@/components/kids/KidsLoader";
import { STORIES } from "@/lib/kids/stories";
import { getRoute } from "@/lib/routes";
import { getPassage } from "@/lib/scripture/data";

const route = getRoute("/kids");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function KidsPage() {
  // Only the references of the verses quoted for ages 10–12 are sent to the page.
  const references: Record<string, string> = {};
  for (const s of STORIES)
    for (const scene of s.scenes)
      references[scene.verse.passage] = getPassage(scene.verse.passage)!.reference;
  return <KidsLoader references={references} />;
}
