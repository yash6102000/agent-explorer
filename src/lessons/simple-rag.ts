import type { Lesson } from "../types";
import { vec } from "../lib/rag";

const fmt = (n: number) => Number(n.toFixed(2));

export const simpleRag: Lesson = {
  id: "simple-rag",
  title: "Simple RAG",
  summary: "Make a model answer from your own documents: chunk, embed, retrieve, generate.",
  goals: [
    "Why a bare LLM can't answer from your private data",
    "The two phases: index once, retrieve on every question",
    "How embeddings and similarity pick the right chunks",
    "What the final prompt looks like, and how RAG fails",
  ],
  nodes: [
    { id: "docs", icon: "docs", label: "Documents", sub: "company handbook", x: 70, y: 55, tone: "green" },
    { id: "chunker", icon: "chunker", label: "Chunker", sub: "split into pieces", x: 225, y: 55, tone: "green" },
    { id: "embedder", icon: "chip", label: "Embedding model", sub: "text → numbers", x: 380, y: 150, tone: "violet" },
    { id: "index", icon: "rack", label: "Vector index", sub: "searchable store", x: 540, y: 55, tone: "violet" },
    { id: "user", icon: "laptop", label: "User question", x: 70, y: 245, tone: "blue" },
    { id: "prompt", icon: "layers", label: "Prompt builder", sub: "question + context", x: 540, y: 245, tone: "orange" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 700, y: 150, tone: "rose" },
  ],
  zones: [
    { label: "Indexing", sub: "runs once, ahead of time", ids: ["docs", "chunker", "index"], tone: "green" },
    { label: "Answering", sub: "runs on every question", ids: ["user", "embedder", "prompt", "llm"], tone: "rose" },
  ],
  links: [
    { a: "docs", b: "chunker" },
    { a: "chunker", b: "embedder" },
    { a: "embedder", b: "index" },
    { a: "user", b: "embedder" },
    { a: "index", b: "prompt" },
    { a: "user", b: "prompt" },
    { a: "prompt", b: "llm" },
    { a: "user", b: "llm" },
  ],
  demo: {
    defaultK: 2,
    chunks: [
      { id: "c1", source: "refunds.md", text: "Customers can request a refund within 30 days of purchase. Refunds go to the original payment method in 5–7 business days.", angle: 20, radius: 0.9 },
      { id: "c2", source: "shipping.md", text: "Standard shipping takes 3–5 business days. Express shipping takes 1–2 business days and costs $12.", angle: 110, radius: 0.75 },
      { id: "c3", source: "warranty.md", text: "All hardware has a 1-year limited warranty covering manufacturing defects.", angle: 62, radius: 0.6 },
      { id: "c4", source: "support.md", text: "Support is available Monday to Friday, 9am–6pm CET via chat and email.", angle: 152, radius: 0.95 },
      { id: "c5", source: "account.md", text: "To reset your password, click “Forgot password” on the sign-in page and follow the link we email you.", angle: 200, radius: 0.8 },
      { id: "c6", source: "returns.md", text: "Items must be returned unused in original packaging. Return shipping is free for defective items.", angle: 40, radius: 0.7 },
    ],
    queries: [
      { id: "q1", text: "How long do I have to get a refund?", angle: 24,
        grounded: "You can request a refund within **30 days** of purchase. It goes back to your original payment method in 5–7 business days. [refunds.md]",
        guess: "Most stores offer refunds within 14 days, but it varies. Check your receipt." },
      { id: "q2", text: "When will my order arrive?", angle: 106,
        grounded: "Standard shipping takes **3–5 business days**. Express takes 1–2 business days and costs $12. [shipping.md]",
        guess: "Orders usually arrive in 5–10 days depending on your location." },
      { id: "q3", text: "How do I reset my password?", angle: 196,
        grounded: "On the sign-in page click **“Forgot password”** and follow the link we email you. [account.md]",
        guess: "Go to Settings → Security → Reset password." },
    ],
  },
  steps: [
    {
      short: "The problem", chapter: "problem", title: "A model that doesn't know your business",
      body: [
        "You ask a general LLM about **your company's** refund policy. It has never seen your handbook, so it does what language models do: it writes something plausible.",
        "Pick a question and read the answer. It sounds confident and it is made up. **RAG** (Retrieval-Augmented Generation) fixes this: retrieve the relevant passages, add them to the prompt, and let the model answer from them.",
      ],
      callout: { kind: "warn", text: "A model only knows its training data plus whatever is in the prompt. New to the idea? Start with the lesson “What is RAG?”." },
      show: ["user", "llm"], focus: ["user", "llm"],
      flows: [{ from: "user", to: "llm", label: "question" }],
      panel: { kind: "answer", grounded: false },
      payload: (c) => ({ title: "Request to the model (no documents)", data: { model: "example-model", messages: [{ role: "user", content: c.query.text }] } }),
    },
    {
      short: "1 · Chunk", chapter: "technique", title: "Index, step 1: split into chunks",
      body: [
        "Retrieval needs small pieces. A **chunker** cuts each document into passages of a few sentences, keeping a note of which file each came from.",
        "This happens **once**, ahead of time, not on each question.",
      ],
      callout: { kind: "tip", text: "Chunk size is the first knob you will tune: too big and the match is vague, too small and the answer loses its context." },
      changes: ["+ Chunker", "+ 6 chunks, each tagged with its source file"],
      show: ["user", "llm", "docs", "chunker"], focus: ["chunker"],
      flows: [{ from: "docs", to: "chunker", label: "files" }],
      panel: { kind: "chunks" },
      payload: (_c) => ({ title: "Chunker output (first chunk)", data: { id: "c1", source: "refunds.md", text: "Customers can request a refund within 30 days of purchase. …", tokens: 27 } }),
    },
    {
      short: "2 · Embed & store", chapter: "technique", title: "Index, step 2: embed and store",
      body: [
        "An **embedding model** turns each chunk into a list of numbers, a vector, so that similar meanings get similar vectors. Here we use just **2** numbers so you can draw them; real ones have hundreds or thousands.",
        "The vectors go into a **vector index**, built to answer one question fast: which stored vectors are closest to this one?",
      ],
      callout: { kind: "insight", text: "Chunks and questions must be embedded by the same model, or the numbers are not comparable." },
      changes: ["+ Embedding model", "+ Vector index holding 6 vectors"],
      show: ["user", "llm", "docs", "chunker", "embedder", "index"], focus: ["embedder", "index"],
      flows: [{ from: "chunker", to: "embedder", label: "chunks" }, { from: "embedder", to: "index", label: "vectors" }],
      panel: { kind: "vectors" },
      payload: (c) => { const v = vec(c.ranked.find((r) => r.chunk.id === "c1")!.chunk.angle, 0.9); return { title: "Embedding API (toy, 2-D)", data: { request: { model: "embed-example", input: "Customers can request a refund within 30 days…" }, response: { embedding: [fmt(v[0]), fmt(v[1])], note: "real models return 768–3072 numbers" } } }; },
    },
    {
      short: "3 · Search", chapter: "technique", title: "Query time: embed, then retrieve top-k",
      body: [
        "The question is embedded with the **same model**, so it lands on the same map. The index scores every chunk by **cosine similarity**, the angle between two vectors. A small angle means a score near 1.0.",
        "Keep the best **k** chunks. Try the three questions and change k to see which chunks make the cut.",
      ],
      callout: { kind: "tip", text: "Each question lands next to its answer even with few shared words: “get my money back” finds “refund”." },
      metrics: [{ label: "Chunks scored", value: "6" }],
      show: ["user", "llm", "docs", "chunker", "embedder", "index"], focus: ["user", "embedder", "index"],
      flows: [{ from: "user", to: "embedder", label: "question" }, { from: "embedder", to: "index", label: "search" }],
      panel: { kind: "vectors", query: true, ranking: true, interactive: true },
      payload: (c) => ({ title: "Vector search result", data: { query: c.query.text, k: c.k, hits: c.top.map((t) => ({ id: t.chunk.id, source: t.chunk.source, score: fmt(t.score) })) } }),
    },
    {
      short: "4 · Prompt", chapter: "technique", title: "Stuff the chunks into the prompt",
      body: [
        "Now it is plain prompt writing. The **prompt builder** puts the retrieved chunks first, then the question, with an instruction to answer only from that context.",
        "The model never touches the index. It only sees this text.",
      ],
      callout: { kind: "warn", text: "“Answer only from the context” is what turns a guess into a grounded answer. It also lets the model say “I don't know”." },
      show: ["user", "llm", "docs", "chunker", "embedder", "index", "prompt"], focus: ["prompt"],
      flows: [{ from: "index", to: "prompt", label: "top-k" }, { from: "user", to: "prompt", label: "question" }],
      panel: { kind: "prompt" },
      payload: (c) => ({ title: "Messages sent to the LLM", data: { model: "example-model", system: "Answer using only the context. If it is not there, say you don't know.", messages: [{ role: "user", content: `Context:\n${c.top.map((t) => `[${t.chunk.source}] ${t.chunk.text}`).join("\n")}\n\nQuestion: ${c.query.text}` }] } }),
    },
    {
      short: "5 · Generate", chapter: "solution", title: "The model answers from the evidence",
      body: [
        "With the right passage in front of it, the model writes a short answer and can **cite its source**. Compare this with the guess from step 1.",
      ],
      callout: { kind: "insight", text: "Same model, same question. The only change is what was in the prompt." },
      show: ["user", "llm", "docs", "chunker", "embedder", "index", "prompt"], focus: ["llm"],
      flows: [{ from: "prompt", to: "llm", label: "prompt" }],
      panel: { kind: "answer", grounded: true },
      payload: (c) => ({ title: "Model response", data: { stop_reason: "end_turn", content: [{ type: "text", text: c.query.grounded.replace(/\*\*/g, "") }] } }),
    },
    {
      short: "Failure modes", chapter: "tradeoff", title: "Where simple RAG breaks",
      body: [
        "Most bad RAG answers are **retrieval** problems, not model problems. If the right chunk is not retrieved, the model cannot use it.",
      ],
      callout: { kind: "tip", text: "When debugging, look at the retrieved chunks first. Fixing retrieval fixes most answers." },
      show: ["user", "llm", "docs", "chunker", "embedder", "index", "prompt"],
      panel: { kind: "cards", cards: [
        { title: "Bad chunking", text: "A rule is split across two chunks, or a chunk mixes unrelated topics. The match is vague or half the answer is missing.", tone: "orange" },
        { title: "k too small", text: "With k=1 a question that needs two passages gets only one. Try it in the Search step.", tone: "orange" },
        { title: "k too large", text: "Irrelevant chunks add noise and cost tokens and can distract the model.", tone: "orange" },
        { title: "Nothing relevant exists", text: "Search always returns the nearest chunks, even if none are good. Check the score and tell the model to say “I don't know”.", tone: "rose" },
        { title: "Stale index", text: "The handbook changed but nobody re-embedded it. The model quotes the old policy.", tone: "rose" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "The whole pipeline",
      body: [
        "**Index once:** documents → chunks → embeddings → vector index.",
        "**Every question:** embed question → find top-k → build prompt → generate.",
      ],
      callout: { kind: "next", text: "Next up: Chunking strategies." },
      show: ["user", "llm", "docs", "chunker", "embedder", "index", "prompt"],
      flows: [
        { from: "docs", to: "chunker" }, { from: "chunker", to: "embedder" }, { from: "embedder", to: "index" },
        { from: "user", to: "embedder" }, { from: "index", to: "prompt" }, { from: "prompt", to: "llm" },
      ],
      panel: { kind: "cards", cards: [
        { title: "Index (offline)", text: "Chunk → embed → store. Re-run when documents change.", tone: "green" },
        { title: "Retrieve (online)", text: "Embed the question → nearest k chunks by cosine similarity.", tone: "violet" },
        { title: "Generate (online)", text: "Question + chunks in one prompt → grounded, citable answer.", tone: "rose" },
      ] },
    },
  ],
};
