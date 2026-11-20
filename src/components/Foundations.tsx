import { useMemo, useState } from "react";
import { tokenize } from "../lib/tokens";
import { cosine, vec } from "../lib/rag";
import type { Word } from "../types";

const f2 = (n: number) => n.toFixed(2);

/* ---- Live tokenizer ---- */
export function TokensPanel() {
  const [text, setText] = useState("Retrieval-augmented generation is unbelievably useful.");
  const toks = useMemo(() => tokenize(text), [text]);
  const ratio = text.length ? (text.length / Math.max(1, toks.length)).toFixed(1) : "0";
  return (
    <div className="tokp">
      <label className="tok-l">Type anything (toy tokenizer)</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} spellCheck={false} />
      <div className="tok-stats">
        <span><b>{toks.length}</b> tokens</span>
        <span><b>{text.length}</b> characters</span>
        <span><b>{ratio}</b> chars / token</span>
      </div>
      <div className="toks">
        {toks.map((t, i) => (
          <span key={i} className={`tk c${i % 6}`} title={`id ${t.id}`}>
            <i>{t.text.replace(/ /g, "·") || "·"}</i><sub>{t.id}</sub>
          </span>
        ))}
      </div>
      <p className="note">Rare or long words split into pieces; common words are one token. Spaces belong to the token after them (shown as ·).</p>
    </div>
  );
}

/* ---- Context window fill meter ---- */
const LIMIT = 8192, SYSTEM = 800, TOOLS = 600, TURN = 420, OUT = 1000;
export function WindowPanel({ turns: t0 = 6, interactive }: { turns?: number; interactive?: boolean }) {
  const [turns, setTurns] = useState(t0);
  const fixed = SYSTEM + TOOLS;
  const history = turns * TURN;
  const used = fixed + history;
  const room = LIMIT - OUT;
  const over = Math.max(0, used - room);
  const seg = (n: number) => `${(n / LIMIT) * 100}%`;
  const billed = Array.from({ length: turns }, (_, i) => fixed + (i + 1) * TURN).reduce((a, b) => a + b, 0);
  return (
    <div className="winp">
      {interactive && (
        <div className="slider">
          <label>Conversation length: <b>{turns}</b> turns</label>
          <input type="range" min={0} max={20} value={turns} onChange={(e) => setTurns(+e.target.value)} />
        </div>
      )}
      <div className="wbar" role="img" aria-label="Context window usage">
        <div style={{ width: seg(SYSTEM), background: "var(--gray-s)" }} title="System prompt" />
        <div style={{ width: seg(TOOLS), background: "var(--violet-s)" }} title="Tool definitions" />
        <div style={{ width: seg(Math.min(history, room - fixed)), background: "var(--blue-s)" }} title="History" />
        <div style={{ width: seg(Math.max(0, OUT - Math.max(0, used - room))), background: "repeating-linear-gradient(45deg,var(--line2),var(--line2) 4px,transparent 4px,transparent 8px)" }} title="Reserved for the answer" />
      </div>
      <div className="wleg">
        <span><i style={{ background: "var(--gray-s)" }} />System {SYSTEM}</span>
        <span><i style={{ background: "var(--violet-s)" }} />Tools {TOOLS}</span>
        <span><i style={{ background: "var(--blue-s)" }} />History {history.toLocaleString()}</span>
        <span><i className="hatch" />Reserved for answer {OUT}</span>
      </div>
      <div className={over ? "wstat bad" : "wstat"}>
        <span><b>{Math.min(used, LIMIT).toLocaleString()}</b> / {LIMIT.toLocaleString()} tokens used</span>
        <span>{over ? `Overflow by ${over.toLocaleString()} tokens: oldest turns must go` : `${(room - used).toLocaleString()} tokens of room left`}</span>
      </div>
      <div className="wbill">
        <div><b>{billed.toLocaleString()}</b><span>input tokens processed so far (the whole prompt is re-sent every turn)</span></div>
        <div><b>{(turns * TURN).toLocaleString()}</b><span>tokens of new text you actually wrote</span></div>
      </div>
    </div>
  );
}

/* ---- Embedding word map: click a word, see its nearest neighbours ---- */
export function WordMapPanel({ words }: { words: Word[] }) {
  const [sel, setSel] = useState(words[0]?.id ?? "");
  const S = 130, C = 160;
  const pos = (w: Word) => { const [x, y] = vec(w.angle, w.radius); return [C + x * S, C - y * S] as const; };
  const cur = words.find((w) => w.id === sel) ?? words[0];
  if (!cur) return null;
  const cv = vec(cur.angle);
  const ranked = words.filter((w) => w.id !== cur.id)
    .map((w) => ({ w, score: cosine(cv, vec(w.angle, w.radius)) })).sort((a, b) => b.score - a.score);
  const top = new Set(ranked.slice(0, 3).map((r) => r.w.id));
  return (
    <div className="vec-body">
      <svg viewBox="0 0 380 320" className="scatter" role="img" aria-label="Word embedding map">
        <line x1="10" y1={C} x2="370" y2={C} className="axis" /><line x1={C} y1="10" x2={C} y2="310" className="axis" />
        {words.map((w) => {
          const [x, y] = pos(w);
          const hit = top.has(w.id), me = w.id === cur.id;
          return (
            <g key={w.id} className={`pt wm${hit ? " hit" : ""}${me ? " me" : ""}`} onClick={() => setSel(w.id)} tabIndex={0} role="button" aria-label={w.text}
               onKeyDown={(e) => { if (e.key === "Enter") setSel(w.id); }}>
              {me && words.filter((o) => top.has(o.id)).map((o) => { const [ox, oy] = pos(o); return <line key={o.id} x1={x} y1={y} x2={ox} y2={oy} className="ray hit" />; })}
              <circle cx={x} cy={y} r={me ? 10 : hit ? 8 : 6.5} /><text x={x + 12} y={y + 4}>{w.text}</text>
            </g>
          );
        })}
      </svg>
      <div className="rank">
        <div className="kctl"><span>Closest to</span><b style={{ fontSize: 18 }}>{cur.text}</b></div>
        {ranked.map((r, i) => (
          <div key={r.w.id} className={i < 3 ? "row hit" : "row"} onClick={() => setSel(r.w.id)} style={{ cursor: "pointer" }}>
            <span className="rn">{r.w.text}</span>
            <span className="bar"><i style={{ width: `${Math.max(0, r.score) * 100}%` }} /></span>
            <span className="sc">{f2(r.score)}</span>
          </div>
        ))}
        <p className="note">Click any word. Similar meanings share a direction.</p>
      </div>
    </div>
  );
}
