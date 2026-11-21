import { useEffect, useMemo, useRef, useState } from "react";
import { LESSONS, MODULES, lessonSummary } from "../lessons";

/* Home = a live embedding map of the curriculum, one node per TOPIC.
   Topics are laid out automatically, so adding topics never needs layout work.
   The query point follows the cursor, or flies to whatever you type. */

const W = 1200, H = 560;
const WORDS: Record<string, string[]> = {
  foundations: ["token", "vector", "context", "prompt"],
  retrieval: ["chunk", "index", "cosine", "top-k", "citation"],
  agents: ["tool", "loop", "memory", "plan"],
  safety: ["injection", "guardrail", "trust"],
  production: ["eval", "trace", "cache", "latency"],
  models: ["size", "lora", "vision", "local"],
  cases: ["support", "coding", "research"],
  play: ["game", "budget", "score"],
};

/* Tiny "meaning" index so typed questions land somewhere sensible. */
const KEYS: Record<string, string[]> = {
  "tokens-context": ["token", "word", "count", "forget", "memory", "remember", "window", "context", "limit", "long", "cost", "price", "length", "overflow", "read", "big"],
  embeddings: ["vector", "embedding", "meaning", "similar", "similarity", "number", "coordinate", "space", "semantic", "cosine", "close", "understand"],
  "simple-rag": ["search", "doc", "document", "pdf", "knowledge", "retrieve", "retrieval", "rag", "answer", "company", "file", "hallucinate", "fact", "ground", "data", "own", "private"],
  "context-packer": ["game", "play", "pack", "budget", "fit", "fun", "practice"],
  chunking: ["chunk", "split", "size", "piece"],
  "hybrid-search": ["keyword", "bm25", "hybrid", "exact"],
  reranking: ["rank", "rerank", "order", "best", "relevant"],
  "rag-eval": ["evaluate", "eval", "test", "quality", "metric", "measure"],
  "agent-loop": ["agent", "loop", "act", "autonomous", "step", "think", "plan", "decide"],
  "tool-calling": ["tool", "api", "function", "mcp", "call", "action", "browse"],
  compaction: ["summarize", "compress", "summary", "compaction", "shrink"],
  subagents: ["delegate", "parallel", "child", "team", "subagent"],
  "what-is-rag": ["rag", "retrieval", "augmented", "generation", "what", "open", "book", "private", "fresh", "finetune", "fine-tuning"],
  "ai-architectures": ["architecture", "architectures", "design", "pattern", "compare", "difference", "different"],
  "rag-architectures": ["architecture", "architectures", "naive", "advanced", "modular", "compare"],
  "what-is-llm": ["llm", "language", "model", "gpt", "chatgpt"],
  "next-token": ["temperature", "sampling", "predict", "next", "random"],
  hallucinations: ["hallucinate", "wrong", "false", "invent", "lie", "make", "up"],
  "vector-search": ["ann", "hnsw", "scale", "million", "database", "index", "fast"],
  "query-transform": ["rewrite", "hyde", "expand", "query"],
  "graph-rag": ["graph", "entity", "knowledge", "relationship"],
  "agentic-rag": ["agentic"],
  mcp: ["mcp", "protocol", "server"],
  memory: ["memory", "remember", "long-term"],
  evals: ["eval", "judge", "benchmark", "score"],
  "cost-latency": ["cost", "cheap", "slow", "fast", "cache", "price"],
  "prompt-injection": ["hack", "attack", "injection", "malicious", "safe", "safety", "trust", "jailbreak", "security", "secure", "danger"],
};
const SUGGEST = ["why does the model forget?", "how do I search my own docs?", "what is a vector?", "can text hack an agent?"];
const stem = (w: string) => w.replace(/(ing|es|s)$/, "");

interface Pt { id: string; label: string; x: number; y: number; tone: string; kind: "topic" | "word"; mod: string; n: number }

/* Deterministic auto-layout: topics on a jittered grid, words orbiting each topic. */
function layout() {
  const n = MODULES.length, cols = n <= 4 ? 2 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols);
  let k = 0;
  return MODULES.flatMap((m, i) => {
    const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
    const cw = W / inRow, ch = H / rows;
    const jx = ((i * 47) % 40) - 20, jy = ((i * 31) % 36) - 18;
    const x = c * cw + cw / 2 + jx - 40, y = r * ch + ch / 2 + jy;
    const topic: Pt = { id: m.id, label: m.title, x, y, tone: m.tone, kind: "topic", mod: m.id, n: k++ };
    const words = (WORDS[m.id] ?? m.lessons.slice(0, 3).map((l) => l.title.split(" ")[0].toLowerCase())).map((w, wi, arr): Pt => {
      const a = (wi / arr.length) * Math.PI * 2 + i * 0.9 + 0.5, rad = 105 + ((wi * 29) % 30);
      return { id: m.id + ":" + w, label: w, x: x + 70 + Math.cos(a) * rad * 1.45, y: y + Math.sin(a) * rad * 0.82, tone: m.tone, kind: "word", mod: m.id, n: k++ };
    });
    return [topic, ...words];
  });
}

