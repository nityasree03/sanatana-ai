import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // ONNX Runtime (WebAssembly) runs meaning search on the server; load it with Node's require
  // and ship its .wasm files and the downloaded model with the routes that use them.
  serverExternalPackages: ["onnxruntime-web"],
  outputFileTracingIncludes: {
    "/api/**": ["./models/minilm/**", "./node_modules/onnxruntime-web/dist/*.wasm"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
