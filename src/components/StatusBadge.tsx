import { STATUS_LABEL, type RouteStatus } from "@/lib/routes";

const STYLES: Record<RouteStatus, string> = {
  ready: "border-accent/40 bg-accent-soft text-accent",
  preview: "border-gold/60 bg-leaf text-leaf-ink",
  planned: "border-line bg-card-2 text-muted",
};

/** Small label showing whether a page works today, is a preview, or is planned. */
export function StatusBadge({ status, phase }: { status: RouteStatus; phase?: number }) {
  const suffix = status !== "ready" && phase ? ` · Phase ${phase}` : "";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
      {suffix}
    </span>
  );
}
