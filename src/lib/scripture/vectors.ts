/** Decoding and comparing the int8-quantised passage vectors produced by the Python pipeline. */

export interface EmbeddingFile {
  model: string;
  modelFile: string;
  dims: number;
  scale: number;
  ids: string[];
  vectors: string; // base64 of int8 values, row-major
}

export function decodeVectors(file: EmbeddingFile): Int8Array {
  const bytes = Uint8Array.from(Buffer.from(file.vectors, "base64"));
  return new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Cosine similarity of a unit-length query with every stored (unit-length) passage vector. */
export function cosineAll(
  query: ArrayLike<number>,
  vectors: Int8Array,
  dims: number,
  scale: number,
): Float64Array {
  const n = vectors.length / dims;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let dot = 0;
    const base = i * dims;
    for (let d = 0; d < dims; d++) dot += vectors[base + d] * query[d];
    out[i] = dot / scale;
  }
  return out;
}
