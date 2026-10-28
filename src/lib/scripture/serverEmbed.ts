import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import vocab from "@/data/scripture/minilm-vocab.json";
import { WordPieceTokenizer } from "./wordpiece";

/**
 * Meaning-search query vectors, computed on our server with the same model the passages were
 * embedded with (MiniLM, quantised ONNX) running on ONNX Runtime's WebAssembly build. No native
 * libraries, no external API, and nothing is downloaded by visitors' browsers.
 * Returns null when the model is unavailable, so callers fall back to keyword search.
 */
type Session = {
  inputNames: readonly string[];
  outputNames: readonly string[];
  run(
    feeds: Record<string, unknown>,
  ): Promise<Record<string, { data: Float32Array; dims: readonly number[] }>>;
};

let loading: Promise<{
  session: Session;
  Tensor: new (t: string, d: BigInt64Array, dims: number[]) => unknown;
} | null> | null = null;
const tokenizer = new WordPieceTokenizer(vocab as string[]);

export const MODEL_PATH = join(process.cwd(), "models", "minilm", "model_quantized.onnx");

function load() {
  loading ??= (async () => {
    try {
      const ort = await import("onnxruntime-web");
      ort.env.wasm.numThreads = 1;
      const model = await readFile(MODEL_PATH);
      const session = (await ort.InferenceSession.create(model)) as unknown as Session;
      return { session, Tensor: ort.Tensor as never };
    } catch (err) {
      console.warn("Meaning search unavailable:", (err as Error).message);
      return null;
    }
  })();
  return loading;
}

export async function embedQueryOnServer(text: string): Promise<number[] | null> {
  const loaded = await load();
  if (!loaded) return null;
  const { session, Tensor } = loaded;
  const { ids, attentionMask } = tokenizer.encode(text);
  const dims = [1, ids.length];
  const toTensor = (xs: number[]) => new Tensor("int64", BigInt64Array.from(xs.map(BigInt)), dims);
  const feeds: Record<string, unknown> = {
    input_ids: toTensor(ids),
    attention_mask: toTensor(attentionMask),
  };
  if (session.inputNames.includes("token_type_ids"))
    feeds.token_type_ids = toTensor(ids.map(() => 0));
  const out = await session.run(feeds);
  const hidden = out[session.outputNames[0]];
  const d = hidden.dims[2];
  const v = new Float64Array(d);
  for (let t = 0; t < ids.length; t++) for (let j = 0; j < d; j++) v[j] += hidden.data[t * d + j];
  let norm = 0;
  for (let j = 0; j < d; j++) {
    v[j] /= ids.length;
    norm += v[j] * v[j];
  }
  norm = Math.sqrt(norm) || 1;
  return Array.from(v, (x) => x / norm);
}
