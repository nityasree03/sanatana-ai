"use client";

/**
 * Meaning search in the browser: turns the visitor's query into a vector with the same model
 * the pipeline used for passages (Xenova/all-MiniLM-L6-v2, quantised ONNX).
 * The model (~23 MB) is downloaded from Hugging Face the first time and cached by the browser.
 * The ONNX Runtime engine (WebAssembly) is served from this site's /ort/ folder, not a CDN.
 * The query text itself never leaves the device for this step.
 */
type Extractor = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array }>;

let loading: Promise<Extractor> | null = null;

export function loadEmbedder(): Promise<Extractor> {
  loading ??= import("@huggingface/transformers").then(async (t) => {
    t.env.allowLocalModels = false;
    // transformers.js points ONNX Runtime at cdn.jsdelivr.net when it loads; keep its file
    // choice (it differs on older Safari) but load the files from this site instead.
    const wasm = t.env.backends.onnx.wasm;
    if (wasm) {
      const paths = wasm.wasmPaths;
      const local = (url: string) => `/ort/${url.split("/").pop()}`;
      wasm.wasmPaths =
        typeof paths === "object" && paths?.mjs && paths?.wasm
          ? { mjs: local(String(paths.mjs)), wasm: local(String(paths.wasm)) }
          : "/ort/";
    }
    const pipe = await t.pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { dtype: "q8" });
    return pipe as unknown as Extractor;
  });
  return loading;
}

export async function embedQuery(text: string): Promise<number[]> {
  const extract = await loadEmbedder();
  const out = await extract(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}
