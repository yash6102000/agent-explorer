import { useMemo, useState } from "react";
import type { Panel } from "../types";

type P<K extends Panel["kind"]> = { panel: Extract<Panel, { kind: K }> };
const f2 = (n: number) => n.toFixed(2);

/* ---- Sampler: temperature and top-p over a next-token distribution ---- */
export function SamplerPanel({ panel }: P<"sampler">) {
  const [temp, setTemp] = useState(panel.temperature ?? 1);
  const [topP, setTopP] = useState(panel.topP ?? 1);
  const [out, setOut] = useState<string[]>([]);
  const ctl = new Set(panel.controls ?? []);

  const dist = useMemo(() => {
    const w = panel.tokens.map((x) => ({ ...x, w: Math.pow(Math.max(x.p, 1e-6), 1 / Math.max(temp, 0.05)) }));
    const z = w.reduce((a, b) => a + b.w, 0);
    const sorted = w.map((x) => ({ ...x, q: x.w / z })).sort((a, b) => b.q - a.q);
    let cum = 0;
    const kept = sorted.map((x) => { const keep = cum < topP || cum === 0; cum += x.q; return { ...x, keep }; });
    const zk = kept.filter((x) => x.keep).reduce((a, b) => a + b.q, 0);
    return kept.map((x) => ({ ...x, r: x.keep ? x.q / zk : 0 }));
  }, [panel.tokens, temp, topP]);

  const draw = () => {
    let r = Math.random(), pick = dist[0];
    for (const d of dist) { r -= d.r; if (r <= 0) { pick = d; break; } }
    setOut((o) => [...o.slice(-9), pick.t]);
  };
  const max = Math.max(...dist.map((d) => d.keep ? d.r : d.q), 0.01);

  return (
    <div className="smp">
      <div className="smp-p"><i>Prompt</i>{panel.prompt}<b>{out.length ? " " + out.join("") : " …"}</b></div>
      {(ctl.has("temperature") || ctl.has("topP")) && (
        <div className="chp-ctl">
          {ctl.has("temperature") && <div className="slider"><label>Temperature: <b>{f2(temp)}</b></label><input type="range" min={0.1} max={2} step={0.05} value={temp} onChange={(e) => setTemp(+e.target.value)} /></div>}
          {ctl.has("topP") && <div className="slider"><label>Top-p: <b>{f2(topP)}</b></label><input type="range" min={0.1} max={1} step={0.05} value={topP} onChange={(e) => setTopP(+e.target.value)} /></div>}
        </div>
      )}
      <div className="smp-bars">
        {dist.map((d) => (
          <div key={d.t} className={d.keep ? "smp-row" : "smp-row off"}>
            <span className="smp-t">{d.t.replace(/ /g, "·")}</span>
            <span className="smp-b"><i style={{ width: `${((d.keep ? d.r : d.q) / max) * 100}%` }} /></span>
            <span className="smp-v">{d.keep ? f2(d.r) : "cut"}</span>
          </div>
        ))}
      </div>
      <div className="smp-act"><button className="btn sm" onClick={draw}>Sample a token</button><button className="btn sm" onClick={() => setOut([])}>Reset</button></div>
    </div>
  );
}

/* ---- Attention: click a word, see which words it looks at ---- */
export function AttentionPanel({ panel }: P<"attention">) {
  const [sel, setSel] = useState(panel.focus ?? 0);
  const row = panel.weights[sel] ?? [];
  const ranked = row.map((w, j) => ({ w, t: panel.tokens[j] })).sort((a, b) => b.w - a.w).slice(0, 3);
  return (
    <div className="att">
      <p className="att-h">Click a word. The shading shows where it looks.</p>
      <div className="att-toks">
        {panel.tokens.map((t, j) => (
          <button key={j} className={`att-t${j === sel ? " me" : ""}`} onClick={() => setSel(j)}
            style={{ ["--a" as string]: j === sel ? 0 : row[j] ?? 0 }}>{t}</button>
        ))}
      </div>
      <div className="att-r">
        <span>“{panel.tokens[sel]}” pays most attention to</span>
        {ranked.map((r) => <div key={r.t + r.w} className="smp-row"><span className="smp-t">{r.t}</span><span className="smp-b"><i style={{ width: `${r.w * 100}%` }} /></span><span className="smp-v">{f2(r.w)}</span></div>)}
      </div>
      {panel.note && <p className="note">{panel.note}</p>}
    </div>
  );
}

