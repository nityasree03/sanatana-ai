import type { Metadata } from "next";
import { ReflectionMirror } from "@/components/journey/ReflectionMirror";
import { getRoute } from "@/lib/routes";

const route = getRoute("/karma-reflection");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function KarmaReflectionPage() {
  return <ReflectionMirror />;
}
