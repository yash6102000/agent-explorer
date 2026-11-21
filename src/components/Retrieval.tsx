import { useState } from "react";
import type { Panel } from "../types";

/* Live chunking demo: cut a real document and see whether the answer survives. */
const DOC = `Refunds
Customers can request a refund within 30 days of purchase. Refunds go to the original payment method in 5–7 business days. Items must be unused and in original packaging.

Shipping
Standard shipping takes 3–5 business days. Express shipping takes 1–2 business days and costs $12. Orders over $50 ship free.

Warranty
All hardware has a 1-year limited warranty. It covers manufacturing defects but not accidental damage.`;
const QUESTION = "How long do refunds take?";
const KEY = "Refunds go to the original payment method in 5–7 business days.";
const KS = DOC.indexOf(KEY), KE = KS + KEY.length, N = DOC.length;

type Span = { s: number; e: number };
type Strategy = "fixed" | "sentence" | "paragraph";

function split(strategy: Strategy, size: number, overlap: number): Span[] {
  if (strategy === "fixed") {
    const step = Math.max(10, size - overlap), out: Span[] = [];
    for (let i = 0; i < N; i += step) { out.push({ s: i, e: Math.min(N, i + size) }); if (i + size >= N) break; }
    return out;
  }
  if (strategy === "paragraph") {
    const out: Span[] = []; let s = 0;
    for (const m of DOC.matchAll(/\n\s*\n/g)) { out.push({ s, e: m.index! }); s = m.index! + m[0].length; }
    out.push({ s, e: N }); return out;
  }
  const segs = [...DOC.matchAll(/[^.!?\n]+[.!?]*\s*/g)].map((m) => ({ s: m.index!, e: m.index! + m[0].length }));
  const out: Span[] = []; let cur: Span | null = null;
  for (const g of segs) {
    if (cur && g.e - cur.s <= size) cur.e = g.e;
    else { if (cur) out.push(cur); cur = { ...g }; }
  }
  if (cur) out.push(cur);
  return out;
}

export function ChunkPanel({ panel }: { panel: Extract<Panel, { kind: "chunking" }> }) {
  const [strategy, setStrategy] = useState<Strategy>(panel.strategy ?? "fixed");
  const [size, setSize] = useState(panel.size ?? 150);
  const [overlap, setOverlap] = useState(panel.overlap ?? 0);
  const ctl = new Set(panel.controls ?? []);
  const ov = strategy === "fixed" ? Math.min(overlap, Math.floor(size / 2)) : 0;
  const chunks = split(strategy, size, ov);

  const cuts = new Set<number>([0, N, KS, KE]);
  chunks.forEach((c) => { cuts.add(c.s); cuts.add(c.e); });
  const pts = [...cuts].sort((a, b) => a - b);
  const segs = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1], ids = chunks.map((c, j) => (c.s <= a && c.e >= b ? j : -1)).filter((j) => j >= 0);
    return { a, b, ids, start: chunks.some((c) => c.s === a) };
  });

  const holders = chunks.filter((c) => c.s <= KS && c.e >= KE);
  const touched = chunks.filter((c) => c.e > KS && c.s < KE).length;
  const best = holders.sort((x, y) => x.e - x.s - (y.e - y.s))[0];
  const ratio = best ? (best.e - best.s) / KEY.length : 0;
  const avg = Math.round(chunks.reduce((a, c) => a + c.e - c.s, 0) / chunks.length);
  const verdict = best
    ? ratio > 2.4 ? { k: "warn", t: `Answer is intact, but buried: its chunk is ${ratio.toFixed(1)}× the answer, so extra noise rides along.` }
      : { k: "good", t: `Answer is intact in one chunk (${best.e - best.s} characters).` }
    : { k: "bad", t: `Answer is cut across ${touched} chunks. A search may return only half of it.` };

  return (
    <div className="chp">
      {(ctl.has("strategy") || ctl.has("size") || ctl.has("overlap")) && (
        <div className="chp-ctl">
          {ctl.has("strategy") && (
            <div className="picker" role="group" aria-label="Strategy">
              {(["fixed", "sentence", "paragraph"] as Strategy[]).map((k) => (
                <button key={k} className={k === strategy ? "chip on" : "chip"} onClick={() => setStrategy(k)}>{k === "fixed" ? "Fixed size" : k === "sentence" ? "By sentence" : "By paragraph"}</button>
              ))}
            </div>
          )}
          {ctl.has("size") && strategy !== "paragraph" && (
            <div className="slider"><label>Chunk size: <b>{size}</b> chars</label><input type="range" min={60} max={480} step={10} value={size} onChange={(e) => setSize(+e.target.value)} /></div>
          )}
          {ctl.has("overlap") && strategy === "fixed" && (
            <div className="slider"><label>Overlap: <b>{ov}</b> chars</label><input type="range" min={0} max={Math.floor(size / 2)} step={5} value={ov} onChange={(e) => setOverlap(+e.target.value)} /></div>
          )}
        </div>
      )}
      <div className="chp-q"><i>Question</i>{QUESTION}</div>
      <div className="chdoc" aria-label="Document split into chunks">
        {segs.map((g) => (
          <span key={g.a} className={`chs ${g.ids.length ? "c" + (g.ids[0] % 6) : "gap"}${g.ids.length > 1 ? " ov" : ""}${g.a >= KS && g.b <= KE ? " key" : ""}${g.start ? " st" : ""}`}>{DOC.slice(g.a, g.b)}</span>
        ))}
      </div>
      <div className="chp-stat"><span><b>{chunks.length}</b> chunks</span><span><b>{avg}</b> avg chars</span>{ov > 0 && <span><b>{ov}</b> overlap</span>}<span className="legend"><i className="k" />answer sentence</span></div>
      <div className={`chp-v ${verdict.k}`}>{verdict.t}</div>
    </div>
  );
}
