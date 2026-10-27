import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

// Fonts: we use the system font stack for now (no calls to Google Fonts).
// Phase 1 adds self-hosted fonts, including ones that support Devanagari script.

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
