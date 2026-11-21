import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LESSONS, MODULES } from "./lessons";
import { buildCtx } from "./lib/rag";
import { useStored } from "./lib/hooks";
import { Stage } from "./components/Stage";
import { PanelView } from "./components/Panels";
import { Json } from "./components/Inspector";
import { Search } from "./components/Search";
import { Rich } from "./components/Rich";
import { ContextPacker } from "./components/ContextPacker";
import { Home } from "./components/Home";
import type { SceneNode } from "./types";

const GAMES = ["context-packer"];
const READY = MODULES.flatMap((m) => m.lessons).filter((l) => l.ready && LESSONS[l.id]);

function parseHash(): { lesson: string; step: number } {
  const [, a, b] = location.hash.split("/");
  const ok = a && (LESSONS[a] || GAMES.includes(a));
  return { lesson: ok ? a : "", step: Math.max(0, parseInt(b ?? "0", 10) || 0) };
}

const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <defs><linearGradient id="lgo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b7bff" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
    <rect x="1" y="1" width="22" height="22" rx="7" fill="url(#lgo)" />
    <path d="M8 9L16 9L12 16Z" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".6" />
    <circle cx="8" cy="9" r="2" fill="#fff" /><circle cx="16" cy="9" r="2" fill="#fff" /><circle cx="12" cy="16" r="2" fill="#fff" />
  </svg>
);

