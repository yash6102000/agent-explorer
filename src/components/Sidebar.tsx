import { LESSONS, MODULES } from "../lessons";

interface Props {
  current: string; step: number; done: string[]; open: boolean;
  onPick: (id: string) => void; onStep: (i: number) => void; onClose: () => void;
}

export function Sidebar({ current, step, done, open, onPick, onStep, onClose }: Props) {
  const total = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const ready = MODULES.reduce((a, m) => a + m.lessons.filter((l) => l.ready).length, 0);
  return (
    <nav className={open ? "sidebar open" : "sidebar"} aria-label="Lessons" aria-hidden={!open}>
      <div className="side-top">
        <span className="side-meta">{ready}/{total} lessons ready · {done.length} done</span>
        <button className="ibtn sm" onClick={onClose} aria-label="Close sidebar">‹</button>
      </div>
      {MODULES.map((m) => (
        <div key={m.id} className="mod">
          <div className={`mod-h tone-${m.tone}`}><span>{m.num}</span>{m.title}</div>
          {m.lessons.map((l) => (
            <div key={l.id}>
              <button disabled={!l.ready} onClick={() => onPick(l.id)} className={`les${l.id === current ? " cur" : ""}`} aria-current={l.id === current}>
                <span className="tick">{done.includes(l.id) ? "✓" : ""}</span>
                {l.title}
                {!l.ready && <small>soon</small>}
              </button>
              {l.id === current && LESSONS[l.id] && (
                <ol className="steps">
                  {LESSONS[l.id].steps.map((st, i) => (
                    <li key={st.short}>
                      <button className={i === step ? "st cur" : i < step ? "st past" : "st"} onClick={() => onStep(i)}>
                        <i>{i < step ? "✓" : i + 1}</i>{st.short}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
