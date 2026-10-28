import type { Metadata } from "next";
import { DharmaLabLoader } from "@/components/dharma/DharmaLabLoader";
import { getRoute } from "@/lib/routes";

const route = getRoute("/dharma-lab");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function DharmaLabPage() {
  return <DharmaLabLoader />;
}
