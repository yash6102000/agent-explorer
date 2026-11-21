import type { Lesson } from "../types";

export const chunking: Lesson = {
  id: "chunking",
  title: "Chunking Strategies",
  summary: "How you split documents decides what retrieval can find.",
  goals: ["Why we search chunks, not documents", "Fixed-size, overlap and structure-aware splitting", "The small-versus-big trade-off", "Parent-child retrieval"],
  nodes: [
    { id: "doc", icon: "docs", label: "Document", sub: "one long text", x: 90, y: 150, tone: "green" },
    { id: "chunker", icon: "chunker", label: "Chunker", sub: "cuts it up", x: 310, y: 150, tone: "green" },
    { id: "embedder", icon: "chip", label: "Embedder", sub: "chunk → vector", x: 520, y: 150, tone: "violet" },
    { id: "index", icon: "rack", label: "Vector index", sub: "one entry per chunk", x: 720, y: 150, tone: "violet" },
  ],
  links: [{ a: "doc", b: "chunker" }, { a: "chunker", b: "embedder" }, { a: "embedder", b: "index" }],
  steps: [
    {
      short: "Why chunk", chapter: "problem", title: "Search finds pieces, not documents",
      body: [
        "A whole handbook is too big to hand to a model. So we cut documents into **chunks** and search those.",
        "One search hit equals one chunk. **How you cut decides what can be found.**",
      ],
      callout: { kind: "insight", text: "A chunk is the unit of retrieval." },
      show: ["doc", "chunker"], focus: ["chunker"], flows: [{ from: "doc", to: "chunker", label: "document" }],
      panel: { kind: "chunking", strategy: "paragraph" },
      data: { title: "Chunker output", data: { strategy: "paragraph", chunks: 3, ids: ["refunds", "shipping", "warranty"] } },
    },
    {
      short: "Fixed size", chapter: "technique", title: "Fixed size: simple and blunt",
      body: [
        "Cut every *N* characters. Predictable and easy, but it slices **straight through sentences**.",
        "Drag the size. Watch the underlined answer get cut in half.",
      ],
      callout: { kind: "warn", text: "Half an answer retrieves badly. The model sees a fragment." },
      show: ["doc", "chunker", "embedder"], focus: ["chunker"], flows: [{ from: "doc", to: "chunker", label: "text" }],
      panel: { kind: "chunking", strategy: "fixed", size: 110, controls: ["size"] },
      data: { title: "Fixed-size chunker", data: { strategy: "fixed", size: 110, overlap: 0, sample: ["Refunds\nCustomers can request a refund within 30 days of purchase. Refunds go to the original paym", "ent method in 5–7 business days. Items must be unused and in original packaging.\n\nShipping…"] } },
    },
    {
      short: "Overlap", chapter: "technique", title: "Overlap: repeat the seam",
      body: [
        "Let neighbouring chunks **share some text**. A sentence cut by one boundary then survives whole in the next chunk.",
        "The price: more chunks to store and search.",
      ],
      callout: { kind: "tip", text: "10–20% overlap is a common starting point." },
      show: ["doc", "chunker", "embedder"], focus: ["chunker"], flows: [{ from: "chunker", to: "embedder", label: "chunks" }],
      panel: { kind: "chunking", strategy: "fixed", size: 110, overlap: 50, controls: ["overlap", "size"] },
      data: { title: "Overlapping chunks", data: { strategy: "fixed", size: 110, overlap: 50, note: "Striped text appears in two chunks." } },
    },
    {
      short: "Structure", chapter: "technique", title: "Respect how the text was written",
      body: [
        "Split on **sentences or paragraphs** instead of raw characters. Ideas stay whole.",
        "Group sentences until you reach a size limit.",
      ],
      show: ["doc", "chunker", "embedder", "index"], focus: ["chunker"], flows: [{ from: "embedder", to: "index", label: "vectors" }],
      panel: { kind: "chunking", strategy: "sentence", size: 220, controls: ["strategy", "size"] },
      data: { title: "Structure-aware chunker", data: { strategy: "sentence", max_chars: 220, rule: "never break inside a sentence" } },
    },
    {
      short: "Trade-off", chapter: "tradeoff", title: "Small is precise. Big has context.",
      body: [
        "**Small chunks** match a question exactly but lose the surrounding story. **Big chunks** keep context but bury the answer in noise and cost more tokens.",
        "Push the slider to both ends.",
      ],
      callout: { kind: "tip", text: "There is no best size. Measure retrieval on your own questions." },
      metrics: [{ label: "Typical range", value: "200–800 tokens" }, { label: "Too small", value: "no context" }, { label: "Too big", value: "noisy" }],
      show: ["doc", "chunker", "embedder", "index"], focus: ["chunker", "index"],
      panel: { kind: "chunking", strategy: "sentence", size: 120, controls: ["size"] },
    },
    {
      short: "Parent-child", chapter: "insight", title: "Search small, answer with big",
      body: [
        "Embed **small** chunks for precise matching, but hand the model the **bigger parent** passage each one came from.",
        "You get precision and context.",
      ],
      show: ["doc", "chunker", "embedder", "index"], focus: ["index"],
      panel: { kind: "cards", cards: [
        { title: "Child chunk", text: "Small, embedded and searched. Matches the question tightly.", tone: "violet" },
        { title: "Parent passage", text: "The larger section it belongs to. This is what the model reads.", tone: "green" },
        { title: "Result", text: "Precise retrieval, full context in the answer.", tone: "orange" },
      ] },
      data: { title: "Parent-child record", data: { child: { id: "c7", text: "Refunds go to the original payment method in 5–7 business days." }, parent: { id: "refunds", text: "Refunds. Customers can request a refund within 30 days… Items must be unused…" } } },
    },
    {
      short: "Recap", chapter: "recap", title: "Chunking in five lines",
      body: ["Pick the simplest strategy that keeps answers whole, then measure."],
      callout: { kind: "next", text: "Next: turn chunks into vectors you can search quickly at scale." },
      show: ["doc", "chunker", "embedder", "index"],
      panel: { kind: "cards", cards: [
        { title: "Fixed size", text: "Simple baseline. Cuts through sentences.", tone: "rose" },
        { title: "+ Overlap", text: "Repairs the seams. Costs extra storage.", tone: "orange" },
        { title: "By structure", text: "Sentences, paragraphs, headings. Keeps ideas whole.", tone: "green" },
        { title: "Semantic", text: "Split where the topic changes, found by comparing neighbouring sentence embeddings.", tone: "violet" },
        { title: "Parent-child", text: "Search small, read big.", tone: "blue" },
      ] },
    },
  ],
};
