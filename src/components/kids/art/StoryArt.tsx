import type { ReactNode } from "react";
import { KRISHNA_ICONS, KRISHNA_SCENES } from "./krishnaArt";

const SCENES: Record<string, () => ReactNode> = { ...KRISHNA_SCENES };
const ICONS: Record<string, () => ReactNode> = { ...KRISHNA_ICONS };

export const ART_IDS = new Set([...Object.keys(SCENES), ...Object.keys(ICONS)]);

/** A storybook picture. `alt` is required unless the picture is decorative. */
export function StoryArt({
  id,
  alt,
  className = "",
}: {
  id: string;
  alt?: string;
  className?: string;
}) {
  const scene = SCENES[id] as (() => ReactNode) | undefined;
  const draw = scene ?? (ICONS[id] as (() => ReactNode) | undefined);
  if (!draw) return null;
  return (
    <svg
      viewBox={scene ? "0 0 800 450" : "0 0 200 200"}
      className={className}
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      {draw()}
    </svg>
  );
}
