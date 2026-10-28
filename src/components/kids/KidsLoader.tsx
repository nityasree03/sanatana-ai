"use client";

import dynamic from "next/dynamic";

// Kids settings live in this tab's sessionStorage, so story time renders in the browser only.
export const KidsLoader = dynamic(() => import("./KidsApp").then((m) => m.KidsApp), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <h1 className="font-display text-4xl">Sanatana Kids</h1>
      <p role="status" className="mt-2 text-muted">
        Opening story time…
      </p>
    </div>
  ),
});
