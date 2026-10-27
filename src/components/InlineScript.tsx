/**
 * Runs a tiny script while the page is still loading, before anything is painted.
 * Used to apply the saved theme so the page never flashes the wrong colours.
 * (Pattern from the Next.js guide "Preventing flash before hydration".)
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
