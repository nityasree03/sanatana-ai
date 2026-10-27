// Copies the ONNX Runtime WebAssembly engine (MIT licence) from node_modules into public/ort/
// so meaning search loads it from this site instead of a third-party CDN.
// Runs automatically before `npm run dev` and `npm run build`; public/ort/ is git-ignored.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
// The package does not export package.json, so resolve its entry file and walk up to the root.
let root = dirname(require.resolve("onnxruntime-web"));
while (!existsSync(join(root, "package.json"))) root = dirname(root);
const pkgPath = join(root, "package.json");
const dist = join(dirname(pkgPath), "dist");
const out = join(process.cwd(), "public", "ort");
mkdirSync(out, { recursive: true });

const files = [
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.asyncify.wasm",
  // Older Safari without WebGPU uses the plain build.
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
];
for (const f of files) copyFileSync(join(dist, f), join(out, f));
const { version, license } = JSON.parse(readFileSync(pkgPath, "utf8"));
writeFileSync(
  join(out, "README.txt"),
  `onnxruntime-web ${version} (${license} licence, Microsoft). Copied from node_modules by scripts/copy-ort.mjs.\n`,
);
console.log(`copy-ort: onnxruntime-web ${version} → public/ort/ (${files.length} files)`);
