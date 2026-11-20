function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

export function Json({ data }: { data: unknown }) {
  const html = esc(JSON.stringify(data, null, 2))
    .replace(/^(\s*)"([^"]+)":/gm, '$1<span class="jk">"$2"</span>:')
    .replace(/: ("(?:[^"\\]|\\.)*")(,?)$/gm, ': <span class="js">$1</span>$2')
    .replace(/: (-?\d+(?:\.\d+)?|true|false|null)(,?)$/gm, ': <span class="jn">$1</span>$2');
  return <pre className="json" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Inspector({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="insp">
      {title && <div className="insp-t">{title}</div>}
      <Json data={data} />
    </div>
  );
}
