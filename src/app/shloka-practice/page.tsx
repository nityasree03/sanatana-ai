import type { Metadata } from "next";
import { ShlokaStudio, type ShlokaVerse } from "@/components/shloka/ShlokaStudio";
import { withHref } from "@/lib/chat/answer";
import { getRoute } from "@/lib/routes";
import { getPassage } from "@/lib/scripture/data";
import { SHLOKAS, pairLines } from "@/lib/shloka/verses";

const route = getRoute("/shloka-practice");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function ShlokaPracticePage() {
  const verses: ShlokaVerse[] = SHLOKAS.map(({ passage, title }) => {
    const p = withHref(getPassage(passage)!);
    return {
      id: p.id,
      title,
      reference: p.reference,
      href: p.href,
      lines: pairLines(p.original!.text, p.transliteration!.text),
      english: p.translation.text,
      translator: p.translation.translator,
    };
  });
  return <ShlokaStudio verses={verses} />;
}
