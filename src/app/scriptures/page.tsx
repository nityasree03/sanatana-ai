import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/scriptures");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Search and browse verses by work, chapter, theme and citation.",
  "Original script, romanized transliteration and attributed English translation where available.",
  "Full details for every passage: translator, edition, source link and licence.",
  "Keeps working even if the AI is unavailable.",
] as const;

export default function ScripturesPage() {
  return <ComingSoon path="/scriptures" details={DETAILS} />;
}
