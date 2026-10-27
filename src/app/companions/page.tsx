import type { Metadata } from "next";
import { CompanionCard } from "@/components/CompanionCard";
import { COMPANIONS } from "@/lib/companions";
import { getRoute } from "@/lib/routes";
import { SITE } from "@/lib/site";

const route = getRoute("/companions");
export const metadata: Metadata = { title: route.title, description: route.description };

export default function CompanionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">{route.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Each companion has its own way of speaking and its own preferred scriptures. Choose one to
        start a conversation.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted">{SITE.aiDisclosure}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {COMPANIONS.map((c) => (
          <CompanionCard key={c.id} companion={c} />
        ))}
      </div>
    </div>
  );
}
