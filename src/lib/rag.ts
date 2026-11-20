import type { RagCtx, RagDemo } from "../types";

const rad = (d: number) => (d * Math.PI) / 180;
/** Toy 2-D embedding: direction = meaning, length = display only. */
export const vec = (angle: number, radius = 1): [number, number] => [
  Math.cos(rad(angle)) * radius,
  Math.sin(rad(angle)) * radius,
];
export function cosine(a: [number, number], b: [number, number]): number {
  const dot = a[0] * b[0] + a[1] * b[1];
  return dot / (Math.hypot(...a) * Math.hypot(...b));
}

export function buildCtx(demo: RagDemo, queryId: string, k: number): RagCtx {
  const query = demo.queries.find((q) => q.id === queryId) ?? demo.queries[0];
  const qv = vec(query.angle);
  const ranked = demo.chunks
    .map((chunk) => ({ chunk, score: cosine(qv, vec(chunk.angle, chunk.radius)) }))
    .sort((x, y) => y.score - x.score);
  return { query, k, ranked, top: ranked.slice(0, k) };
}
