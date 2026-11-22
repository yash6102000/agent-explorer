import { useEffect, useId, useRef } from "react";
import type { Lesson, SceneNode, Step, Tone } from "../types";

/* Illustrated isometric renderer. Draws any lesson from its existing data
   (nodes, links, flows, focus, zones): cubes with printed labels, props on tiles,
   arrows with travelling packets, focus rings. Auto-fits to the stage. */

type V = [number, number];
type Opts = Record<string, any>;
const NS = "http://www.w3.org/2000/svg";
const C30 = Math.cos(Math.PI / 6);
const P = (x: number, y: number, z = 0): V => [(x - y) * C30, (x + y) * 0.5 - z];
const WI = (sx: number, sy: number): V => [sy + sx / (2 * C30), sy - sx / (2 * C30)];
const pt = (p: V) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const ps = (a: V[]) => a.map(pt).join(" ");
const INK = "#24223a", ACC = "#5b4dff";
const TONE: Record<string, [string, string, string]> = {
  indigo: ["#f4f2ff", "#d8d2ff", "#b5abf8"], cyan: ["#effbff", "#c7edf7", "#9fd9ea"], mint: ["#f0fbf6", "#cdeee0", "#a3dbc3"],
  peach: ["#fff6ee", "#ffdcc3", "#f5bd96"], rose: ["#fff2f5", "#ffd1dc", "#f2a6b8"], slate: ["#f7f8fb", "#e0e3ed", "#c3c8d9"],
};
const TONE_OF: Record<Tone, string> = { green: "mint", violet: "indigo", orange: "peach", blue: "cyan", rose: "rose", gray: "slate", ink: "slate" };
const GLYPH: Record<string, string> = {
  spark: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z",
  chunk: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  chip: "M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  doc: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
  layers: "M12 3l9 5-9 5-9-5z M3 12.5l9 5 9-5 M3 17l9 5 9-5",
  user: "M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M4 21c1-4 4-6 8-6s7 2 8 6",
};
const ICON_GLYPH: Record<string, string> = { chunker: "chunk", chip: "chip", layers: "layers", tower: "spark", docs: "doc", rack: "db", laptop: "user" };

function el(tag: string, a: Opts = {}, p?: Element) {
  const e = document.createElementNS(NS, tag);
  for (const k in a) e.setAttribute(k, String(a[k]));
  if (p) p.appendChild(e);
  return e;
}
function roundPoly(pts: V[], r: number) {
  const n = pts.length; let d = "";
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    const l1 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, rr = Math.min(r, l1 / 2, l2 / 2);
    const p1: V = [b[0] + (a[0] - b[0]) / l1 * rr, b[1] + (a[1] - b[1]) / l1 * rr], p2: V = [b[0] + (c[0] - b[0]) / l2 * rr, b[1] + (c[1] - b[1]) / l2 * rr];
    d += (i ? "L" : "M") + pt(p1) + "Q" + pt(b) + " " + pt(p2);
  }
  return d + "Z";
}

interface NodeRef { key: string; src: SceneNode; g: SVGGElement; ring: SVGPathElement; cx: number; cy: number; rad: number }
interface ArrowRef { path: SVGPathElement; g: SVGGElement; len: number; x1: number; y1: number; x2: number; y2: number; mx: number; my: number }

