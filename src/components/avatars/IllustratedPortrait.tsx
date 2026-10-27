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

export function expressionSrc(id: CompanionId, expression: Expression) {
  return `/companions/${id}/${expression}.webp`;
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
 */
export function IllustratedPortrait({
  companionId,
  animated = true,
  priority = false,
}: {
  companionId: CompanionId;
  animated?: boolean;
  priority?: boolean;
}) {
  const layers = animated ? EXPRESSIONS : (["happy"] as const);
  return (
    <div className="illustrated absolute inset-0" aria-hidden="true">
      {layers.map((e) => (
        <Image
          key={e}
          src={expressionSrc(companionId, e)}
          alt=""
          fill
          unoptimized
          priority={priority && e === "happy"}
          sizes="(min-width: 768px) 184px, 104px"
          className={`ill-layer ill-${e} object-cover object-[50%_25%]`}
          draggable={false}
        />
      ))}
    </div>
  );
}
