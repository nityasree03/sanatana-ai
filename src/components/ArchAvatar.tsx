import { getCompanion, type CompanionId } from "@/lib/companions";
import { CompanionSymbol } from "./CompanionSymbol";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "error";

const STATE_LABEL: Record<AvatarState, string> = {
  idle: "Ready",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

/**
 * Temple-arch frame with the AI aura and constellation.
 * In Phase 1 it holds a symbol placeholder; Phase 2 swaps in the animated portrait
 * without changing this frame.
 */
export function ArchAvatar({
  companionId,
  state = "idle",
  size = "lg",
  showState = true,
}: {
  companionId: CompanionId;
  state?: AvatarState;
  size?: "sm" | "lg" | "responsive";
  showState?: boolean;
}) {
  const companion = getCompanion(companionId);
  // "responsive" = compact on phones, full size from tablet width up.
  const dims = { lg: "h-64 w-52", sm: "h-36 w-28", responsive: "h-36 w-28 md:h-64 md:w-52" }[size];
  const symbol = {
    lg: "h-28 w-28",
    sm: "h-14 w-14",
    responsive: "h-14 w-14 md:h-28 md:w-28",
  }[size];

  return (
    <figure className="flex flex-col items-center gap-2 md:gap-3" data-avatar-state={state}>
      <div className={`relative ${dims}`}>
        {/* AI aura: pulses gently, faster while thinking */}
        <div
          aria-hidden="true"
          className={`aura absolute -inset-2 rounded-t-full rounded-b-2xl border border-accent ${
            state === "thinking" ? "aura-fast" : ""
          }`}
        />
        {/* Constellation dots: the "AI" layer around the traditional frame */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 250"
          className="absolute inset-0 h-full w-full text-accent"
        >
          <g fill="currentColor" opacity="0.55">
            <circle cx="10" cy="80" r="2.5" />
            <circle cx="190" cy="70" r="2.5" />
            <circle cx="40" cy="12" r="2" />
            <circle cx="160" cy="16" r="2" />
            <circle cx="4" cy="170" r="2" />
            <circle cx="196" cy="180" r="2" />
          </g>
          <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3">
            <path d="M10 80 L40 12 L160 16 L190 70" />
            <path d="M4 170 L10 80" />
            <path d="M196 180 L190 70" />
          </g>
        </svg>
        {/* Temple arch */}
        <div className="absolute inset-3 flex items-end justify-center rounded-t-full rounded-b-xl border-4 border-double border-gold bg-card pb-3 md:pb-6">
          <CompanionSymbol id={companionId} className={`${symbol} text-accent`} />
        </div>
      </div>
      <figcaption className="text-center">
        <span className="block font-display text-2xl font-semibold">{companion.name}</span>
        {showState && (
          <span className="text-sm text-accent" aria-live="polite">
            {STATE_LABEL[state]}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
