import type { Metadata } from "next";
import { WisdomForGenerations } from "@/components/generations/WisdomForGenerations";
import { withHref } from "@/lib/chat/answer";
import { TOPICS } from "@/lib/generations/topics";
import { getRoute } from "@/lib/routes";
import { getPassage, sourcesById } from "@/lib/scripture/data";
import type { Passage, SourceInfo } from "@/lib/scripture/types";

const route = getRoute("/wisdom-for-generations");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function WisdomForGenerationsPage() {
  // Only the passages and sources these topics use are sent to the page.
  const all = sourcesById();
  const passages: Record<string, Passage> = {};
  const hrefs: Record<string, string> = {};
  const sources: Record<string, SourceInfo> = {};
  for (const id of new Set(TOPICS.flatMap((t) => t.passages))) {
    const p = withHref(getPassage(id)!);
    passages[id] = getPassage(id)!;
    hrefs[id] = p.href;
    sources[p.translation.source_id] = all[p.translation.source_id];
    if (p.original) sources[p.original.source_id] = all[p.original.source_id];
  }
  return <WisdomForGenerations passages={passages} hrefs={hrefs} sources={sources} />;
}
