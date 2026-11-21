import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LESSONS, MODULES } from "./lessons";
import { buildCtx } from "./lib/rag";
import { useStored } from "./lib/hooks";
import { Stage } from "./components/Stage";
import { PanelView } from "./components/Panels";
import { Inspector } from "./components/Inspector";
import { Sidebar } from "./components/Sidebar";
import { Search } from "./components/Search";
import { Rich } from "./components/Rich";
import { ContextPacker } from "./components/ContextPacker";

import { EmbeddingGalaxy } from "./components/EmbeddingGalaxy";

const GAMES = ["context-packer", "embedding-galaxy"];

const DEFAULT_LESSON = "simple-rag";

function parseHash(): { lesson: string; step: number } {
  const [, lesson, step] = location.hash.split("/");
  return { lesson: lesson && (LESSONS[lesson] || GAMES.includes(lesson)) ? lesson : DEFAULT_LESSON, step: Math.max(0, parseInt(step ?? "0", 10) || 0) };
}

const Cube = () => (
  <svg width="22" height="22" viewBox="-13 -13 26 26" aria-hidden="true">
    <polygon points="0,-11 11,-5 0,1 -11,-5" className="logo-t" />
    <polygon points="-11,-5 0,1 0,12 -11,6" className="logo-l" />
    <polygon points="11,-5 0,1 0,12 11,6" className="logo-r" />
  </svg>
);

export function App() {
  const [route, setRoute] = useState(parseHash);
  const isGame = GAMES.includes(route.lesson);
  const lesson = LESSONS[route.lesson] ?? LESSONS[DEFAULT_LESSON];
  const step = Math.min(route.step, lesson.steps.length - 1);
  const s = lesson.steps[step];
  const module = MODULES.find((m) => m.lessons.some((l) => l.id === route.lesson));

  const [theme, setTheme] = useStored<"light" | "dark">("theme", "light");
  const [done, setDone] = useStored<string[]>("done", []);
  const [queryId, setQueryId] = useState(lesson.demo?.queries[0].id ?? "");
  const [k, setK] = useState(lesson.demo?.defaultK ?? 2);
  const [side, setSide] = useStored("side", true);
  const [search, setSearch] = useState(false);

  const traceRef = useRef<HTMLPreElement>(null);
  useEffect(() => { traceRef.current?.scrollTo({ top: traceRef.current.scrollHeight }); }, [step, route.lesson]);

  const ctx = useMemo(() => (lesson.demo ? buildCtx(lesson.demo, queryId, k) : undefined), [lesson, queryId, k]);
  const go = useCallback((id: string, i: number) => {
    location.hash = `/${id}/${Math.max(0, Math.min((LESSONS[id]?.steps.length ?? 1) - 1, i))}`;
  }, []);

  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (lesson.demo) { setQueryId(lesson.demo.queries[0].id); setK(lesson.demo.defaultK); }
  }, [lesson]);

  const last = !isGame && step === lesson.steps.length - 1;
  useEffect(() => {
    if (last && !done.includes(lesson.id)) setDone([...done, lesson.id]);
  }, [last, lesson.id, done, setDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((v) => !v); return; }
      const tag = (e.target as HTMLElement).tagName;
      if (search || isGame || tag === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === " " && tag !== "BUTTON") { e.preventDefault(); go(lesson.id, step + 1); }
      else if (e.key === "ArrowLeft") go(lesson.id, step - 1);
      else if (e.key === "Home") go(lesson.id, 0);
      else if (e.key === "b") setSide((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, lesson.id, step, search, isGame, setSide]);

  const payload = s.data ?? (ctx ? s.payload?.(ctx) : undefined);

  return (
    <div className="app">
      <header className="topbar">
        <button className="ibtn" onClick={() => setSide(!side)} aria-label="Toggle sidebar" aria-pressed={side}>☰</button>
        <div className="brand"><Cube /><b>Agent Explorer</b></div>
        <nav className="crumb"><span>{module?.title}</span><i>/</i><b>{isGame ? (route.lesson === "embedding-galaxy" ? "Embedding Galaxy" : "Context Packer") : lesson.title}</b></nav>
        <span className="grow" />
        <button className="pill" onClick={() => setSearch(true)}>Search <kbd>⌘K</kbd></button>
        <button className="ibtn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">{theme === "dark" ? "☀" : "☾"}</button>
      </header>

      <div className={side ? "shell side-open" : "shell"}>
        <Sidebar current={route.lesson} step={step} done={done} open={side}
          onPick={(id) => { go(id, 0); if (innerWidth < 900) setSide(false); }}
          onStep={(i) => { go(lesson.id, i); if (innerWidth < 900) setSide(false); }}
          onClose={() => setSide(false)} />
        {side && <div className="scrim2" onClick={() => setSide(false)} />}

        {isGame ? <main className="playmain">{route.lesson === "embedding-galaxy" ? <EmbeddingGalaxy /> : <ContextPacker />}</main> : <main className="scene">
          <div className="center">
            <section className="stagecard"><Stage lesson={lesson} step={s} /></section>
            {s.panel && (
              <section className="viz"><PanelView panel={s.panel} lesson={lesson} ctx={ctx} setK={setK} onQuery={setQueryId} /></section>
            )}
          </div>

          <aside className="right">
            <section className="narr" aria-live="polite">
              <div className="narr-h">
                <span className={`tag ch-${s.chapter}`}>{s.chapter} · {step + 1}/{lesson.steps.length}</span>
                <span className="grow" />
                <button className="nav" onClick={() => go(lesson.id, step - 1)} disabled={step === 0} aria-label="Previous step">←</button>
                <button className="nav primary" onClick={() => go(lesson.id, step + 1)} disabled={last} aria-label="Next step">→</button>
              </div>
              <h2>{s.title}</h2>
              {s.body.map((b, i) => <p key={i}><Rich text={b} /></p>)}
              {s.callout && <div className={`callout ${s.callout.kind}`}><b>{s.callout.kind}</b><Rich text={s.callout.text} /></div>}
              {s.changes && <ul className="changes">{s.changes.map((c) => <li key={c}>{c}</li>)}</ul>}
              {s.metrics && <div className="metrics">{s.metrics.map((m) => <div key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}</div>}
            </section>
            <section className="insp">
              <h3>Inspector{payload && <small>{payload.title}</small>}</h3>
              {payload ? <Inspector title="" data={payload.data} /> : <p className="empty">No message is sent on this step.</p>}
            </section>
            <section className="tracebox">
              <h3>Trace</h3>
              <pre className="trace" ref={traceRef}>
                <span className="dim">$ </span>lesson.run <span className="str">"{lesson.id}"</span>{"\n"}
                {lesson.steps.slice(0, step).map((st) => <span key={st.short}><span className="ok">✓</span> {st.short.toLowerCase()}{"\n"}</span>)}
                <span className="acc">→ {s.title.toLowerCase()}</span><span className="caret" />{last ? "\n✓ done" : ""}
              </pre>
            </section>
          </aside>
        </main>}
      </div>

      {search && <Search onClose={() => setSearch(false)} onGo={(l, i) => { setSearch(false); go(l, i); }} />}
    </div>
  );
}
