import { useEffect, useMemo, useRef, useState } from "react";
import { LESSONS, MODULES } from "../lessons";

interface Hit { lesson: string; step: number; label: string; sub: string }

export function Search({ onClose, onGo }: { onClose: () => void; onGo: (lesson: string, step: number) => void }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const hits = useMemo<Hit[]>(() => {
    const all: Hit[] = [];
    for (const m of MODULES) for (const l of m.lessons) {
      if (!l.ready) continue;
      all.push({ lesson: l.id, step: 0, label: l.title, sub: m.title });
      LESSONS[l.id]?.steps.forEach((s, i) => all.push({ lesson: l.id, step: i, label: s.title, sub: `${l.title} · step ${i + 1}` }));
    }
    const n = q.trim().toLowerCase();
    return (n ? all.filter((h) => (h.label + h.sub).toLowerCase().includes(n)) : all).slice(0, 12);
  }, [q]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog" role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons and steps…"
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && hits[0]) onGo(hits[0].lesson, hits[0].step); }} />
        <ul>
          {hits.map((h, i) => (
            <li key={i}><button onClick={() => onGo(h.lesson, h.step)}><b>{h.label}</b><small>{h.sub}</small></button></li>
          ))}
          {hits.length === 0 && <li className="none">No matches</li>}
        </ul>
      </div>
    </div>
  );
}
