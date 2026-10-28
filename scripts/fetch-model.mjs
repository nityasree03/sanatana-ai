// Downloads the small open-source sentence model used for meaning search (Apache-2.0,
// Xenova/all-MiniLM-L6-v2, quantised ONNX, ~23 MB) into models/minilm/ for the server.
// The revision is pinned, and the file must match the SHA-256 recorded when the scripture
// passages were embedded, so queries and passages always use the identical model.
// Runs before `npm run dev` and `npm run build`; models/ is git-ignored.
// If the download fails, the site still works: search falls back to keywords only.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REVISION = "751bff37182d3f1213fa05d7196b954e230abad9";
const URL = `https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${REVISION}/onnx/model_quantized.onnx`;
const dir = join(process.cwd(), "models", "minilm");
const file = join(dir, "model_quantized.onnx");
const expected = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/scripture/embeddings.json"), "utf8"),
).modelSha256;
const sha = (buf) => createHash("sha256").update(buf).digest("hex");

if (existsSync(file) && sha(readFileSync(file)) === expected) {
  console.log("fetch-model: model already present and verified");
  process.exit(0);
}
try {
  mkdirSync(dir, { recursive: true });
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sha(buf) !== expected)
    throw new Error("checksum does not match the embedded passages' model");
  writeFileSync(file + ".part", buf);
  renameSync(file + ".part", file);
  console.log(`fetch-model: downloaded and verified (${(buf.length / 1e6).toFixed(1)} MB)`);
} catch (err) {
  console.warn(
    `fetch-model: WARNING — could not get the model (${err.message}). Meaning search will be off; keyword search still works.`,
  );
}
