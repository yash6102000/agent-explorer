import { useEffect, useRef, useState } from "react";
import type { Lesson, SceneNode, Step } from "../types";

const XS = 1.3, NW = 184, NH = 96, PAD = 12, LABEL = 22;

/* 24×24 line glyphs, one per node role */
const GLYPH: Record<string, string> = {
  docs: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
  chunker: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  chip: "M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4",
  rack: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  laptop: "M5 5h14v10H5z M2 19h20",
  layers: "M12 3l9 5-9 5-9-5z M3 12.5l9 5 9-5 M3 17l9 5 9-5",
  tower: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z",
};

/* A small live visual at the bottom of each node. Paused until the node is the focus. */
function Mini({ icon }: { icon: string }) {
  switch (icon) {
    case "docs":
      return <g>{Array.from({ length: 7 }, (_, i) => (
        <g key={i} className="mv-page" style={{ animationDelay: `${i * 0.12}s` }} transform={`translate(${i * 23},0)`}>
          <rect width="17" height="26" rx="3" />
          <path d="M4 7h9M4 12h9M4 17h6" />
        </g>))}</g>;
    case "chunker":
      return <g>{[0, 1, 2, 3].map((i) => (
        <rect key={i} className="mv-block" style={{ ["--dx" as string]: `${(i - 1.5) * 7}px`, animationDelay: `${i * 0.08}s` }} x={i * 40} y="3" width="36" height="20" rx="4" />))}</g>;
    case "chip":
      return <g>{Array.from({ length: 22 }, (_, i) => {
        const h = 5 + ((i * 53) % 19);
        return <rect key={i} className="mv-bar" style={{ animationDelay: `${(i % 9) * 0.09}s`, ["--h" as string]: h / 24 }} x={i * 7.4} y={26 - h} width="4.5" height={h} rx="2" />;
      })}</g>;
    case "rack":
      return <g>{Array.from({ length: 3 }, (_, r) => Array.from({ length: 22 }, (_, c) => (
        <circle key={r + "-" + c} className="mv-dot" style={{ animationDelay: `${((r * 7 + c * 3) % 11) * 0.12}s` }} cx={c * 7.4 + 3} cy={r * 9 + 4.5} r="2.6" />)))}</g>;
    case "laptop":
      return <g><rect className="mv-line" x="0" y="4" width="118" height="6" rx="3" /><rect className="mv-line" x="0" y="15" width="74" height="6" rx="3" /><rect className="mv-caret" x="78" y="12" width="3" height="12" rx="1.5" /></g>;
    case "layers":
      return <g><rect className="mv-seg s1" x="0" y="5" width="30" height="16" rx="4" /><rect className="mv-seg s2" x="33" y="5" width="22" height="16" rx="4" />
        <rect className="mv-seg s3" x="58" y="5" width="64" height="16" rx="4" /><rect className="mv-seg free" x="125" y="5" width="35" height="16" rx="4" /></g>;
    case "tower":
      return <g>{[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} className="mv-tok" style={{ animationDelay: `${i * 0.22}s` }} x={i * 27} y="5" width="23" height="16" rx="8" />))}</g>;
    default:
      return null;
  }
}

type N = SceneNode & { x: number };

function edge(a: N, b: N) {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy) * 1.1) {
    const s = Math.sign(dx) || 1;
    const x1 = a.x + (s * NW) / 2, x2 = b.x - (s * NW) / 2, m = (x1 + x2) / 2;
    return { d: `M${x1},${a.y} C${m},${a.y} ${m},${b.y} ${x2},${b.y}`, mx: m, my: (a.y + b.y) / 2 };
  }
  const s = Math.sign(dy) || 1;
  const y1 = a.y + (s * NH) / 2, y2 = b.y - (s * NH) / 2, m = (y1 + y2) / 2;
  return { d: `M${a.x},${y1} C${a.x},${m} ${b.x},${m} ${b.x},${y2}`, mx: (a.x + b.x) / 2, my: m };
}

