import type { Metadata } from "next";
// Self-hosted fonts (OFL licence), installed through npm. Nothing is loaded from Google.
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/noto-serif-devanagari";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import { InlineScript } from "@/components/InlineScript";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE, STORAGE_KEYS } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
};

// Applies the saved day/night theme before the first paint.
const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEYS.theme}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className="h-full antialiased">
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
