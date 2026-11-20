export type Tone = "ink" | "green" | "violet" | "orange" | "blue" | "rose" | "gray";

export interface SceneNode {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  x: number; // px in an 800x300 viewBox
  y: number;
  tone: Tone;
}
export interface SceneLink { a: string; b: string }
export interface Flow { from: string; to: string; label?: string }

/** Per-query data for the RAG demo. */
export interface DemoQuery {
  id: string;
  text: string;
  angle: number; // toy 2-D "embedding" direction, degrees
  grounded: string; // answer when retrieval worked
  guess: string; // answer from the bare model
}
export interface DemoChunk {
  id: string;
  source: string;
  text: string;
  angle: number;
  radius: number; // display only; cosine ignores length
}
export interface RagDemo { chunks: DemoChunk[]; queries: DemoQuery[]; defaultK: number }

export interface RagCtx {
  query: DemoQuery;
  k: number;
  ranked: { chunk: DemoChunk; score: number }[];
  top: { chunk: DemoChunk; score: number }[];
}

export type Panel =
  | { kind: "chunks"; vectors?: boolean; highlight?: boolean }
  | { kind: "vectors"; query?: boolean; ranking?: boolean; interactive?: boolean }
  | { kind: "prompt" }
  | { kind: "answer"; grounded: boolean }
  | { kind: "cards"; cards: { title: string; text: string; tone: Tone }[] }
  | { kind: "tokens" }
  | { kind: "window"; turns?: number; interactive?: boolean }
  | { kind: "wordmap" };

export interface Word { id: string; text: string; angle: number; radius: number }

export interface Step {
  short: string;
  chapter: "problem" | "setup" | "solution" | "technique" | "insight" | "tradeoff" | "recap";
  title: string;
  body: string[]; // supports **bold** and `code`
  callout?: { kind: "insight" | "tip" | "warn" | "next"; text: string };
  changes?: string[];
  metrics?: { label: string; value: string }[];
  show: string[]; // node ids introduced so far
  focus?: string[];
  flows?: Flow[];
  panel?: Panel;
  payload?: (ctx: RagCtx) => { title: string; data: unknown } | undefined;
  data?: { title: string; data: unknown }; // static payload for lessons without the RAG demo
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  goals: string[];
  nodes: SceneNode[];
  links: SceneLink[];
  demo?: RagDemo;
  words?: Word[];
  steps: Step[];
}

export interface LessonRef { id: string; title: string; ready?: boolean }
export interface Module { id: string; num: string; title: string; tone: Tone; lessons: LessonRef[] }
