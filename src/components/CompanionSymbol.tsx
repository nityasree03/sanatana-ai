import type { CompanionId } from "@/lib/companions";

/**
 * Simple original symbols used as placeholders until the illustrated
 * portraits are drawn in Phase 2: a peacock feather (Krishna), a crescent
 * moon (Shiva), a mace (Hanuman) and a lotus (Parvati).
 */
export function CompanionSymbol({ id, className }: { id: CompanionId; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {id === "krishna" && (
        <g>
          <path d="M30 88 Q48 60 62 26" fill="none" stroke="currentColor" strokeWidth="3" />
          <ellipse
            cx="62"
            cy="30"
            rx="16"
            ry="24"
            fill="currentColor"
            opacity="0.25"
            transform="rotate(25 62 30)"
          />
          <ellipse
            cx="62"
            cy="30"
            rx="10"
            ry="15"
            fill="currentColor"
            opacity="0.5"
            transform="rotate(25 62 30)"
          />
          <ellipse cx="63" cy="29" rx="5" ry="7" fill="currentColor" transform="rotate(25 63 29)" />
          <circle cx="64" cy="28" r="2.2" fill="var(--gold)" />
        </g>
      )}
      {id === "shiva" && (
        <g>
          <path d="M66 20 A32 32 0 1 0 66 80 A24 24 0 1 1 66 20 Z" fill="currentColor" />
          <circle cx="74" cy="34" r="2" fill="var(--gold)" />
          <circle cx="80" cy="56" r="1.5" fill="var(--gold)" />
        </g>
      )}
      {id === "hanuman" && (
        <g>
          <rect x="47" y="44" width="6" height="46" rx="3" fill="currentColor" />
          <ellipse cx="50" cy="32" rx="18" ry="20" fill="currentColor" />
          <rect x="40" y="46" width="20" height="5" rx="2" fill="var(--gold)" />
          <path d="M50 12 L54 6 L46 6 Z" fill="var(--gold)" />
        </g>
      )}
      {id === "parvati" && (
        <g fill="currentColor">
          <path d="M50 22 C60 36 60 56 50 70 C40 56 40 36 50 22 Z" />
          <path d="M50 70 C40 60 26 54 16 56 C22 68 36 74 50 70 Z" opacity="0.7" />
          <path d="M50 70 C60 60 74 54 84 56 C78 68 64 74 50 70 Z" opacity="0.7" />
          <path d="M50 70 C44 52 32 42 24 40 C26 56 38 68 50 70 Z" opacity="0.45" />
          <path d="M50 70 C56 52 68 42 76 40 C74 56 62 68 50 70 Z" opacity="0.45" />
          <rect x="30" y="76" width="40" height="3" rx="1.5" fill="var(--gold)" />
        </g>
      )}
    </svg>
  );
}
