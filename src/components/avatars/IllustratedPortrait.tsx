import Image from "next/image";
import type { CompanionId } from "@/lib/companions";

/** The six expression images each companion has (see public/companions/<id>/). */
export const EXPRESSIONS = [
  "happy",
  "blinking",
  "speaking",
  "listening",
  "thinking",
  "concerned",
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** Two portrait sets: child (Bal) and adult. Visitors choose with the header switch. */
export const PORTRAIT_SETS = ["child", "adult"] as const;
export type PortraitSet = (typeof PORTRAIT_SETS)[number];

export function expressionSrc(id: CompanionId, expression: Expression, set: PortraitSet = "child") {
  return `/companions/${id}/${set}/${expression}.webp`;
}

/**
 * Illustrated companion portrait made of stacked expression images.
 *
 * Which image shows is controlled by CSS (globals.css) from the surrounding
 * data-avatar-state attribute: "happy" is the base; "blinking" flashes briefly while idle;
 * "speaking" alternates with "happy" while talking (approximate, not lip sync);
 * "listening", "thinking" and "concerned" (error) fade in for their states.
 *
 * `animated={false}` renders only the base image (used for small static cards).
 * Without `set`, both sets are rendered and CSS shows the one chosen on <html data-portraits>
 * (the hidden set's lazy images are not downloaded). `set` forces one (Kids always uses child).
 */
export function IllustratedPortrait({
  companionId,
  animated = true,
  priority = false,
  set,
}: {
  companionId: CompanionId;
  animated?: boolean;
  priority?: boolean;
  set?: PortraitSet;
}) {
  const layers = animated ? EXPRESSIONS : (["happy"] as const);
  const sets = set ? [set] : PORTRAIT_SETS;
  return (
    <div className="illustrated absolute inset-0" aria-hidden="true">
      {sets.map((ps) => (
        <div key={ps} className={`absolute inset-0 ${set ? "" : `ill-set-${ps}`}`}>
          {layers.map((e) => (
            <Image
              key={e}
              src={expressionSrc(companionId, e, ps)}
              alt=""
              fill
              unoptimized
              // Only the visible set's base image is loaded eagerly.
              loading={
                priority && e === "happy" && (set ? true : ps === "child") ? "eager" : "lazy"
              }
              sizes="(min-width: 768px) 184px, 104px"
              className={`ill-layer ill-${e} object-cover object-[50%_25%]`}
              draggable={false}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
