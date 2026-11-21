import { useState } from "react";
import { PACK_LEVELS } from "../lessons/context-packer";

export function ContextPacker() {
  const [li, setLi] = useState(0);
  const lv = PACK_LEVELS[li];
  const [picked, setPicked] = useState<string[]>(["sys"]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const used = lv.items.filter((i) => picked.includes(i.id)).reduce((a, i) => a + i.tokens, 0);

  const reset = (n: number) => { setLi(n); setPicked(["sys"]); setDone(false); setMsg(""); };
  const toggle = (id: string) => {
    if (done) return;
    const it = lv.items.find((i) => i.id === id)!;
    if (it.kind === "fixed") return;
    if (picked.includes(id)) { setPicked(picked.filter((p) => p !== id)); setMsg(""); return; }
    if (used + it.tokens > lv.budget) { setMsg(`No room: ${it.label} needs ${it.tokens} tokens but only ${lv.budget - used} are free. Drop something first.`); return; }
    setPicked([...picked, id]); setMsg("");
  };

  const chosen = lv.items.filter((i) => picked.includes(i.id));
  const needed = lv.items.filter((i) => i.kind === "need");
  const missing = needed.filter((i) => !picked.includes(i.id));
  const hasBad = chosen.some((i) => i.kind === "bad");
  const noise = chosen.filter((i) => i.kind === "noise").reduce((a, i) => a + i.tokens, 0);
  const useful = chosen.filter((i) => i.kind === "need").reduce((a, i) => a + i.tokens, 0);
  const outcome = hasBad ? "bad" : missing.length ? "thin" : noise > useful * 0.5 ? "diluted" : "good";
  const stars = outcome === "good" ? (noise === 0 ? 3 : 2) : outcome === "diluted" ? 1 : 0;
  const answer = { good: lv.good, thin: lv.thin, diluted: lv.diluted, bad: lv.hijacked }[outcome];

  return (
    <div className="pk">
      <div className="pk-head">
        <div>
          <span className="tag ch-technique">Play · Context Packer</span>
          <h2>{lv.title}</h2>
          <p className="pk-q">User asks: <b>“{lv.question}”</b></p>
          <p className="pk-sub">The window holds <b>{lv.budget.toLocaleString()}</b> tokens. Click items to pack them. Include what the model needs, leave out what it does not.</p>
        </div>
        <div className="pk-lv">{PACK_LEVELS.map((l, i) => <button key={l.id} className={i === li ? "on" : ""} onClick={() => reset(i)}>Level {i + 1}</button>)}</div>
      </div>

      <div className="pk-body">
        <div className="pk-pool">
          <h3>Available context</h3>
          {lv.items.map((it) => {
            const on = picked.includes(it.id);
            return (
              <button key={it.id} className={`pk-item ${it.kind}${on ? " on" : ""}`} onClick={() => toggle(it.id)} disabled={it.kind === "fixed"}>
                <b>{it.label}</b><em>{it.tokens} tok</em>
                <span>{it.text}</span>
                {done && <small className="why">{it.kind === "need" ? "Needed. " : it.kind === "bad" ? "Dangerous. " : it.kind === "noise" ? "Noise. " : ""}{it.why}</small>}
              </button>
            );
          })}
        </div>

        <div className="pk-win">
          <h3>Context window <span>{used.toLocaleString()} / {lv.budget.toLocaleString()}</span></h3>
          <div className="pk-tower" aria-label="Packed window">
            {chosen.map((it) => <div key={it.id} className={`blk ${it.kind}`} style={{ height: `${(it.tokens / lv.budget) * 100}%` }}><span>{it.label}</span><i>{it.tokens}</i></div>)}
            <div className="free" style={{ height: `${((lv.budget - used) / lv.budget) * 100}%` }}>{lv.budget - used} free</div>
          </div>
          {msg && <p className="pk-msg">{msg}</p>}
          {!done
            ? <button className="pk-go" onClick={() => setDone(true)}>Send to the model →</button>
            : <div className={`pk-res ${outcome}`}>
                <div className="stars">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</div>
                <p className="ans">{answer}</p>
                {outcome === "thin" && <p className="hint">Missing: {missing.map((m) => m.label).join(", ")}.</p>}
                <div className="pk-btns">
                  <button onClick={() => reset(li)}>Try again</button>
                  {li < PACK_LEVELS.length - 1 && <button className="pk-go" onClick={() => reset(li + 1)}>Next level →</button>}
                </div>
              </div>}
        </div>
      </div>
    </div>
  );
}
