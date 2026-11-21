import { useRef, useState } from "react";
import { embeddings } from "../lessons/embeddings";
import { cosine, vec } from "../lib/rag";

const W = 560, H = 420, C: [number, number] = [W / 2, H / 2], S = 170;
const MISSIONS = ["kitten", "truck", "banana", "puppy", "bus"];

export function EmbeddingGalaxy() {
  const words = embeddings.words!;
  const [p, setP] = useState<[number, number]>([0.7, 0.5]); // probe in unit space, y up
  const [m, setM] = useState(0);
  const [won, setWon] = useState<string[]>([]);
  const svg = useRef<SVGSVGElement>(null);

  const ranked = words.map((w) => ({ w, score: cosine(p, vec(w.angle, w.radius)) })).sort((a, b) => b.score - a.score);
  const top = new Set(ranked.slice(0, 3).map((r) => r.w.id));
  const target = MISSIONS[m];
  const hit = ranked[0].w.id === target;
  const px = (x: number, y: number) => [C[0] + x * S, C[1] - y * S] as const;

  const move = (e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.type !== "pointerdown") return;
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * W - C[0]) / S;
    const y = -((e.clientY - r.top) / r.height * H - C[1]) / S;
    setP([x, y]);
  };
  const claim = () => {
    if (!hit) return;
    setWon([...won, target]);
    if (m < MISSIONS.length - 1) setM(m + 1);
  };
  const [qx, qy] = px(...p);
  const all = won.length === MISSIONS.length;

  return (
    <div className="pk eg">
      <div className="pk-head">
        <div>
          <span className="tag ch-insight">Play · Embedding Galaxy</span>
          <h2>Steer the probe</h2>
          <p className="pk-sub">Drag the glowing probe around the map. Similarity depends on <b>direction</b> from the centre, not distance. Make the target word the top match.</p>
        </div>
        <div className="eg-score"><b>{won.length}</b>/{MISSIONS.length} found</div>
      </div>
      <div className="pk-body">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="eg-map" onPointerDown={move} onPointerMove={move} role="img" aria-label="Embedding galaxy">
          <defs><radialGradient id="gx"><stop offset="0" stopColor="#ff5a2c" stopOpacity=".9" /><stop offset="1" stopColor="#ff5a2c" stopOpacity="0" /></radialGradient></defs>
          {[0.33, 0.66, 1].map((r) => <circle key={r} cx={C[0]} cy={C[1]} r={r * S} className="eg-ring" />)}
          <line x1={C[0]} y1={C[1]} x2={qx} y2={qy} className="eg-ray" />
          {words.map((w) => {
            const [x, y] = px(...vec(w.angle, w.radius));
            const on = top.has(w.id);
            return (
              <g key={w.id} className={`eg-star${on ? " on" : ""}${w.id === target ? " tgt" : ""}`}>
                {on && <line x1={qx} y1={qy} x2={x} y2={y} className="eg-link" />}
                <circle cx={x} cy={y} r={on ? 8 : 5} /><text x={x + 11} y={y + 4}>{w.text}</text>
              </g>
            );
          })}
          <circle cx={qx} cy={qy} r="26" fill="url(#gx)" />
          <circle cx={qx} cy={qy} r="8" className="eg-probe" />
        </svg>
        <div className="pk-win">
          <h3>Mission</h3>
          {all ? <p className="ans"><b>Galaxy cleared.</b> You just did semantic search by hand: a query direction, ranked by cosine.</p>
            : <p className="ans">Make <b className="eg-t">{target}</b> the closest word.</p>}
          {!all && <button className="pk-go" disabled={!hit} onClick={claim} style={{ opacity: hit ? 1 : .45 }}>{hit ? "Lock it in ✓" : "Not the top match yet"}</button>}
          <h3 style={{ marginTop: 14 }}>Ranking</h3>
          {ranked.slice(0, 5).map((r, i) => (
            <div key={r.w.id} className={i === 0 ? "row hit" : "row"}>
              <span className="rn">{r.w.text}</span>
              <span className="bar"><i style={{ width: `${Math.max(0, r.score) * 100}%` }} /></span>
              <span className="sc">{r.score.toFixed(2)}</span>
            </div>
          ))}
          <button className="pk-lv-b" onClick={() => { setWon([]); setM(0); }}>Restart</button>
        </div>
      </div>
    </div>
  );
}
