import { getCompanion, type CompanionId } from "@/lib/companions";
import { SITE } from "@/lib/site";
import { IllustratedPortrait } from "./avatars/IllustratedPortrait";
import { Portrait } from "./avatars/Portrait";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "error";

export const STATE_LABEL: Record<AvatarState, string> = {
  idle: "Ready",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

/** Animated bars shown while the companion speaks. */
export function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-6 items-center gap-[3px]" data-active={active}>
      {[0.1, 0.25, 0.05, 0.3, 0.15, 0.35, 0.2].map((delay, i) => (
        <span
          key={i}
          className={`h-6 w-[3px] rounded-full bg-accent ${active ? "wave-bar" : "scale-y-[0.2] opacity-40"}`}
          style={active ? { animationDelay: `${delay}s` } : undefined}
        />
      ))}
    </span>
  );
}

/**
 * The companion inside a temple-arch frame with the AI aura and constellation.
 * The portrait reacts to `state` through the data-avatar-state attribute (see globals.css).
 */
export function ArchAvatar({
  companionId,
  state = "idle",
  size = "lg",
  showState = true,
  variant = SITE.avatarStyle,
  caption = true,
  animated,
}: {
  companionId: CompanionId;
  state?: AvatarState;
  size?: "sm" | "lg" | "responsive";
  showState?: boolean;
  /** "illustrated" = expression artwork (default), "classic" = drawn SVG portraits. */
  variant?: "illustrated" | "classic";
  /** Show the name under the arch (off when a heading nearby already names the companion). */
  caption?: boolean;
  /** Animate the portrait (defaults to showState). */
  animated?: boolean;
}) {
  const companion = getCompanion(companionId);
  // "responsive" = compact on phones, full size from tablet width up.
  const dims = { lg: "h-64 w-52", sm: "h-36 w-28", responsive: "h-36 w-28 md:h-64 md:w-52" }[size];

  return (
    <figure className="flex flex-col items-center gap-2 md:gap-3" data-avatar-state={state}>
      <div className={`relative ${dims}`}>
        {/* AI aura: pulses gently, faster while thinking or listening */}
        <div
          aria-hidden="true"
          className={`aura absolute -inset-2 rounded-t-full rounded-b-2xl border border-accent ${
            state === "thinking" || state === "listening" ? "aura-fast" : ""
          } ${state === "error" ? "border-red-600" : ""}`}
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
        {/* Temple arch with the portrait inside */}
        <div className="absolute inset-3 overflow-hidden rounded-t-full rounded-b-xl border-4 border-double border-gold bg-accent-soft">
          {variant === "illustrated" ? (
            <IllustratedPortrait
              companionId={companionId}
              animated={animated ?? showState}
              priority={showState}
            />
          ) : (
            <Portrait
              companionId={companionId}
              className="absolute inset-x-0 bottom-0 h-full w-full"
            />
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="flex flex-col items-center text-center">
          <span className="block font-display text-2xl font-semibold">{companion.name}</span>
          {showState && (
            <>
              <span className="flex items-center gap-2 text-sm text-accent">
                {state === "speaking" && <VoiceWaveform active />}
                <span aria-live="polite">{STATE_LABEL[state]}</span>
              </span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
