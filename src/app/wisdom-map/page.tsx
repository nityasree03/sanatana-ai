import type { Metadata } from "next";
import { WisdomMap, type EvidencePassage } from "@/components/wisdomMap/WisdomMap";
import { withHref } from "@/lib/chat/answer";
import { getRoute } from "@/lib/routes";
import { getPassage } from "@/lib/scripture/data";
import { EDGES } from "@/lib/wisdomMap/graph";

const route = getRoute("/wisdom-map");
export const metadata: Metadata = { title: route.title, description: route.description };

function excerpt(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 320 ? `${t.slice(0, t.lastIndexOf(" ", 320))} …` : t;
}

export default function WisdomMapPage() {
  // Only the evidence passages are sent to the page.
  const evidence: Record<string, EvidencePassage> = {};
  for (const id of new Set(EDGES.flatMap((e) => e.evidence))) {
    const p = withHref(getPassage(id)!);
    evidence[id] = {
      id,
      reference: p.reference,
      href: p.href,
      translator: p.translation.translator,
      excerpt: excerpt(p.translation.text),
    };
  }
  return <WisdomMap evidence={evidence} />;
}
