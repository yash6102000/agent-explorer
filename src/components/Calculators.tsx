import { useState } from "react";
import type { Panel } from "../types";

type P<K extends Panel["kind"]> = { panel: Extract<Panel, { kind: K }> };

/* ---- Cost: what does a month of traffic cost? (illustrative prices) ---- */
const TIERS = {
  small: { label: "Small model", inP: 0.25, outP: 1.25 },
  medium: { label: "Medium model", inP: 3, outP: 15 },
  large: { label: "Large model", inP: 15, outP: 75 },
} as const;
const money = (n: number) => (n >= 1000 ? `$${Math.round(n).toLocaleString()}` : n >= 10 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`);

export function CostPanel({ panel }: P<"cost">) {
  const [tier, setTier] = useState<keyof typeof TIERS>(panel.model ?? "medium");
  const [rpd, setRpd] = useState(panel.requestsPerDay ?? 10000);
  const [inTok, setInTok] = useState(panel.inTokens ?? 3000);
  const [outTok, setOutTok] = useState(panel.outTokens ?? 400);
  const [cache, setCache] = useState(panel.cacheRate ?? 0);
  const ctl = new Set(panel.controls ?? []);
  const t = TIERS[tier];
  const reqs = rpd * 30;
  const share = cache / 100;
  const inCost = (reqs * inTok * (1 - share + share * 0.1) * t.inP) / 1e6; // cached input billed at ~10% (illustrative)
  const outCost = (reqs * outTok * t.outP) / 1e6;
  const total = inCost + outCost;
  return (
    <div className="cst">
      <div className="chp-ctl">
        {ctl.has("model") && (
          <div className="picker" role="group" aria-label="Model size">
            {(Object.keys(TIERS) as (keyof typeof TIERS)[]).map((k) => (
              <button key={k} className={k === tier ? "chip on" : "chip"} onClick={() => setTier(k)}>{TIERS[k].label}</button>
            ))}
          </div>
        )}
        {ctl.has("volume") && <div className="slider"><label>Requests per day: <b>{rpd.toLocaleString()}</b></label><input type="range" min={500} max={200000} step={500} value={rpd} onChange={(e) => setRpd(+e.target.value)} /></div>}
        {ctl.has("tokens") && <div className="slider"><label>Input tokens per request: <b>{inTok.toLocaleString()}</b></label><input type="range" min={200} max={30000} step={100} value={inTok} onChange={(e) => setInTok(+e.target.value)} /></div>}
        {ctl.has("tokens") && <div className="slider"><label>Output tokens per request: <b>{outTok.toLocaleString()}</b></label><input type="range" min={50} max={4000} step={50} value={outTok} onChange={(e) => setOutTok(+e.target.value)} /></div>}
        {ctl.has("cache") && <div className="slider"><label>Prompt cache hit rate: <b>{cache}%</b></label><input type="range" min={0} max={95} step={5} value={cache} onChange={(e) => setCache(+e.target.value)} /></div>}
      </div>
      <div className="cst-big"><b>{money(total)}</b><span>per month</span><small>{money((total / reqs) * 1000)} per 1,000 requests</small></div>
      <div className="cst-bar"><i className="in" style={{ width: `${(inCost / total) * 100}%` }} /><i className="out" style={{ width: `${(outCost / total) * 100}%` }} /></div>
      <div className="wleg">
        <span><i style={{ background: "var(--blue-s)" }} />Input {money(inCost)}</span>
        <span><i style={{ background: "var(--orange-s)" }} />Output {money(outCost)}</span>
      </div>
      <p className="note">Illustrative prices per 1M tokens: input ${t.inP}, output ${t.outP}. Cached input is billed at about 10%. Real prices vary by provider.</p>
    </div>
  );
}

/* ---- Quant: how much memory does a model need? ---- */
const DEVICES = [["Phone", 6], ["Laptop", 16], ["Gaming GPU", 24], ["Workstation", 64]] as const;

export function QuantPanel({ panel }: P<"quant">) {
  const sizes = [1, 3, 8, 14, 32, 70];
  const [b, setB] = useState(panel.params ?? 8);
  const [bits, setBits] = useState<number>(panel.bits ?? 16);
  const ctl = new Set(panel.controls ?? []);
  const gb = ((b * bits) / 8) * 1.2; // parameters x bytes each, plus ~20% runtime overhead
  return (
    <div className="qt">
      <div className="chp-ctl">
        {ctl.has("size") && <div className="picker" role="group" aria-label="Parameters">{sizes.map((n) => <button key={n} className={n === b ? "chip on" : "chip"} onClick={() => setB(n)}>{n}B</button>)}</div>}
        {ctl.has("bits") && <div className="picker" role="group" aria-label="Precision">{[16, 8, 4].map((n) => <button key={n} className={n === bits ? "chip on" : "chip"} onClick={() => setBits(n)}>{n}-bit</button>)}</div>}
      </div>
      <div className="cst-big"><b>{gb.toFixed(gb < 10 ? 1 : 0)} GB</b><span>to load a {b}B model at {bits}-bit</span><small>{b}B parameters × {bits / 8} bytes, plus about 20% overhead (illustrative)</small></div>
      <div className="qt-d">
        {DEVICES.map(([n, mem]) => <div key={n} className={gb <= mem ? "fit" : "no"}><b>{n}</b><span>{mem} GB</span><em>{gb <= mem ? "fits" : "too big"}</em></div>)}
      </div>
    </div>
  );
}

/* ---- Budget: where do the milliseconds go? Toggle the fixes. ---- */
export function BudgetPanel({ panel }: P<"budget">) {
  const [fixed, setFixed] = useState<Record<number, boolean>>({});
  const unit = panel.unit ?? "ms";
  const vals = panel.stages.map((s, i) => (fixed[i] ? s.fastMs : s.ms));
  const total = vals.reduce((a, b) => a + b, 0);
  const max = Math.max(total, panel.target) * 1.05;
  const ok = total <= panel.target;
  return (
    <div className="bg">
      <div className={`bg-t ${ok ? "ok" : "bad"}`}><b>{total}{unit}</b><span>{ok ? "inside the target" : `over the ${panel.target}${unit} target`}</span></div>
      <div className="bg-bar">
        {panel.stages.map((s, i) => <div key={s.label} className={`bg-s s${i % 5}`} style={{ width: `${(vals[i] / max) * 100}%` }} title={`${s.label} ${vals[i]}${unit}`}><span>{vals[i]}</span></div>)}
        <i className="bg-m" style={{ left: `${(panel.target / max) * 100}%` }}><em>{panel.target}</em></i>
      </div>
      <div className="df-layers">
        {panel.stages.map((s, i) => (
          <button key={s.label} className={`df-l${fixed[i] ? " on" : ""}`} onClick={() => setFixed({ ...fixed, [i]: !fixed[i] })} aria-pressed={!!fixed[i]}>
            <span className="df-sw" /><b>{s.label}: {vals[i]}{unit}</b><small>{fixed[i] ? `${s.fix} (was ${s.ms}${unit})` : `Tap to apply: ${s.fix}`}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