export function App() {
  const [route, setRoute] = useState(parseHash);
  const [nav, setNav] = useState(0);
  const isHome = !route.lesson;
  const isGame = GAMES.includes(route.lesson);
  const lesson = LESSONS[route.lesson] ?? Object.values(LESSONS)[0];
  const step = Math.min(route.step, lesson.steps.length - 1);
  const s = lesson.steps[step];
  const module = MODULES.find((m) => m.lessons.some((l) => l.id === route.lesson));

  const [done, setDone] = useStored<string[]>("done", []);
  const [queryId, setQueryId] = useState(lesson.demo?.queries[0].id ?? "");
  const [k, setK] = useState(lesson.demo?.defaultK ?? 2);
  const [search, setSearch] = useState(false);
  const [poke, setPoke] = useState<SceneNode | null>(null);

  const story = useRef<HTMLDivElement>(null);
  const secs = useRef<(HTMLElement | null)[]>([]);

  const ctx = useMemo(() => (lesson.demo ? buildCtx(lesson.demo, queryId, k) : undefined), [lesson, queryId, k]);
  const open = useCallback((id: string, i = 0) => { location.hash = id ? `/${id}/${i}` : "/"; }, []);
  const jump = useCallback((i: number) => {
    secs.current[Math.max(0, Math.min(lesson.steps.length - 1, i))]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [lesson]);

  useEffect(() => {
    const on = () => { setRoute(parseHash()); setNav((n) => n + 1); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { if (lesson.demo) { setQueryId(lesson.demo.queries[0].id); setK(lesson.demo.defaultK); } }, [lesson]);
  useEffect(() => { setPoke(null); }, [step, route.lesson]);

  // Bring the routed step into view when arriving from a link, search or reload.
  useEffect(() => {
    if (isHome || isGame) return;
    const el = secs.current[step];
    if (step === 0) story.current?.scrollTo({ top: 0 });
    else requestAnimationFrame(() => el?.scrollIntoView({ block: "center" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, route.lesson]);

  // The reading position drives the active step.
  useEffect(() => {
    if (isHome || isGame || !story.current) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        const i = Number((e.target as HTMLElement).dataset.i);
        history.replaceState(null, "", `#/${lesson.id}/${i}`);
        setRoute({ lesson: lesson.id, step: i });
      }
    }, { root: getComputedStyle(story.current).overflowY === "visible" ? null : story.current, rootMargin: "-38% 0px -56% 0px" });
    secs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [lesson.id, isHome, isGame]);

  const last = !isHome && !isGame && step === lesson.steps.length - 1;
  useEffect(() => { if (last && !done.includes(lesson.id)) setDone([...done, lesson.id]); }, [last, lesson.id, done, setDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((v) => !v); return; }
      const tag = (e.target as HTMLElement).tagName;
      if (search || isHome || isGame || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "j") { e.preventDefault(); jump(step + 1); }
      else if (e.key === "ArrowLeft" || e.key === "k") { e.preventDefault(); jump(step - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, step, search, isHome, isGame]);

  const payload = s.data ?? (ctx ? s.payload?.(ctx) : undefined);
  const nextLesson = READY[READY.findIndex((l) => l.id === lesson.id) + 1];
  const title = isGame ? "Context Packer" : lesson.title;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/"><Logo /><b>Agent Explorer</b></a>
        {!isHome && <nav className="crumb"><a href="#/">Home</a><i>/</i><span>{module?.title}</span><i>/</i><b>{title}</b></nav>}
        <span className="grow" />
        <button className="kbtn" onClick={() => setSearch(true)}><span>Search</span><kbd>⌘K</kbd></button>
      </header>

      {isHome && <main className="page"><Home done={done} onOpen={(id) => open(id)} /></main>}
      {isGame && <main className="page"><ContextPacker /></main>}

      {!isHome && !isGame && (
        <main className="lesson">
          <div className="story" ref={story}>
            <div className="story-head">
              <span className="eyebrow">{module?.num} · {module?.title}</span>
              <h1>{lesson.title}</h1>
              <p className="lede">{lesson.summary}</p>
            </div>
            <div className="progbar">
              <div className="prog" aria-label="Steps">
                {lesson.steps.map((st, i) => (
                  <button key={st.short} className={i === step ? "on" : i < step ? "past" : ""} onClick={() => jump(i)} title={st.short} aria-label={`Step ${i + 1}: ${st.short}`} />
                ))}
              </div>
              <span className="prog-l"><b>{String(step + 1).padStart(2, "0")}</b> / {String(lesson.steps.length).padStart(2, "0")} · {s.short}</span>
            </div>

            {lesson.steps.map((st, i) => (
              <section key={st.short} data-i={i} ref={(el) => { secs.current[i] = el; }} className={i === step ? "chap on" : "chap"} onClick={() => i !== step && jump(i)}>
                <div className="chap-n"><span>{String(i + 1).padStart(2, "0")}</span><i className={`ch ch-${st.chapter}`}>{st.chapter}</i></div>
                <h2>{st.title}</h2>
                {st.body.map((b, j) => <p key={j}><Rich text={b} /></p>)}
                {st.callout && <div className={`callout ${st.callout.kind}`}><b>{st.callout.kind}</b><span><Rich text={st.callout.text} /></span></div>}
                {st.metrics && <div className="metrics">{st.metrics.map((m) => <div key={m.label}><b>{m.value}</b><span>{m.label}</span></div>)}</div>}
              </section>
            ))}

            <div className="story-end">
              <div className="endcard">
                <span className="eyebrow">{done.includes(lesson.id) ? "Lesson complete" : "Almost there"}</span>
                <h3>That's {lesson.title}.</h3>
                <div className="cta">
                  {nextLesson ? <button className="btn primary" onClick={() => open(nextLesson.id)}>Next: {nextLesson.title}<span>→</span></button>
                    : <button className="btn primary" onClick={() => open("context-packer")}>Play Context Packer<span>→</span></button>}
                  <button className="btn" onClick={() => open("")}>Back to the map</button>
                </div>
              </div>
            </div>
          </div>

          <div className="viz">
            <section className="stage">
              <div className="stage-h">
                <span className="fig">Fig. {step + 1}</span><span className="fig-t">{s.short}</span>
                <span className="grow" />
                <span className="hint">Click any component</span>
              </div>
              <Stage lesson={lesson} step={s} poked={poke?.id} onPoke={setPoke} />
              <div className={poke ? "pop on" : "pop"} aria-live="polite">
                {poke && <><i className={`pdot tone-${poke.tone}`} /><b>{poke.label}</b><span>{poke.sub ?? "Part of the pipeline."}</span><button onClick={() => setPoke(null)} aria-label="Close">×</button></>}
              </div>
            </section>

            <div className={s.panel ? "lower two" : "lower"}>
              {s.panel && (
                <section className="pane">
                  <div className="pane-h"><span className="live" />Interactive</div>
                  <div className="pane-b"><PanelView key={`${lesson.id}-${step}`} panel={s.panel} lesson={lesson} ctx={ctx} setK={setK} onQuery={setQueryId} /></div>
                </section>
              )}
              <section className="pane">
                <div className="pane-h">Payload{payload && <small>{payload.title}</small>}</div>
                <div className="pane-b flush">{payload ? <Json data={payload.data} /> : <p className="empty">Nothing is sent over the wire on this step.</p>}</div>
              </section>
            </div>
          </div>
        </main>
      )}

      {search && <Search onClose={() => setSearch(false)} onGo={(l, i) => { setSearch(false); open(l, i); }} />}
    </div>
  );
}
