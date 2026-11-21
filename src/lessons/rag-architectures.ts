import type { Lesson } from "../types";

export const ragArchitectures: Lesson = {
  id: "rag-architectures",
  title: "RAG Architectures Compared",
  summary: "A map of RAG designs, from naive to agentic.",
  goals: ["Name the main RAG designs", "What each one adds", "Cost and latency of each", "How to choose without over-building"],
  nodes: [
    { id: "query", icon: "laptop", label: "Query", sub: "from the user", x: 90, y: 70, tone: "blue" },
    { id: "rewriter", icon: "chunker", label: "Rewriter", sub: "cleans the query", x: 90, y: 230, tone: "gray" },
    { id: "retriever", icon: "chip", label: "Retriever", sub: "finds passages", x: 300, y: 70, tone: "violet" },
    { id: "reranker", icon: "layers", label: "Reranker", sub: "reorders results", x: 300, y: 230, tone: "orange" },
    { id: "graph", icon: "rack", label: "Graph / index", sub: "entities, vectors", x: 510, y: 150, tone: "green" },
    { id: "grader", icon: "chip", label: "Grader", sub: "checks the context", x: 720, y: 70, tone: "rose" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 720, y: 230, tone: "ink" },
  ],
  links: [
    { a: "query", b: "retriever" }, { a: "query", b: "rewriter" }, { a: "rewriter", b: "retriever" }, { a: "retriever", b: "reranker" },
    { a: "retriever", b: "graph" }, { a: "reranker", b: "llm" }, { a: "graph", b: "llm" }, { a: "llm", b: "grader" }, { a: "retriever", b: "llm" },
  ],
  steps: [
    {
      short: "Naive", chapter: "setup", title: "Naive RAG: retrieve, stuff, answer",
      body: [
        "**Naive RAG** embeds the question, fetches the top-k similar chunks, pastes them into the prompt and answers. One pass, no checks.",
        "It is simple, fast and often good enough.",
      ],
      callout: { kind: "tip", text: "Every other design starts as a patch for this one." },
      show: ["query", "retriever", "llm"], focus: ["retriever"],
      flows: [{ from: "query", to: "retriever", label: "question" }, { from: "retriever", to: "llm", label: "top-k" }],
      panel: { kind: "cards", cards: [
        { title: "Steps", text: "Embed, search, stuff into prompt, generate.", tone: "blue" },
        { title: "Strength", text: "Cheap, fast, easy to debug.", tone: "green" },
        { title: "Weakness", text: "Vague queries and near-miss chunks go straight to the model.", tone: "rose" },
      ] },
      data: { title: "Naive pipeline", data: { retrieve: { k: 4 }, prompt: "context + question", llm_calls: 1 } },
    },
    {
      short: "Advanced", chapter: "technique", title: "Advanced RAG: fix the inputs and ranking",
      body: [
        "**Advanced RAG** adds steps around retrieval. Rewrite the query, search by meaning and keywords together (**hybrid**), then **rerank** (re-score results with a slower, sharper model).",
        "Same one-shot shape, better chunks reach the model.",
      ],
      show: ["query", "rewriter", "retriever", "reranker", "llm"], focus: ["rewriter", "reranker"],
      flows: [{ from: "query", to: "rewriter", label: "raw" }, { from: "rewriter", to: "retriever", label: "clean" }, { from: "retriever", to: "reranker", label: "top 50" }],
      panel: { kind: "cards", cards: [
        { title: "Query rewrite", text: "\"it still broken?\" becomes a full, searchable question.", tone: "gray" },
        { title: "Hybrid search", text: "Vectors catch meaning, keywords catch exact terms.", tone: "violet" },
        { title: "Rerank", text: "Fetch 50 cheaply, keep the best 5 carefully.", tone: "orange" },
      ] },
      data: { title: "Advanced pipeline", data: { rewrite: "refund window for annual plan", search: "hybrid (vector + keyword)", candidates: 50, rerank_keep: 5, llm_calls: "1 (+1 if rewriting uses an LLM)" } },
    },
    {
      short: "Modular", chapter: "technique", title: "Modular RAG: swap parts, route queries",
      body: [
        "**Modular RAG** treats each stage as a swappable component. A **router** sends each question to the right source: a vector index, a SQL table, or the web.",
        "You pick the parts per question instead of one fixed path.",
      ],
      show: ["query", "rewriter", "retriever", "reranker", "graph", "llm"], focus: ["retriever", "graph"],
      flows: [{ from: "query", to: "retriever", label: "route A" }, { from: "retriever", to: "graph", label: "route B" }],
      panel: { kind: "cards", cards: [
        { title: "Router", text: "Classifies the question and picks a source or skips retrieval.", tone: "blue" },
        { title: "Swappable parts", text: "Change the embedder, reranker or store without a rewrite.", tone: "violet" },
        { title: "Cost", text: "More moving parts to build, test and monitor.", tone: "orange" },
      ] },
      data: { title: "A routing decision", data: { question: "Total sales in March?", route: "sql_database", skipped: ["docs_index", "web"], reason: "numeric aggregate" } },
    },
    {
      short: "Graph", chapter: "technique", title: "Graph RAG: follow relationships",
      body: [
        "**Graph RAG** extracts entities (people, products, places) and the relationships between them into a graph. Questions that hop across several facts follow the edges.",
        "Building and updating the graph is the expensive part.",
      ],
      callout: { kind: "insight", text: "Use it when answers connect many documents, not when one passage holds the answer." },
      show: ["query", "rewriter", "retriever", "reranker", "graph", "llm"], focus: ["graph"],
      flows: [{ from: "retriever", to: "graph", label: "entities" }, { from: "graph", to: "llm", label: "facts" }],
      data: { title: "A multi-hop path", data: { question: "Who manages the team that owns Billing API?", path: ["Billing API", "owned_by", "Payments team", "managed_by", "Dana Lee"], answer: "Dana Lee" } },
    },
    {
      short: "Corrective", chapter: "technique", title: "Self- and Corrective RAG: grade, then retry",
      body: [
        "**Corrective RAG** adds a **grader**: a model that checks whether the retrieved context actually answers the question. If not, it rewrites the query and searches again, or falls back to another source.",
        "**Self-RAG** extends this to checking the answer itself.",
      ],
      show: ["query", "rewriter", "retriever", "reranker", "graph", "grader", "llm"], focus: ["grader"],
      flows: [{ from: "llm", to: "grader", label: "check" }, { from: "grader", to: "retriever", label: "retry" }],
      panel: { kind: "cards", cards: [
        { title: "Grade", text: "Is this context relevant? Is the answer supported by it?", tone: "rose" },
        { title: "Retry", text: "Weak context triggers a new query or a different source.", tone: "orange" },
        { title: "Cost", text: "Extra model calls and extra latency, especially on retries.", tone: "gray" },
      ] },
      data: { title: "A grade-and-retry trace", data: { attempt_1: { query: "reset 2FA", grade: "irrelevant" }, action: "rewrite query", attempt_2: { query: "reset two-factor authentication device", grade: "relevant" } } },
    },
    {
      short: "Agentic", chapter: "technique", title: "Agentic RAG: an agent runs the search",
      body: [
        "In **Agentic RAG** an LLM agent decides which tools to call, reads results, and loops until it has enough. Retrieval becomes one tool among several.",
        "Most flexible, but also the slowest, costliest and hardest to predict.",
      ],
      callout: { kind: "warn", text: "Every loop adds latency and cost. Cap the number of steps." },
      show: ["query", "rewriter", "retriever", "reranker", "graph", "grader", "llm"], focus: ["llm", "retriever", "graph"],
      flows: [{ from: "llm", to: "retriever", label: "tool call" }, { from: "llm", to: "graph", label: "tool call" }],
      data: { title: "An agent trace", data: { step_1: "search_docs('SSO setup')", step_2: "reads result, finds gap", step_3: "query_graph('SSO -> admin roles')", step_4: "enough context, writes answer", llm_calls: 4 } },
    },
    {
      short: "Compare", chapter: "tradeoff", title: "What each design adds and costs",
      body: [
        "Cost and latency usually rise as you move down the list. Choose the cheapest design that fixes your actual failures.",
      ],
      show: ["query", "rewriter", "retriever", "reranker", "graph", "grader", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Naive", text: "Adds: nothing. Cost: lowest. Latency: lowest. Choose: first version, clean docs.", tone: "blue" },
        { title: "Advanced", text: "Adds: rewrite, hybrid, rerank. Cost: low. Latency: small bump. Choose: right chunk exists but ranks low.", tone: "violet" },
        { title: "Modular + Graph", text: "Adds: routing, entity links. Cost: build effort. Choose: many sources or multi-hop questions.", tone: "green" },
        { title: "Corrective + Agentic", text: "Adds: grading, loops, tools. Cost: several LLM calls. Latency: highest. Choose: hard, open-ended questions.", tone: "rose" },
      ] },
    },
    {
      short: "Decide", chapter: "recap", title: "Start naive, measure, add what fixes failures",
      body: [
        "Build naive RAG first and measure where it fails. Add **one** technique that targets that failure, then measure again.",
        "Complexity you cannot justify with a number is a cost, not a feature.",
      ],
      callout: { kind: "next", text: "Next: learn how to measure RAG, so you know what to fix." },
      show: ["query", "rewriter", "retriever", "reranker", "graph", "grader", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Right chunk ranks low", text: "Try hybrid search and a reranker.", tone: "orange" },
        { title: "Answer spans many docs", text: "Try Graph RAG or multi-step retrieval.", tone: "green" },
        { title: "Wrong or weak context", text: "Try grading with a retry or fallback.", tone: "rose" },
      ] },
    },
  ],
};