export function Home({ done, onOpen }: { done: string[]; onOpen: (id: string) => void }) {
  const pts = useMemo(layout, []);
  const live = useMemo(() => MODULES.flatMap((m) => m.lessons).filter((l) => l.ready && (LESSONS[l.id] || lessonSummary(l.id))), []);
  const firstLesson = live.find((l) => LESSONS[l.id]) ?? live[0];
  const next = live.find((l) => LESSONS[l.id] && !done.includes(l.id)) ?? firstLesson;
  const started = done.length > 0;

  const [q, setQ] = useState({ x: W / 2, y: H / 2 });
  const qr = useRef(q); qr.current = q;
  const hover = useRef(false);
  const target = useRef<{ x: number; y: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [text, setText] = useState("");
  const [age, setAge] = useState(0);
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const fade = (delay: number, dur = 0.6) => Math.max(0, Math.min(1, (age - delay) / dur));
  useEffect(() => { const t = setTimeout(() => setAge((a) => Math.max(a, 3)), 2600); return () => clearTimeout(t); }, []);

  /* typed question -> best lesson -> its topic on the map */
  const match = useMemo(() => {
    const toks = (text.toLowerCase().match(/[a-z0-9-]+/g) ?? []).map(stem).filter((t) => t.length > 1);
    if (!toks.length) return null;
    let best: { id: string; title: string; ready: boolean; mod: string } | null = null, bs = 0;
    for (const m of MODULES) for (const l of m.lessons) {
      const keys = [...(KEYS[l.id] ?? []), ...l.title.toLowerCase().split(/[^a-z0-9-]+/)].map(stem);
      const sc = toks.filter((t) => keys.includes(t)).length * (l.ready ? 2 : 1.4);
      if (sc > bs) { bs = sc; best = { id: l.id, title: l.title.replace(" (game)", ""), ready: !!l.ready, mod: m.id }; }
    }
    return best;
  }, [text]);
  const matchPt = match ? pts.find((p) => p.id === match.mod) : undefined;
  useEffect(() => { target.current = matchPt ? { x: matchPt.x - 30, y: matchPt.y + 34 } : null; }, [matchPt]);

  useEffect(() => {
    let raf = 0, t0 = -1;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (t: number) => {
      if (t0 < 0) t0 = t;
      const el = (t - t0) / 1000; if (el < 3) setAge(still ? 3 : el);
      if (!hover.current) {
        const cur = qr.current, tg = target.current;
        if (tg) { if (Math.hypot(tg.x - cur.x, tg.y - cur.y) > 0.5) setQ({ x: cur.x + (tg.x - cur.x) * 0.09, y: cur.y + (tg.y - cur.y) * 0.09 }); }
        else if (!still) { const s = (t - t0) / 1000; const g = { x: W / 2 + Math.cos(s * 0.3) * 430, y: H / 2 + Math.sin(s * 0.52) * 160 }; setQ({ x: cur.x + (g.x - cur.x) * 0.05, y: cur.y + (g.y - cur.y) * 0.05 }); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ranked = useMemo(() => pts.map((p) => ({ p, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d), [pts, q]);
  const near = ranked.slice(0, 5);
  const hit = new Set(near.map((n) => n.p.id));
  const focusId = hot ?? sel ?? matchPt?.id;
  const focusMod = focusId ? MODULES.find((m) => m.id === focusId) : undefined;
  const focusPt = focusMod ? pts.find((p) => p.id === focusMod.id) : undefined;

  const toSvg = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H), ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2;
    return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s };
  };

  const card = focusMod && focusPt && (() => {
    const open = sel === focusMod.id;
    const show = open ? focusMod.lessons : focusMod.lessons.slice(0, 6);
    const left = focusPt.x > W - 380, up = focusPt.y > H - 250;
    return (
      <foreignObject x={left ? focusPt.x - 270 : focusPt.x - 20} y={up ? focusPt.y - 24 - 70 - show.length * 40 - 52 : focusPt.y + 30} width="300" height="420" style={{ overflow: "visible" }}
        onPointerEnter={() => setHot(focusMod.id)} onPointerLeave={() => setHot(null)}>
        <div className={`hcard tone-${focusMod.tone}${open ? " sel" : ""}`} onClick={(e) => e.stopPropagation()}>
          <small>Topic {focusMod.num}</small>
          <b>{focusMod.title}</b>
          <p>{focusMod.blurb}</p>
          <ul>{show.map((l) => (
            <li key={l.id} className={l.ready ? "" : "soon"}>
              {open && l.ready
                ? <button onClick={() => onOpen(l.id)}><i className={done.includes(l.id) ? "ok" : ""} /><span>{l.title.replace(" (game)", "")}</span><em>{LESSONS[l.id] ? `${LESSONS[l.id].steps.length} steps` : "game"}</em><span className="arw">→</span></button>
                : <><i className={done.includes(l.id) ? "ok" : ""} />{l.title.replace(" (game)", "")}{!l.ready && <small>soon</small>}</>}
            </li>))}
            {!open && focusMod.lessons.length > show.length && <li className="more">+{focusMod.lessons.length - show.length} more</li>}</ul>
          {!open && <span className="hint">Click the topic to open its lessons</span>}
        </div>
      </foreignObject>
    );
  })();

  return (
    <div className="hfield">
      <header className="hhead">
        <div>
          <h1>How AI actually works.</h1>
          <p>Interactive lessons on tokens, embeddings, RAG and agents. Every diagram moves while you read.</p>
        </div>
        <div className="hhead-r">
          <button className="btn primary" onClick={() => onOpen(next.id)}>{started ? "Continue" : "Start"} with {next.title.replace(" (game)", "")}<span>→</span></button>
        </div>
      </header>

      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
        onPointerMove={(e) => { hover.current = true; setQ(toSvg(e)); }}
        onPointerLeave={() => { hover.current = false; }} onClick={() => setSel(null)} aria-label="Map of topics">
        <defs>
          <radialGradient id="qg"><stop offset="0" className="qg0" /><stop offset="1" className="qg1" /></radialGradient>
          <linearGradient id="lg" x1="0" x2="1"><stop offset="0" className="lg0" /><stop offset="1" className="lg1" /></linearGradient>
        </defs>

        <circle cx={q.x} cy={q.y} r="150" fill="url(#qg)" />
        {near.map(({ p }, i) => <line key={p.id} x1={q.x} y1={q.y} x2={p.x} y2={p.y} className="f-ln" style={{ opacity: 1 - i * 0.16 }} />)}
        <circle cx={q.x} cy={q.y} r="10" className="f-q" />
        <circle cx={q.x} cy={q.y} r="3" className="f-qd" />

        {pts.map((p) => {
          const on = hit.has(p.id), st = { opacity: fade(p.n * 0.03) };
          if (p.kind === "word") return (
            <g key={p.id} className={on ? "f-pt on" : "f-pt"} style={st}>
              <circle cx={p.x} cy={p.y} r={on ? 3.5 : 2.5} /><text x={p.x + 8} y={p.y + 4}>{p.label}</text>
            </g>
          );
          const m = MODULES.find((x) => x.id === p.id)!;
          const ready = m.lessons.filter((l) => l.ready).length, dn = m.lessons.filter((l) => done.includes(l.id)).length;
          return (
            <foreignObject key={p.id} x={p.x - 16} y={p.y - 30} width="380" height="60" style={{ ...st, overflow: "visible" }}>
              <button className={`tpill tone-${p.tone}${on ? " on" : ""}${focusId === p.id ? " fx" : ""}`} onClick={(e) => { e.stopPropagation(); setSel(sel === p.id ? null : p.id); }} aria-expanded={sel === p.id}
                onPointerEnter={() => setHot(p.id)} onPointerLeave={() => setHot(null)} onFocus={() => setHot(p.id)} onBlur={() => setHot(null)}>
                <span className="tp-n">{m.num}</span>
                <span className="tp-t"><b>{m.title}</b><small>{m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}{ready ? ` · ${dn ? `${dn}/${ready} done` : `${ready} live`}` : " · soon"}</small></span>
                <span className="arw">→</span>
              </button>
            </foreignObject>
          );
        })}
        {card}
      </svg>

      <div className="hask">
        <p className="hask-cap"><span className="live" />Move your cursor or type a question. It is a query, and the lines point to its nearest meanings. That is semantic search.</p>
        <div className="hask-row">
          <label className="hinput">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask the map anything…" aria-label="Ask the map"
              onKeyDown={(e) => { if (e.key === "Enter" && match?.ready) onOpen(match.id); if (e.key === "Escape") setText(""); }} />
            {text && <button onClick={() => setText("")} aria-label="Clear">×</button>}
          </label>
          {match
            ? <div className="hmatch">Nearest meaning: <b>{match.title}</b>{match.ready ? <button className="btn primary sm" onClick={() => onOpen(match.id)}>Open<span>→</span></button> : <i>coming soon</i>}</div>
            : <div className="hsug">{text && <span className="dim">No close meaning. Try:</span>}{SUGGEST.map((s) => <button key={s} onClick={() => setText(s)}>{s}</button>)}</div>}
        </div>
      </div>

      <div className="hlist">
        {MODULES.map((m) => (
          <details key={m.id} className={`tone-${m.tone}`}>
            <summary><span>{m.num}</span><b>{m.title}</b><small>{m.lessons.length}</small></summary>
            {m.lessons.map((l) => (
              <button key={l.id} disabled={!l.ready} onClick={() => onOpen(l.id)}>{l.title.replace(" (game)", "")}{l.ready ? <i>→</i> : <small>soon</small>}</button>
            ))}
          </details>
        ))}
      </div>
    </div>
  );
}
