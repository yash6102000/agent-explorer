import type { Lesson } from "../types";

const items = [
  { id: "a", text: "Refund policy overview: refund, refund, refund. Refund options and refund FAQs.", first: 0.86, rerank: 0.22 },
  { id: "b", text: "Our refund team is friendly. Contact us about refunds, returns and exchanges.", first: 0.82, rerank: 0.18 },
  { id: "c", text: "Gift card refunds: not allowed. See the gift card terms.", first: 0.78, rerank: 0.31 },
  { id: "d", text: "Refund timing: money returns to your card within 5 to 7 business days after approval.", first: 0.74, rerank: 0.94 },
  { id: "e", text: "To start a refund, open your order and choose Request refund within 30 days.", first: 0.7, rerank: 0.81 },
  { id: "f", text: "Shipping rates and delivery times by region.", first: 0.52, rerank: 0.04 },
];

export const reranking: Lesson = {
  id: "reranking",
  title: "Reranking",
  summary: "Fetch wide with a fast search, then re-score the best candidates carefully.",
  goals: ["Why fast retrieval misses nuance", "How a cross-encoder scores query and passage together", "Retrieve wide, keep few", "The latency trade-off"],
  nodes: [
    { id: "retriever", icon: "rack", label: "Retriever", sub: "fast, top 50", x: 90, y: 150, tone: "violet" },
    { id: "reranker", icon: "chip", label: "Reranker", sub: "cross-encoder", x: 310, y: 150, tone: "orange" },
    { id: "top3", icon: "docs", label: "Top 3", sub: "best passages", x: 520, y: 150, tone: "green" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "retriever", b: "reranker" }, { a: "reranker", b: "top3" }, { a: "top3", b: "llm" }],
  steps: [
    {
      short: "Problem", chapter: "problem", title: "Fast search is a rough sort",
      body: [
        "A vector retriever (a **bi-encoder**) turns the query and each passage into vectors **separately**, then compares them. That is fast, but the two texts never meet.",
        "So subtle matches can sit at rank 15 while a near-miss sits at rank 2.",
      ],
      callout: { kind: "insight", text: "Good recall does not mean good ordering." },
      show: ["retriever"], focus: ["retriever"],
      panel: { kind: "cards", cards: [
        { title: "Query side", text: "Encoded into one vector, alone.", tone: "violet" },
        { title: "Passage side", text: "Encoded earlier, also alone.", tone: "violet" },
        { title: "Compared", text: "Only the two vectors are compared. Nuance can be lost.", tone: "rose" },
      ] },
      data: { title: "First-pass ranking (illustrative)", data: { query: "How long does a refund take?", rank_1: "Refund policy overview: refund, refund, refund...", rank_4: "Refund timing: money returns within 5 to 7 business days" } },
    },
    {
      short: "Idea", chapter: "setup", title: "Fetch wide, then re-score",
      body: [
        "Retrieve many candidates cheaply, for example the top 20 to 50. Then a slower, smarter model re-scores only those.",
        "You get the speed of the first stage and the care of the second.",
      ],
      callout: { kind: "tip", text: "Stage one aims for recall. Stage two aims for precision." },
      show: ["retriever", "reranker"], focus: ["reranker"], flows: [{ from: "retriever", to: "reranker", label: "50 passages" }],
      data: { title: "Two-stage pipeline", data: { stage_1: { model: "bi-encoder", candidates: 50, job: "do not miss the answer" }, stage_2: { model: "cross-encoder", candidates: 50, job: "put the answer first" } } },
    },
    {
      short: "Cross-encoder", chapter: "technique", title: "A reranker reads both together",
      body: [
        "A **reranker** (a **cross-encoder**) reads the query and one passage **in the same pass** and outputs a relevance score. It can see exactly how the passage answers this question.",
        "Toggle below. The buried passage rises and the keyword-stuffed one falls.",
      ],
      callout: { kind: "insight", text: "Repeating \"refund\" fools a retriever. A reranker asks \"does it answer?\"" },
      show: ["retriever", "reranker"], focus: ["reranker"],
      panel: { kind: "rerank", query: "How long does a refund take?", items, keep: 3 },
      data: { title: "Reranker scores (illustrative)", data: { pairs: "(query, passage) -> score between 0 and 1", promoted: "Refund timing: 5 to 7 business days", demoted: "Refund policy overview: refund, refund, refund" } },
    },
    {
      short: "Keep few", chapter: "technique", title: "Keep only the best few",
      body: [
        "After re-scoring, keep just the top few passages. The LLM gets less noise, and less text to pay for.",
        "Fewer, better passages also help with **lost in the middle**: models tend to use facts buried mid-prompt less reliably.",
      ],
      show: ["retriever", "reranker", "top3", "llm"], focus: ["top3", "llm"],
      flows: [{ from: "reranker", to: "top3", label: "keep 3" }, { from: "top3", to: "llm", label: "context" }],
      panel: { kind: "rerank", query: "How long does a refund take?", items, keep: 3 },
      data: { title: "Context sent to the LLM", data: { kept: 3, passages: ["Refund timing: money returns within 5 to 7 business days", "To start a refund, open your order...", "Gift card refunds: not allowed"], dropped: 47 } },
    },
    {
      short: "Cost", chapter: "tradeoff", title: "Better order costs time",
      body: [
        "A cross-encoder runs once **per passage**, not once per search. Scoring 50 passages is far slower than one vector lookup.",
        "So rerank a small candidate set, not the whole index.",
      ],
      callout: { kind: "warn", text: "Reranking adds latency to every query. Measure whether the quality gain is worth it." },
      metrics: [{ label: "Candidates", value: "20-50 typical" }, { label: "Kept", value: "3-5 typical" }, { label: "Extra cost", value: "1 score per passage" }],
      show: ["retriever", "reranker", "top3", "llm"], focus: ["reranker"],
      panel: { kind: "cards", cards: [
        { title: "Too few candidates", text: "The right passage may never reach the reranker.", tone: "rose" },
        { title: "Too many", text: "Slow and costly, with little extra gain.", tone: "orange" },
        { title: "Balance", text: "Wide enough for recall, small enough for speed.", tone: "green" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Reranking in short",
      body: ["Retrieve wide with a fast model, reorder with a careful one, send only the best."],
      callout: { kind: "next", text: "Next: advanced retrieval: parent documents, filters and diverse results." },
      show: ["retriever", "reranker", "top3", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Bi-encoder", text: "Fast. Query and passage encoded apart.", tone: "violet" },
        { title: "Cross-encoder", text: "Slower. Reads both together, scores sharply.", tone: "orange" },
        { title: "Keep few", text: "Less noise, lower cost, fewer buried facts.", tone: "green" },
      ] },
    },
  ],
};
