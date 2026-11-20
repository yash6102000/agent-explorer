import type { Lesson, Step } from "../types";
import { ICONS } from "./Iso";

const W = 800, H = 340, TRIM = 52;

function trimmed(a: { x: number; y: number }, b: { x: number; y: number }, t = TRIM) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  return { x1: a.x + ux * t, y1: a.y + uy * t * 0.8 + 6, x2: b.x - ux * t, y2: b.y - uy * t * 0.8 + 6 };
}

export function Stage({ lesson, step }: { lesson: Lesson; step: Step }) {
  const byId = Object.fromEntries(lesson.nodes.map((n) => [n.id, n]));
  const shown = new Set(step.show);
  const focus = new Set(step.focus ?? []);
  return (
    <svg className="stage-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Diagram: ${step.title}`}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="arr-h" />
        </marker>
      </defs>
      {lesson.links.map((l) => {
        if (!shown.has(l.a) || !shown.has(l.b)) return null;
        const t = trimmed(byId[l.a], byId[l.b]);
        return <line key={l.a + l.b} className="link" {...t} />;
      })}
      {(step.flows ?? []).map((f, i) => {
        const a = byId[f.from], b = byId[f.to];
        if (!a || !b) return null;
        const t = trimmed(a, b);
        const path = `M${t.x1},${t.y1} L${t.x2},${t.y2}`;
        return (
          <g key={step.short + i}>
            <line className="link flow" {...t} markerEnd="url(#arr)" />
            {[0, 0.9].map((d) => (
              <circle key={d} r="4.5" className="packet">
                <animateMotion dur="1.8s" begin={`${d}s`} repeatCount="indefinite" path={path} />
              </circle>
            ))}
            {f.label && (
              <g transform={`translate(${(t.x1 + t.x2) / 2},${(t.y1 + t.y2) / 2})`}>
                <rect x={-f.label.length * 3.3 - 8} y="-10" width={f.label.length * 6.6 + 16} height="20" rx="10" className="flow-pill" />
                <text textAnchor="middle" y="3.5" className="flow-text">{f.label}</text>
              </g>
            )}
          </g>
        );
      })}
      {lesson.nodes.map((n) => {
        const Icon = ICONS[n.icon ?? ""];
        return (
          <g key={n.id} className={`node tone-${n.tone}${shown.has(n.id) ? "" : " ghost"}${focus.has(n.id) ? " focus" : ""}`}>
            <g transform={`translate(${n.x},${n.y + 16})`}>{Icon ? <Icon /> : null}</g>
            <text x={n.x} y={n.y + 52} textAnchor="middle" className="n-label">{n.label}</text>
            {n.sub && <text x={n.x} y={n.y + 65} textAnchor="middle" className="n-sub">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
}
