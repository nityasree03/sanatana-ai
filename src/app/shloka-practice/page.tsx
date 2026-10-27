import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/shloka-practice");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Practise verses line by line with text and transliteration.",
  "Listen and repeat with recorded or synthesized audio.",
  "Careful, optional feedback that never exaggerates pronunciation accuracy.",
] as const;

export default function ShlokaPracticePage() {
  return <ComingSoon path="/shloka-practice" details={DETAILS} />;
}
