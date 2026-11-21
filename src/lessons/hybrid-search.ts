import type { Lesson } from "../types";

const keywordItems = [
  { id: "e4021", text: "Error E4021: card issuer declined the transaction" },
  { id: "codes", text: "Error code index: E4000 to E4099 (payments)" },
  { id: "email", text: "Payment failed email: what each notice means" },
  { id: "methods", text: "Payment methods we accept" },
];
const vectorItems = [
  { id: "trouble", text: "Troubleshooting a failed payment" },
  { id: "email", text: "Payment failed email: what each notice means" },
  { id: "declined", text: "Why was my card declined?" },
  { id: "methods", text: "Payment methods we accept" },
  { id: "e4021", text: "Error E4021: card issuer declined the transaction" },
];

export const hybridSearch: Lesson = {
  id: "hybrid-search",
  title: "Hybrid Search",
  summary: "Combine keyword and vector search so you get exact terms and meaning.",
  goals: ["What keyword search does well", "What vector search does well", "Why each one misses things", "Merging rankings with reciprocal rank fusion"],
  nodes: [
    { id: "query", icon: "laptop", label: "Query", sub: "exact code + meaning", x: 90, y: 150, tone: "blue" },
    { id: "keyword", icon: "docs", label: "Keyword index", sub: "BM25, exact words", x: 340, y: 60, tone: "orange" },
    { id: "vector", icon: "rack", label: "Vector index", sub: "meaning", x: 340, y: 250, tone: "violet" },
    { id: "fusion", icon: "layers", label: "Fusion", sub: "merge two rankings", x: 560, y: 150, tone: "green" },
    { id: "results", icon: "chip", label: "Results", sub: "one ranked list", x: 740, y: 150, tone: "ink" },
  ],
  links: [{ a: "query", b: "keyword" }, { a: "query", b: "vector" }, { a: "keyword", b: "fusion" }, { a: "vector", b: "fusion" }, { a: "fusion", b: "results" }],
  steps: [
    {
      short: "Keyword", chapter: "problem", title: "Keyword search nails exact terms",
      body: [
        "**Keyword search** (often **BM25**, a scoring formula that rewards rare words that appear often in a document) matches the literal words in the query.",
        "It is great for names, codes and IDs. It misses paraphrases: \"refund\" will not find \"money back\".",
      ],
      callout: { kind: "insight", text: "Exact strings like E4021 are keyword search's home turf." },
      show: ["query", "keyword"], focus: ["keyword"], flows: [{ from: "query", to: "keyword", label: "words" }],
      data: { title: "Keyword results", data: { query: "error E4021 payment failed", ranked: ["Error E4021: card issuer declined the transaction", "Error code index: E4000 to E4099", "Payment failed email"] } },
    },
    {
      short: "Vector", chapter: "problem", title: "Vector search gets meaning, not strings",
      body: [
        "**Vector search** compares embeddings, so it finds text with a similar meaning even with different words.",
        "But a code like E4021 is just an odd token to it. The exact-match document can slip down the list.",
      ],
      callout: { kind: "warn", text: "Error codes, SKUs and rare names are a common vector blind spot." },
      show: ["query", "keyword", "vector"], focus: ["vector"], flows: [{ from: "query", to: "vector", label: "embedding" }],
      data: { title: "Vector results", data: { query: "error E4021 payment failed", ranked: ["Troubleshooting a failed payment", "Payment failed email", "Why was my card declined?", "Payment methods we accept", "Error E4021: card issuer declined the transaction"] } },
    },
    {
      short: "Combine", chapter: "solution", title: "Run both, then merge",
      body: [
        "**Hybrid search** runs keyword and vector search side by side, then merges the two ranked lists into one.",
        "Each search covers the other's weak spot.",
      ],
      show: ["query", "keyword", "vector", "fusion", "results"], focus: ["fusion"],
      flows: [{ from: "keyword", to: "fusion", label: "list A" }, { from: "vector", to: "fusion", label: "list B" }],
      panel: { kind: "cards", cards: [
        { title: "Keyword", text: "Exact terms, codes, names. Misses paraphrases.", tone: "orange" },
        { title: "Vector", text: "Meaning and paraphrases. Can miss exact strings.", tone: "violet" },
        { title: "Hybrid", text: "Run both and merge. Fewer blind spots.", tone: "green" },
      ] },
    },
    {
      short: "RRF", chapter: "technique", title: "Merge by rank, not score",
      body: [
        "BM25 scores and cosine similarities live on different scales, so you cannot add them. **Reciprocal rank fusion (RRF)** ignores scores and uses only rank.",
        "Each list gives a document `1 / (k + rank)`. Add the points from both lists. `k` (often 60) softens the gap between ranks.",
      ],
      callout: { kind: "tip", text: "Documents ranked well in both lists rise to the top." },
      show: ["query", "keyword", "vector", "fusion", "results"], focus: ["fusion"],
      panel: { kind: "fusion", a: { label: "Keyword (BM25)", items: keywordItems }, b: { label: "Vector", items: vectorItems }, k: 60 },
      data: { title: "RRF formula", data: { score: "sum over lists of 1 / (k + rank)", k: 60, example: "rank 1 in one list, rank 5 in the other: 1/61 + 1/65" } },
    },
    {
      short: "Try it", chapter: "insight", title: "Both kinds of evidence survive",
      body: [
        "Try a small `k` and a large one. The fused list keeps the exact E4021 page **and** the general troubleshooting pages that only vector search liked.",
        "No score tuning needed. That is why RRF is a popular default.",
      ],
      callout: { kind: "insight", text: "Neither list alone had the full picture. The merge does." },
      show: ["query", "keyword", "vector", "fusion", "results"], focus: ["results"], flows: [{ from: "fusion", to: "results", label: "fused" }],
      panel: { kind: "fusion", a: { label: "Keyword (BM25)", items: keywordItems }, b: { label: "Vector", items: vectorItems }, k: 10 },
      data: { title: "Fused ranking", data: { top: ["Payment failed email: what each notice means", "Error E4021: card issuer declined the transaction", "Payment methods we accept", "Troubleshooting a failed payment"], method: "RRF" } },
    },
    {
      short: "Recap", chapter: "recap", title: "Hybrid search in short",
      body: ["Use hybrid when users search with both ideas and exact terms."],
      callout: { kind: "next", text: "Next: reranking, a slower second pass that sorts the merged list more carefully." },
      show: ["query", "keyword", "vector", "fusion", "results"],
      panel: { kind: "cards", cards: [
        { title: "Keyword (BM25)", text: "Exact words, codes, names.", tone: "orange" },
        { title: "Vector", text: "Meaning and paraphrases.", tone: "violet" },
        { title: "RRF", text: "Merge by rank. No score normalisation.", tone: "green" },
      ] },
    },
  ],
};
