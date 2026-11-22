import type { Lesson, Panel, RagCtx } from "../types";
import { vec } from "../lib/rag";
import { Rich } from "./Rich";
import { TokensPanel, WindowPanel, WordMapPanel } from "./Foundations";
import { ChunkPanel } from "./Retrieval";
import { SamplerPanel, AttentionPanel, FusionPanel, RerankPanel, GraphPanel, TracePanel, DefensesPanel } from "./Interactive";

const f2 = (n: number) => n.toFixed(2);

export function QueryPicker({ lesson, ctx, onQuery }: { lesson: Lesson; ctx: RagCtx; onQuery: (id: string) => void }) {
  if (!lesson.demo) return null;
  return (
    <div className="picker" role="group" aria-label="Choose a question">
      {lesson.demo!.queries.map((q) => (
        <button key={q.id} className={q.id === ctx.query.id ? "chip on" : "chip"} onClick={() => onQuery(q.id)}>{q.text}</button>
      ))}
    </div>
  );
}

function Scatter({ lesson, ctx, showQuery, ranking }: { lesson: Lesson; ctx: RagCtx; showQuery: boolean; ranking: boolean }) {
  const S = 130, C = 160; // scale and centre
  const pos = (a: number, r: number) => { const [x, y] = vec(a, r); return [C + x * S, C - y * S] as const; };
  const topIds = new Set(ranking ? ctx.top.map((t) => t.chunk.id) : []);
  const [qx, qy] = pos(ctx.query.angle, 0.95);
  return (
    <svg viewBox="0 0 380 320" className="scatter" role="img" aria-label="Embedding map">
      <line x1="10" y1={C} x2="370" y2={C} className="axis" />
      <line x1={C} y1="10" x2={C} y2="310" className="axis" />
      {showQuery && lesson.demo!.chunks.map((ch) => {
        const [x, y] = pos(ch.angle, ch.radius);
        return <line key={ch.id} x1={C} y1={C} x2={x} y2={y} className={topIds.has(ch.id) ? "ray hit" : "ray"} />;
      })}
      {showQuery && <line x1={C} y1={C} x2={qx} y2={qy} className="ray q" />}
      {lesson.demo!.chunks.map((ch) => {
        const [x, y] = pos(ch.angle, ch.radius);
        const hit = topIds.has(ch.id);
        return (
          <g key={ch.id} className={hit ? "pt hit" : "pt"}>
            <circle cx={x} cy={y} r={hit ? 9 : 7} />
            <text x={x + 11} y={y + 4}>{ch.source.replace(".md", "")}</text>
          </g>
        );
      })}
      {showQuery && (
        <g className="pt q">
          <path d={`M${qx},${qy - 11} l9,11 l-9,11 l-9,-11 z`} />
          <text x={qx + 12} y={qy + 4}>question</text>
        </g>
      )}
    </svg>
  );
}

export function PanelView({ panel, lesson, ctx: ctxIn, setK, onQuery }: {
  panel: Panel; lesson: Lesson; ctx?: RagCtx; setK: (k: number) => void; onQuery: (id: string) => void;
}) {
  switch (panel.kind) {
    case "tokens": return <TokensPanel />;
    case "window": return <WindowPanel turns={panel.turns} interactive={panel.interactive} />;
    case "wordmap": return <WordMapPanel words={lesson.words ?? []} />;
    case "chunking": return <ChunkPanel panel={panel} />;
    case "sampler": return <SamplerPanel panel={panel} />;
    case "attention": return <AttentionPanel panel={panel} />;
    case "fusion": return <FusionPanel panel={panel} />;
    case "rerank": return <RerankPanel panel={panel} />;
    case "graph": return <GraphPanel panel={panel} />;
    case "trace": return <TracePanel panel={panel} />;
    case "defenses": return <DefensesPanel panel={panel} />;
    case "cards":
      return (
        <div className="cards">
          {panel.cards.map((c) => (
            <div key={c.title} className={`card-i tone-${c.tone}`}><b>{c.title}</b><p>{c.text}</p></div>
          ))}
        </div>
      );
  }
  if (!ctxIn || !lesson.demo) return null;
  const ctx = ctxIn;
  switch (panel.kind) {
    case "chunks":
      return (
        <div className="chunks">
          {lesson.demo!.chunks.map((c) => {
            const v = vec(c.angle, c.radius);
            return (
              <div key={c.id} className="chunk">
                <div className="chunk-h"><b>{c.id}</b><span>{c.source}</span></div>
                <p>{c.text}</p>
                {panel.vectors && <code className="vec">[{f2(v[0])}, {f2(v[1])}]</code>}
              </div>
            );
          })}
        </div>
      );
    case "vectors":
      return (
        <div className="vectors">
          {panel.interactive && <QueryPicker lesson={lesson} ctx={ctx} onQuery={onQuery} />}
          <div className="vec-body">
            <Scatter lesson={lesson} ctx={ctx} showQuery={!!panel.query} ranking={!!panel.ranking} />
            {panel.ranking && (
              <div className="rank">
                <div className="kctl">
                  <span>k =</span>
                  <button className="btn sm" onClick={() => setK(Math.max(1, ctx.k - 1))} aria-label="Decrease k">−</button>
                  <b>{ctx.k}</b>
                  <button className="btn sm" onClick={() => setK(Math.min(lesson.demo!.chunks.length, ctx.k + 1))} aria-label="Increase k">+</button>
                </div>
                {ctx.ranked.map((r, i) => (
                  <div key={r.chunk.id} className={i < ctx.k ? "row hit" : "row"}>
                    <span className="rn">{r.chunk.source}</span>
                    <span className="bar"><i style={{ width: `${Math.max(0, r.score) * 100}%` }} /></span>
                    <span className="sc">{f2(r.score)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    case "prompt":
      return (
        <div>
          <QueryPicker lesson={lesson} ctx={ctx} onQuery={onQuery} />
          <div className="prompt">
            <div className="pp sys"><em>System</em>Answer using only the context below. If the answer is not there, say you don't know.</div>
            <div className="pp ctx"><em>Context</em>
              {ctx.top.map((t) => <p key={t.chunk.id}><b>[{t.chunk.source}]</b> {t.chunk.text}</p>)}
            </div>
            <div className="pp q"><em>Question</em>{ctx.query.text}</div>
          </div>
        </div>
      );
    case "answer":
      return (
        <div>
          <QueryPicker lesson={lesson} ctx={ctx} onQuery={onQuery} />
          <div className={panel.grounded ? "answer good" : "answer bad"}>
            <em>{panel.grounded ? "Grounded answer" : "Answer with no documents (a guess)"}</em>
            <p><Rich text={panel.grounded ? ctx.query.grounded : ctx.query.guess} /></p>
            {panel.grounded && (
              <div className="srcs">{ctx.top.map((t) => <span key={t.chunk.id} className="chip on">{t.chunk.source}</span>)}</div>
            )}
          </div>
        </div>
      );
  }
}
