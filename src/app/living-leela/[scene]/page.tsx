import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeelaPlayer } from "@/components/leela/LeelaPlayer";
import { withHref, type LinkedPassage } from "@/lib/chat/answer";
import { SCENES, getScene } from "@/lib/leela/scenes";
import { getPassage } from "@/lib/scripture/data";

export function generateStaticParams() {
  return SCENES.map((s) => ({ scene: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scene: string }>;
}): Promise<Metadata> {
  const scene = getScene((await params).scene);
  return { title: scene ? `${scene.title} · Living Leela` : "Living Leela" };
}

export default async function LeelaScenePage({ params }: { params: Promise<{ scene: string }> }) {
  const scene = getScene((await params).scene);
  if (!scene) notFound();
  // Only the passages this scene uses are sent to the page.
  const passages: Record<string, LinkedPassage> = {};
  for (const m of scene.moments)
    for (const id of m.passages) passages[id] ??= withHref(getPassage(id)!);
  return <LeelaPlayer scene={scene} passages={passages} />;
}
