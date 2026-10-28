"use client";

import dynamic from "next/dynamic";

// The lab restores unsaved work from this tab's sessionStorage, so it renders in the browser only.
export const DharmaLabLoader = dynamic(() => import("./DharmaLab").then((m) => m.DharmaLab), {
  ssr: false,
  loading: () => (
    <p role="status" className="mx-auto max-w-6xl px-4 py-16 text-muted">
      Opening the Dharma Lab…
    </p>
  ),
});