function build(svg: SVGSVGElement, lesson: Lesson, pid: string, onPoke: (n: SceneNode) => void) {
  svg.innerHTML = "";
  let uid = 0;
  const defs = el("defs", {}, svg);
  for (const [k, t] of Object.entries(TONE)) {
    const g = el("linearGradient", { id: `${pid}-${k}-t`, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#fff" }, g); el("stop", { offset: 1, "stop-color": t[0] }, g);
    const c = el("linearGradient", { id: `${pid}-${k}-c`, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el("stop", { offset: 0, "stop-color": t[1] }, c); el("stop", { offset: 1, "stop-color": t[2] }, c);
  }
  const f = el("filter", { id: `${pid}-sh`, x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs); el("feGaussianBlur", { stdDeviation: 7 }, f);
  const pat = el("pattern", { id: `${pid}-grid`, width: 104, height: 60, patternUnits: "userSpaceOnUse" }, defs);
  el("path", { d: "M0 0L104 60M0 60L104 0", stroke: "rgba(91,77,255,.10)", "stroke-width": 1.2 }, pat);
  const m = el("marker", { id: `${pid}-ah`, viewBox: "0 0 12 12", refX: 9, refY: 6, markerUnits: "userSpaceOnUse", markerWidth: 18, markerHeight: 18, orient: "auto" }, defs);
  el("path", { d: "M1 1.5L11 6L1 10.5z", fill: ACC, stroke: ACC, "stroke-linejoin": "round" }, m);
  el("rect", { x: -4000, y: -4000, width: 8000, height: 8000, fill: `url(#${pid}-grid)` }, svg);
  const floor = el("g", {}, svg), arrowsL = el("g", {}, svg), layer = el("g", {}, svg), top = el("g", {}, svg);

  const glyph = (p: Element, cx: number, cy: number, name: string, size = 28) =>
    el("path", { d: GLYPH[name] || GLYPH.spark, class: "iso-glyph", transform: `translate(${cx - size / 2},${cy - size / 2}) scale(${size / 24})` }, p);
  const shadow = (p: Element, wx: number, wy: number, w: number, d: number) =>
    el("path", { d: roundPoly([P(wx - w / 2 + 8, wy - d / 2 + 16), P(wx + w / 2 + 16, wy - d / 2 + 8), P(wx + w / 2 + 16, wy + d / 2 + 16), P(wx - w / 2 + 8, wy + d / 2 + 16)], 22), fill: "rgba(36,34,58,.16)", filter: `url(#${pid}-sh)` }, p);
  const slab = (p: Element, wx: number, wy: number, w: number, d: number, h: number, o: Opts = {}) => {
    const { r = 16, z = 0, topC = "#fff", side = "#e6e8f1", sw = 2.6 } = o;
    const T0 = P(wx - w / 2, wy - d / 2, z + h), T1 = P(wx + w / 2, wy - d / 2, z + h), T2 = P(wx + w / 2, wy + d / 2, z + h), T3 = P(wx - w / 2, wy + d / 2, z + h);
    const B1 = P(wx + w / 2, wy - d / 2, z), B2 = P(wx + w / 2, wy + d / 2, z), B3 = P(wx - w / 2, wy + d / 2, z);
    el("path", { d: roundPoly([T3, T2, T1, B1, B2, B3], r), fill: side, class: "iso-ink", "stroke-width": sw }, p);
    el("path", { d: roundPoly([T0, T1, T2, T3], r), fill: topC, class: "iso-ink", "stroke-width": sw }, p);
  };
  const pill = (x: number, y: number, text: string, o: Opts = {}) => {
    const { icon, kind = "", size = 13, parent = top } = o;
    const w = text.length * size * 0.62 + (icon ? 44 : 28), h = size + 19;
    const g = el("g", { class: "iso-pill " + kind, transform: `translate(${x - w / 2},${y - h / 2})` }, parent);
    el("rect", { width: w, height: h, rx: h / 2, class: "iso-pill-bg" }, g);
    if (icon) { el("circle", { cx: h / 2 + 1, cy: h / 2, r: h / 2 - 6, class: "iso-pill-ic" }, g); glyph(g, h / 2 + 1, h / 2, icon, 14); }
    el("text", { x: icon ? h + 4 : w / 2, y: h / 2 + 5, "text-anchor": icon ? "start" : "middle" }, g).textContent = text;
    return g;
  };

  /* --- props --- */
  const cube = (g: Element, ax: number, ay: number, o: Opts) => {
    const { s = 90, h = 68, z = 0, tone = "indigo", icon, title, sub, r = 12 } = o;
    const [wx, wy] = WI(ax, ay);
    const p = (dx: number, dy: number, dz: number) => P(wx + dx, wy + dy, z + dz);
    const T0 = p(-s / 2, -s / 2, h), T1 = p(s / 2, -s / 2, h), T2 = p(s / 2, s / 2, h), T3 = p(-s / 2, s / 2, h), B1 = p(s / 2, -s / 2, 0), B2 = p(s / 2, s / 2, 0), B3 = p(-s / 2, s / 2, 0);
    if (!z) shadow(g, wx, wy, s, s);
    const hex = roundPoly([T0, T1, B1, B2, B3, T3], r), cid = `${pid}-c${uid++}`;
    el("path", { d: hex }, el("clipPath", { id: cid }, defs));
    const fg = el("g", { "clip-path": `url(#${cid})` }, g);
    el("polygon", { points: ps([T3, T2, B2, B3]), fill: TONE[tone][1] }, fg);
    el("polygon", { points: ps([T2, T1, B1, B2]), fill: TONE[tone][2] }, fg);
    el("polygon", { points: ps([T0, T1, T2, T3]), fill: `url(#${pid}-${tone}-t)` }, fg);
    el("path", { d: `M${pt(T3)}L${pt(T2)}L${pt(T1)}M${pt(T2)}L${pt(B2)}`, fill: "none", class: "iso-ink", "stroke-width": 2, opacity: 0.55 }, g);
    el("path", { d: hex, fill: "none", class: "iso-ink", "stroke-width": 2.8 }, g);
    const tp = p(0, 0, h);
    if (icon) glyph(g, tp[0], tp[1], icon, Math.min(34, s * 0.36));
    if (title) {
      const cy = (T2[1] + B2[1]) / 2 + (sub ? -1 : 6);
      el("text", { x: T2[0], y: cy, "text-anchor": "middle", class: "iso-lbl" }, g).textContent = title;
      if (sub) el("text", { x: T2[0], y: cy + 17, "text-anchor": "middle", class: "iso-sub" }, g).textContent = sub;
    }
    return { B3, h, s };
  };
  const laptop = (g: Element, ax: number, ay: number, tone: string) => {
    const [wx, wy] = WI(ax, ay);
    shadow(g, wx, wy, 170, 130); slab(g, wx, wy, 172, 132, 16, { r: 20 });
    const z0 = 16;
    slab(g, wx + 8, wy + 2, 112, 84, 7, { z: z0, r: 8, topC: "#eef0f6", side: "#cdd1df", sw: 2.2 });
    for (let i = 0; i < 4; i++) { const a = P(wx - 28, wy - 24 + i * 11, z0 + 7), b = P(wx + 40, wy - 24 + i * 11, z0 + 7); el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#b8bdcd", "stroke-width": 2, "stroke-linecap": "round" }, g); }
    const zb = z0 + 7, sh = 74, lean = 14, x0 = wx - 48;
    const A = P(x0, wy - 40, zb), B = P(x0, wy + 44, zb), C = P(x0 - lean, wy + 44, zb + sh), D = P(x0 - lean, wy - 40, zb + sh);
    el("path", { d: roundPoly([A, B, C, D], 6), fill: "#2e2b48", class: "iso-ink", "stroke-width": 2.6 }, g);
    const bil = (u: number, v: number): V => { const a: V = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u], b: V = [D[0] + (C[0] - D[0]) * u, D[1] + (C[1] - D[1]) * u]; return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v]; };
    el("polygon", { points: ps([bil(0.07, 0.1), bil(0.93, 0.1), bil(0.93, 0.9), bil(0.07, 0.9)]), fill: TONE[tone][1] }, g);
    el("polygon", { points: ps([bil(0.07, 0.72), bil(0.93, 0.72), bil(0.93, 0.9), bil(0.07, 0.9)]), fill: TONE[tone][2] }, g);
    for (const [u1, u2, v] of [[0.15, 0.7, 0.58], [0.15, 0.55, 0.45], [0.15, 0.8, 0.32]]) { const a = bil(u1, v), b = bil(u2, v); el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#fff", "stroke-width": 3, "stroke-linecap": "round" }, g); }
    return { cy: ay - 40, rad: 92, labelY: ay + 62 };
  };
  const docs = (g: Element, ax: number, ay: number) => {
    const [wx, wy] = WI(ax, ay);
    shadow(g, wx, wy, 160, 130); slab(g, wx, wy, 160, 128, 14, { r: 18 });
    [[0, 0], [6, -4], [-4, 4]].forEach(([dx, dy], i) => slab(g, wx + dx, wy + dy, 96, 74, 5, { z: 14 + i * 7, r: 5, topC: "#fff", side: "#dfe2ec", sw: 2.2 }));
    const zt = 33;
    for (let i = 0; i < 4; i++) { const a = P(wx - 30, wy - 22 + i * 13, zt), b = P(wx + (i === 3 ? 6 : 30), wy - 22 + i * 13, zt); el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#a9aec2", "stroke-width": 2.4, "stroke-linecap": "round" }, g); }
    return { cy: ay - 26, rad: 86, labelY: ay + 56 };
  };
  const cylinder = (g: Element, ax: number, ay: number, tone: string) => {
    const r = 50, h = 76, [wx, wy] = WI(ax, ay); shadow(g, wx, wy, r * 2, r * 2);
    const rx = r * 1.2247, ry = r * 0.7071, yT = ay - h;
    el("path", { d: `M${ax - rx},${yT} L${ax - rx},${ay} A${rx},${ry} 0 0 0 ${ax + rx},${ay} L${ax + rx},${yT} Z`, fill: `url(#${pid}-${tone}-c)`, class: "iso-ink", "stroke-width": 2.8 }, g);
    for (const k of [1 / 3, 2 / 3]) el("path", { d: `M${ax - rx},${yT + h * k} A${rx},${ry} 0 0 0 ${ax + rx},${yT + h * k}`, fill: "none", class: "iso-ink", "stroke-width": 1.8, opacity: 0.45 }, g);
    el("ellipse", { cx: ax, cy: yT, rx, ry, fill: TONE[tone][0], class: "iso-ink", "stroke-width": 2.8 }, g);
    glyph(g, ax, ay - h / 2 + ry * 0.45, "db", 30);
    return { cy: ay - h / 2, rad: rx + 8, labelY: ay + 44 };
  };
  const robot = (g: Element, ax: number, ay: number, tone: string) => {
    const s = 100, h = 80; const c = cube(g, ax, ay, { s, h, tone, r: 16 });
    const f = el("g", { transform: `matrix(${C30} 0.5 0 -1 ${c.B3[0]} ${c.B3[1]})` }, g);
    for (const u of [s * 0.3, s * 0.66]) { el("ellipse", { cx: u, cy: h * 0.58, rx: s * 0.09, ry: s * 0.11, fill: "#fff", stroke: INK, "stroke-width": 2.2 }, f); el("ellipse", { cx: u + 2, cy: h * 0.6, rx: s * 0.04, ry: s * 0.05, fill: INK }, f); }
    el("path", { d: `M${s * 0.36} ${h * 0.28} q${s * 0.12} ${-h * 0.12} ${s * 0.26} 0`, fill: "none", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round" }, f);
    const tp = P(...WI(ax, ay), h);
    el("line", { x1: tp[0], y1: tp[1], x2: tp[0], y2: tp[1] - 28, class: "iso-ink", "stroke-width": 2.8 }, g);
    el("circle", { cx: tp[0], cy: tp[1] - 34, r: 7, fill: ACC, class: "iso-ink", "stroke-width": 2.4 }, g);
    return { cy: ay - h / 2 - 10, rad: s * 0.92, labelY: ay + 44 };
  };

  /* --- layout: keep the lesson's arrangement, spread for iso props --- */
  const xs = lesson.nodes.map((n) => n.x), ys = lesson.nodes.map((n) => n.y);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const pos: Record<string, V> = Object.fromEntries(lesson.nodes.map((n) => [n.id, [(n.x - mx) * 1.7, (n.y - my) * 2.15]]));

  /* zones: tinted floor regions under groups of nodes */
  const zoneEls: { g: SVGGElement; ids: string[] }[] = [];
  /* a zone = a tinted floor tile under each member, plus one label; compact, so it never forces a zoom-out */
  for (const z of lesson.zones ?? []) {
    const members = z.ids.map((i) => pos[i]).filter(Boolean);
    if (!members.length) continue;
    const g = el("g", { class: "iso-zone" }, floor) as SVGGElement;
    const tone = TONE[TONE_OF[z.tone] ?? "slate"], T = 118;
    for (const [ax, ay] of members) {
      const [wx, wy] = WI(ax, ay);
      el("path", { d: roundPoly([P(wx - T, wy - T), P(wx + T, wy - T), P(wx + T, wy + T), P(wx - T, wy + T)], 34), fill: tone[1], "fill-opacity": 0.45, stroke: tone[2], "stroke-width": 2.2, "stroke-dasharray": "8 7" }, g);
    }
    const [lx, ly] = members.reduce((a, b) => (b[0] < a[0] ? b : a));
    pill(lx, ly + 120, z.sub ? `${z.label.toUpperCase()} · ${z.sub}` : z.label.toUpperCase(), { kind: "ghost", size: 11.5, parent: g });
    zoneEls.push({ g, ids: z.ids });
  }

  /* nodes, back to front */
  const nodes: Record<string, NodeRef> = {};
  [...lesson.nodes].sort((a, b) => pos[a.id][1] - pos[b.id][1] || pos[a.id][0] - pos[b.id][0]).forEach((n) => {
    const [ax, ay] = pos[n.id], tone = TONE_OF[n.tone] ?? "indigo";
    const g = el("g", { class: "iso-node", role: "button", tabindex: 0, "aria-label": n.label }, layer) as SVGGElement;
    const [wx, wy] = WI(ax, ay);
    const ring = el("path", { d: roundPoly([P(wx - 100, wy - 100), P(wx + 100, wy - 100), P(wx + 100, wy + 100), P(wx - 100, wy + 100)], 28), class: "iso-ring" }, floor) as SVGPathElement;
    const agent = /agent|orchestrator|worker|planner|executor|subagent/i.test(n.label) && !/memory|tool|user|you\b/i.test(n.label);
    let info: { cy: number; rad: number; labelY?: number };
    let printed = false;
    if (agent) info = robot(g, ax, ay, tone);
    else if (n.icon === "laptop") info = laptop(g, ax, ay, tone);
    else if (n.icon === "docs") info = docs(g, ax, ay);
    else if (n.icon === "rack") info = cylinder(g, ax, ay, tone);
    else { const big = n.icon === "tower"; cube(g, ax, ay, { s: big ? 102 : 90, h: big ? 80 : 68, tone, icon: ICON_GLYPH[n.icon ?? ""] ?? "spark", title: n.label, sub: n.sub }); info = { cy: ay - (big ? 52 : 46), rad: big ? 94 : 84 }; printed = true; }
    if (!printed) pill(ax, info.labelY ?? ay + 50, n.label, { icon: ICON_GLYPH[n.icon ?? ""] ?? "spark", parent: g });
    g.addEventListener("click", () => onPoke(n));
    g.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") onPoke(n); });
    nodes[n.id] = { key: n.id, src: n, g, ring, cx: ax, cy: info.cy, rad: info.rad };
  });

  /* arrows: faint links + flow arrows (union over all steps) */
  const flowPairs = new Set<string>();
  lesson.steps.forEach((s) => (s.flows ?? []).forEach((f) => flowPairs.add(`${f.from}>${f.to}`)));
  const mkPath = (a: NodeRef, b: NodeRef, bend: number) => {
    const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const x1 = a.cx + ux * a.rad, y1 = a.cy + uy * a.rad, x2 = b.cx - ux * b.rad, y2 = b.cy - uy * b.rad;
    const mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
    return { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, x1, y1, x2, y2, mx, my };
  };
  const links: { g: SVGPathElement; a: string; b: string }[] = [];
  for (const l of lesson.links) {
    const a = nodes[l.a], b = nodes[l.b]; if (!a || !b) continue;
    links.push({ g: el("path", { d: mkPath(a, b, 0).d, class: "iso-link" }, arrowsL) as SVGPathElement, a: l.a, b: l.b });
  }
  const arrows: Record<string, ArrowRef> = {};
  flowPairs.forEach((k) => {
    const [fa, fb] = k.split(">"), a = nodes[fa], b = nodes[fb]; if (!a || !b) return;
    const bend = flowPairs.has(`${fb}>${fa}`) ? 26 : 0, geo = mkPath(a, b, bend);
    const g = el("g", { class: "iso-arr" }, arrowsL) as SVGGElement;
    const path = el("path", { d: geo.d, class: "iso-arr-line", "marker-end": `url(#${pid}-ah)` }, g) as SVGPathElement;
    arrows[k] = { g, path, len: path.getTotalLength(), ...geo };
  });

  const dynamic = el("g", {}, top);
  let active: ArrowRef[] = [], dots: SVGCircleElement[][] = [];

  return {
    nodes, top,
    fit() {
      const W = svg.clientWidth, Hh = svg.clientHeight; if (!W || !Hh) return;
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      for (const g of [floor, arrowsL, layer]) { const b = (g as SVGGElement).getBBox(); if (!b.width && !b.height) continue; x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); }
      const pad = 30, bw = x2 - x1 + pad * 2, bh = y2 - y1 + pad * 2;
      const s = Math.min(W / bw, Hh / bh, 1.15), vw = W / s, vh = Hh / s;
      svg.setAttribute("viewBox", `${(x1 + x2) / 2 - vw / 2} ${(y1 + y2) / 2 - vh / 2} ${vw} ${vh}`);
    },
    apply(step: Step) {
      const shown = new Set(step.show), focus = new Set(step.focus ?? []);
      Object.values(nodes).forEach((n) => { n.g.classList.toggle("iso-ghost", !shown.has(n.key)); n.g.classList.toggle("iso-up", focus.has(n.key)); n.ring.classList.toggle("on", focus.has(n.key)); });
      zoneEls.forEach((z) => z.g.classList.toggle("off", !z.ids.some((i) => shown.has(i))));
      links.forEach((l) => l.g.classList.toggle("off", !(shown.has(l.a) && shown.has(l.b))));
      Object.values(arrows).forEach((a) => a.g.classList.remove("on"));
      dynamic.innerHTML = ""; active = []; dots = [];
      for (const f of step.flows ?? []) {
        const a = arrows[`${f.from}>${f.to}`]; if (!a) continue;
        a.g.classList.add("on"); active.push(a);
        dots.push([0, 1].map(() => el("circle", { r: 8.5, class: "iso-pk" }, dynamic) as SVGCircleElement));
        if (f.label) { const qx = 0.25 * a.x1 + 0.5 * a.mx + 0.25 * a.x2, qy = 0.25 * a.y1 + 0.5 * a.my + 0.25 * a.y2; pill(qx, qy - 22, f.label, { size: 12.5, parent: dynamic }); }
      }
    },
    poke(id?: string) { Object.values(nodes).forEach((n) => n.g.classList.toggle("iso-poked", n.key === id)); },
    tick(t: number) {
      active.forEach((a, i) => dots[i].forEach((d, j) => {
        const k = ((t / 1500) + j * 0.5 + i * 0.12) % 1, p = a.path.getPointAtLength(k * a.len);
        d.setAttribute("cx", String(p.x)); d.setAttribute("cy", String(p.y));
        d.style.opacity = String(k < 0.06 ? k / 0.06 : k > 0.94 ? (1 - k) / 0.06 : 1);
      }));
    },
  };
}

export function IsoStage({ lesson, step, poked, onPoke }: { lesson: Lesson; step: Step; poked?: string; onPoke: (n: SceneNode) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const scene = useRef<ReturnType<typeof build> | null>(null);
  const pokeRef = useRef(onPoke); pokeRef.current = onPoke;
  const pid = "iso" + useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const svg = ref.current!; scene.current = build(svg, lesson, pid, (n) => pokeRef.current(n));
    const ro = new ResizeObserver(() => scene.current?.fit()); ro.observe(svg); scene.current.fit();
    return () => ro.disconnect();
  }, [lesson, pid]);
  useEffect(() => { scene.current?.apply(step); }, [lesson, step]);
  useEffect(() => { scene.current?.poke(poked); }, [poked, lesson]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; const loop = (t: number) => { scene.current?.tick(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);

  return <svg ref={ref} className="stage-svg iso-svg" role="img" aria-label={`Diagram: ${step.title}`} />;
}
