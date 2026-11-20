/** Toy tokenizer for teaching: greedy longest-match against a small vocabulary.
 *  Real tokenizers (BPE) learn ~100k pieces from data, but behave the same way. */
const VOCAB = new Set([
  "the","a","an","is","are","of","and","to","in","it","for","you","with","on","that","this","be","as","at","by","or","not","can","what","how","why","who",
  "hello","world","model","token","context","window","agent","data","search","answer","question","user","text","word","use","useful","very","more",
  "re","un","in","dis","pre","ret","rie","val","aug","men","ted","gen","era","tion","ing","ed","er","ly","able","ful","ness","ment","ize","ate","al","ous","s",
  "belie","ie","ve","vably","predict","ion","trieval","retrieval","augment","generation","embed","ding","large","language","models","tokens",
]);
const MAX = 12;

function pieces(word: string): string[] {
  const out: string[] = [];
  const w = word.toLowerCase();
  let i = 0;
  while (i < word.length) {
    let n = Math.min(MAX, word.length - i);
    while (n > 1 && !VOCAB.has(w.slice(i, i + n))) n--;
    out.push(word.slice(i, i + n));
    i += n;
  }
  return out;
}

function idOf(t: string): number {
  let h = 2166136261;
  for (const ch of t.toLowerCase()) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return 100 + ((h >>> 0) % 49900);
}

export interface Tok { text: string; id: number }
export function tokenize(input: string): Tok[] {
  const out: Tok[] = [];
  for (const m of input.matchAll(/\s*[A-Za-z]+|\s*\d|\s*[^\sA-Za-z\d]/g)) {
    const piece = m[0];
    const lead = piece.match(/^\s*/)![0];
    const body = piece.slice(lead.length);
    const parts = /[A-Za-z]/.test(body) ? pieces(body) : [body];
    parts.forEach((p, i) => {
      const text = (i === 0 ? lead : "") + p;
      out.push({ text, id: idOf(text) });
    });
  }
  return out;
}