/* ---- Fusion: merge two ranked lists with reciprocal rank fusion ---- */
export function FusionPanel({ panel }: P<"fusion">) {
  const [k, setK] = useState(panel.k ?? 60);
  const fused = useMemo(() => {
    const m = new Map<string, { id: string; text: string; s: number; a?: number; b?: number }>();
    panel.a.items.forEach((it, i) => m.set(it.id, { ...it, s: 1 / (k + i + 1), a: i + 1 }));
    panel.b.items.forEach((it, i) => { const c = m.get(it.id); if (c) { c.s += 1 / (k + i + 1); c.b = i + 1; } else m.set(it.id, { ...it, s: 1 / (k + i + 1), b: i + 1 }); });
    return [...m.values()].sort((x, y) => y.s - x.s);
  }, [panel, k]);
  const col = (label: string, items: { id: string; text: string }[]) => (
    <div className="fu-c"><h4>{label}</h4>{items.map((it, i) => <div key={it.id} className="fu-i"><b>{i + 1}</b>{it.text}</div>)}</div>
  );
  return (
    <div className="fu">
      <div className="fu-cols">{col(panel.a.label, panel.a.items)}{col(panel.b.label, panel.b.items)}
        <div className="fu-c fused"><h4>Fused (RRF)</h4>{fused.map((it, i) => (
          <div key={it.id} className="fu-i"><b>{i + 1}</b><span>{it.text}</span><small>{it.a ? `A#${it.a}` : ""}{it.a && it.b ? " + " : ""}{it.b ? `B#${it.b}` : ""}</small></div>))}</div>
      </div>
      <div className="slider"><label>Smoothing constant k: <b>{k}</b></label><input type="range" min={1} max={100} value={k} onChange={(e) => setK(+e.target.value)} /></div>
      <p className="note">Score = 1/(k + rank) from each list, added up. Items both lists like rise to the top.</p>
    </div>
  );
}

/* ---- Rerank: fast first-stage order vs slow, accurate reranker ---- */
export function RerankPanel({ panel }: P<"rerank">) {
  const [on, setOn] = useState(false);
  const keep = panel.keep ?? 3;
  const first = [...panel.items].sort((a, b) => b.first - a.first);
  const re = [...panel.items].sort((a, b) => b.rerank - a.rerank);
  const list = on ? re : first;
  const rank = (arr: typeof first, id: string) => arr.findIndex((x) => x.id === id) + 1;
  return (
    <div className="rr">
      <div className="chp-q"><i>Query</i>{panel.query}</div>
      <div className="picker"><button className={!on ? "chip on" : "chip"} onClick={() => setOn(false)}>Fast retriever</button><button className={on ? "chip on" : "chip"} onClick={() => setOn(true)}>After reranker</button></div>
      <div className="rr-l">
        {list.map((it, i) => {
          const d = rank(first, it.id) - rank(re, it.id);
          return (
            <div key={it.id} className={`rr-i${i < keep ? " keep" : ""}`}>
              <b>{i + 1}</b><span>{it.text}</span>
              <small>{f2(on ? it.rerank : it.first)}{on && d !== 0 && <em className={d > 0 ? "up" : "dn"}>{d > 0 ? `▲${d}` : `▼${-d}`}</em>}</small>
            </div>
          );
        })}
      </div>
      <p className="note">Top {keep} (highlighted) go to the model. The reranker reads query and passage together, so it fixes near-misses.</p>
    </div>
  );
}

/* ---- Graph: follow relationships to answer multi-hop questions ---- */
export function GraphPanel({ panel }: P<"graph">) {
  const [qi, setQi] = useState(0);
  const q = panel.questions[qi] ?? { text: "", path: [] as string[], answer: "", vectorHits: [] as string[] };
  const path = new Set(q.path), hits = new Set(q.vectorHits ?? []);
  const by = Object.fromEntries(panel.nodes.map((n) => [n.id, n]));
  const onPath = (a: string, b: string) => { const i = q.path.indexOf(a), j = q.path.indexOf(b); return i >= 0 && j >= 0 && Math.abs(i - j) === 1; };
  return (
    <div className="gr">
      {panel.questions.length > 0 && <div className="picker">{panel.questions.map((x, i) => <button key={x.text} className={i === qi ? "chip on" : "chip"} onClick={() => setQi(i)}>{x.text}</button>)}</div>}
      <svg viewBox="0 0 400 230" className="gr-svg" role="img" aria-label="Knowledge graph">
        {panel.edges.map((e) => {
          const a = by[e.a], b = by[e.b]; if (!a || !b) return null;
          const on = onPath(e.a, e.b);
          return <g key={e.a + e.b} className={on ? "gr-e on" : "gr-e"}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle">{e.label}</text></g>;
        })}
        {panel.nodes.map((n) => (
          <g key={n.id} className={`gr-n tone-${n.tone ?? "violet"}${path.has(n.id) ? " on" : ""}${hits.has(n.id) ? " vh" : ""}`}>
            <circle cx={n.x} cy={n.y} r="9" /><text x={n.x} y={n.y + 23} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </svg>
      {q.answer && <div className="answer good"><em>Answer by following the links</em><p>{q.answer}</p></div>}
    </div>
  );
}
