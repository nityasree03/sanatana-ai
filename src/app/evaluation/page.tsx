import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { getRoute } from "@/lib/routes";

const route = getRoute("/evaluation");
export const metadata: Metadata = { title: route.title, description: route.description };

const DETAILS = [
  "Real, reproducible results for retrieval accuracy (Recall@5) and citation grounding.",
  "Persona consistency, memory deletion and consent tests.",
  "Speech, avatar, accessibility and mobile test results, including known limitations.",
] as const;

export default function EvaluationPage() {
  return <ComingSoon path="/evaluation" details={DETAILS} />;
}