export function Stage({ lesson, step, poked, onPoke }: { lesson: Lesson; step: Step; poked?: string; onPoke: (n: SceneNode) => void }) {
  /* Measure the stage so the diagram can use all of it, edge to edge. */
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 1000, h: 420 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: Math.max(300, el.clientWidth), h: Math.max(200, el.clientHeight) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const rawX = lesson.nodes.map((n) => n.x), minX = Math.min(...rawX), maxX = Math.max(...rawX);
  const MARGIN = NW / 2 + PAD + 12;
  const yOf = (ys: number) => lesson.nodes.map((n) => n.y * ys);
  const place = (ys: number, mapX: (x: number) => number): N[] => lesson.nodes.map((n, i) => ({ ...n, x: mapX(n.x), y: yOf(ys)[i] }));
  const zonesFor = (ns: N[]) => (lesson.zones ?? []).map((z) => {
    const m = z.ids.map((i) => ns.find((n) => n.id === i)).filter(Boolean) as N[];
    return {
      ...z, on: false,
      x0: Math.min(...m.map((n) => n.x)) - NW / 2 - PAD, x1: Math.max(...m.map((n) => n.x)) + NW / 2 + PAD,
      y0: Math.min(...m.map((n) => n.y)) - NH / 2 - PAD - LABEL, y1: Math.max(...m.map((n) => n.y)) + NH / 2 + PAD,
    };
  });
  const clash = (zs: ReturnType<typeof zonesFor>) => zs.some((a, i) => zs.some((b, j) => j > i && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 + 10 && b.y0 < a.y1 + 10));

  // 1. Vertical spacing: smallest that keeps zones apart (using a conservative width).
  const probe = (x: number) => x * 1.3;
  let ys = 1.3;
  while (ys < 2.6 && clash(zonesFor(place(ys, probe)))) ys += 0.05;
  const ysFinal = ys;
  const ns0 = place(ysFinal, probe), zs0 = zonesFor(ns0);
  const top0 = Math.min(...ns0.map((n) => n.y - NH / 2), ...zs0.map((z) => z.y0)) - 12;
  const bot0 = Math.max(...ns0.map((n) => n.y + NH / 2), ...zs0.map((z) => z.y1)) + 12;

  // 2. View height: content height, but never scaled up more than 1.45x.
  const aspect = box.w / box.h;
  const vh = Math.max(bot0 - top0, box.h / 1.45);
  const vy = (top0 + bot0) / 2 - vh / 2;

  // 3. View width follows the stage's aspect ratio; spread nodes across all of it.
  const need = (maxX - minX) * 0.9 + NW + 2 * MARGIN;
  const vw = Math.max(vh * aspect, need);
  const span = maxX - minX || 1;
  const mapX = (x: number) => MARGIN + ((x - minX) / span) * (vw - 2 * MARGIN);

  const nodes = place(ysFinal, mapX);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const shown = new Set(step.show);
  const focus = new Set(step.focus ?? []);
  const flowKeys = new Set((step.flows ?? []).map((f) => [f.from, f.to].sort().join("|")));
  const zones = zonesFor(nodes).map((z) => ({ ...z, on: z.ids.some((i) => shown.has(i)) }));
  const bx0 = 0, by0 = vy;

  return (
    <svg ref={ref} className="stage-svg" viewBox={`${bx0} ${by0} ${vw} ${vh}`} role="img" aria-label={`Diagram: ${step.title}`}>
      <defs>
        <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4" /></filter>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
          <path d="M1 1L9 5L1 9" className="arr-h" />
        </marker>
      </defs>

      {zones.map((z) => (
        <g key={z.label} className={`zone tone-${z.tone}${z.on ? " on" : ""}`}>
          <rect x={z.x0} y={z.y0} width={z.x1 - z.x0} height={z.y1 - z.y0} rx="22" className="zone-box" />
          <text x={z.x0 + 20} y={z.y0 + 25} className="zone-t">{z.label}</text>
          {z.sub && <text x={z.x0 + 20 + z.label.length * 8.6 + 12} y={z.y0 + 25} className="zone-s">{z.sub}</text>}
        </g>
      ))}

      {lesson.links.map((l) => {
        if (!shown.has(l.a) || !shown.has(l.b) || flowKeys.has([l.a, l.b].sort().join("|"))) return null;
        return <path key={l.a + l.b} className="link" d={edge(byId[l.a], byId[l.b]).d} />;
      })}

      {(step.flows ?? []).map((f, i) => {
        const a = byId[f.from], b = byId[f.to];
        if (!a || !b) return null;
        const e = edge(a, b);
        const lw = (f.label?.length ?? 0) * 6.9 + 22;
        return (
          <g key={step.short + i}>
            <path className="link flow-base" d={e.d} />
            <path className="link flow" d={e.d} markerEnd="url(#arr)" />
            {[0, 1.3].map((d) => (
              <circle key={d} r="9" className="comet-glow" filter="url(#glow)">
                <animateMotion dur="2.6s" begin={`${d}s`} repeatCount="indefinite" path={e.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
              </circle>
            ))}
          </g>
        );
      })}

      {nodes.map((n) => {
        const on = shown.has(n.id);
        const src = lesson.nodes.find((o) => o.id === n.id)!;
        const fx = focus.has(n.id);
        return (
          <g key={n.id} transform={`translate(${n.x - NW / 2},${n.y - NH / 2})`}
             className={`node tone-${n.tone}${on ? "" : " ghost"}${fx ? " focus" : ""}${poked === n.id ? " poked" : ""}`}
             onClick={() => on && onPoke(src)} role="button" tabIndex={on ? 0 : -1} aria-label={n.label}
             onKeyDown={(e) => { if (on && e.key === "Enter") onPoke(src); }}>
            {fx && <rect x="-5" y="-5" width={NW + 10} height={NH + 10} rx="20" className="n-ring" />}
            <rect width={NW} height={NH} rx="15" className="n-box" />
            <rect x="12" y="10" width="36" height="36" rx="10" className="n-tile" />
            <path d={GLYPH[n.icon ?? ""] ?? GLYPH.chip} transform="translate(18,16)" className="n-glyph" />
            <text x="60" y={n.sub ? 25 : 32} className="n-label">{n.label}</text>
            {n.sub && <text x="60" y="42" className="n-sub">{n.sub}</text>}
            <rect x="12" y="58" width={NW - 24} height="30" rx="9" className="mv-bg" />
            <g transform="translate(18,60)" className="mv"><Mini icon={n.icon ?? ""} /></g>
          </g>
        );
      })}
      {(step.flows ?? []).map((f, i) => {
        const a = byId[f.from], b = byId[f.to];
        if (!a || !b) return null;
        const e = edge(a, b), lw = (f.label?.length ?? 0) * 6.9 + 22;
        return (
          <g key={"pk" + step.short + i} className="pk-layer">
            <animateMotion dur="2.6s" repeatCount="indefinite" path={e.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
            <rect x={-lw / 2} y="-12" width={lw} height="24" rx="12" className="packet" />
            <text textAnchor="middle" y="4" className="packet-t">{f.label ?? ""}</text>
          </g>
        );
      })}
    </svg>
  );
}
