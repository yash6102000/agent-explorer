import type { Lesson } from "../types";

export const advancedRetrieval: Lesson = {
  id: "advanced-retrieval",
  title: "Advanced Retrieval",
  summary: "Five upgrades to plain similarity search, each fixing one failure.",
  goals: ["Search small, return big (parent documents)", "Index summaries or questions instead of raw text", "Filter by metadata before searching", "Pick results that are relevant and different (MMR)"],
  nodes: [
    { id: "query", icon: "laptop", label: "Query", sub: "from the user", x: 90, y: 150, tone: "blue" },
    { id: "retriever", icon: "chip", label: "Retriever", sub: "filter + search", x: 310, y: 70, tone: "violet" },
    { id: "index", icon: "rack", label: "Index", sub: "vectors + metadata", x: 310, y: 230, tone: "green" },
    { id: "results", icon: "layers", label: "Results", sub: "passages to read", x: 520, y: 150, tone: "orange" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "query", b: "retriever" }, { a: "retriever", b: "index" }, { a: "retriever", b: "results" }, { a: "index", b: "results" }, { a: "results", b: "llm" }],
  steps: [
    {
      short: "Limits", chapter: "problem", title: "Plain top-k search has blind spots",
      body: [
        "Basic retrieval embeds chunks and returns the **top-k** (the k closest matches). It works, until it doesn't.",
        "Chunks are too small to answer, results repeat each other, or stale and off-limits documents rank first.",
      ],
      callout: { kind: "insight", text: "Each upgrade below fixes one specific failure. Add only what you need." },
      show: ["query", "retriever", "index", "results", "llm"], focus: ["retriever"],
      flows: [{ from: "query", to: "retriever", label: "query" }, { from: "retriever", to: "results", label: "top-k" }],
      panel: { kind: "cards", cards: [
        { title: "Too small", text: "The matching sentence lacks the context needed to answer.", tone: "rose" },
        { title: "Too similar", text: "Five near-duplicates fill the prompt. No new information.", tone: "orange" },
        { title: "Wrong scope", text: "Old, other-product or restricted documents rank high.", tone: "violet" },
      ] },
    },
    {
      short: "Parent", chapter: "technique", title: "Search small, return the parent",
      body: [
        "Small chunks match precisely. Large chunks read well. **Parent-document retrieval** gives you both: embed small child chunks, but return the larger parent they came from.",
      ],
      callout: { kind: "tip", text: "The parent can be a section, a page or the whole document." },
      show: ["query", "retriever", "index", "results", "llm"], focus: ["index", "results"],
      flows: [{ from: "index", to: "results", label: "parent" }],
      data: { title: "Child hit, parent returned", data: { matched_child: { id: "c-412", text: "Refunds take 5 to 7 days." }, returned_parent: { id: "refunds.md#policy", text: "Refund policy: full text of the section, including eligibility, deadlines and exceptions...", tokens: 640 } } },
    },
    {
      short: "Summaries", chapter: "technique", title: "Index a summary, not the raw chunk",
      body: [
        "**Multi-vector indexing** stores extra vectors that point to the same chunk: a short summary, or questions the chunk could answer. At query time, a match on any of them returns the full chunk.",
        "Tables, code and messy text embed badly as-is. A plain-language summary often matches real questions better.",
      ],
      callout: { kind: "insight", text: "An LLM writes the summaries and questions once, at indexing time." },
      show: ["query", "retriever", "index", "results", "llm"], focus: ["index"],
      data: { title: "Several vectors, one chunk", data: { chunk_id: "c-77", raw: "| plan | seats | price |\n| Pro | 10 | $40 |", vectors_pointing_here: [{ kind: "summary", text: "Pricing table: the Pro plan has 10 seats for $40." }, { kind: "question", text: "How much does the Pro plan cost?" }, { kind: "question", text: "How many seats come with Pro?" }] } },
    },
    {
      short: "Filters", chapter: "technique", title: "Filter by metadata before you search",
      body: [
        "Every chunk carries **metadata**: facts about it like date, product or who may read it. A **filter** removes ineligible chunks first, then similarity ranks the rest.",
        "Permissions especially belong here. Never retrieve a document the user cannot see and hope the model hides it.",
      ],
      callout: { kind: "warn", text: "Filter before similarity, not after, or top-k may be left with nothing." },
      show: ["query", "retriever", "index", "results", "llm"], focus: ["retriever", "index"],
      flows: [{ from: "retriever", to: "index", label: "filter+query" }],
      data: { title: "A filtered query request", data: { query: "How do I reset my API key?", filter: { product: "billing-api", version: { gte: "3.0" }, updated_after: "2025-01-01", allowed_groups: { in: ["support", "everyone"] } }, top_k: 5 } },
    },
    {
      short: "MMR", chapter: "technique", title: "Relevant and different: MMR",
      body: [
        "**Maximal marginal relevance (MMR)** picks results one at a time. Each pick must be relevant to the query and unlike what is already chosen.",
        "A weight (often called lambda) trades the two: high favours relevance, low favours variety.",
      ],
      show: ["query", "retriever", "index", "results", "llm"], focus: ["results"],
      panel: { kind: "cards", cards: [
        { title: "Plain top-5", text: "Five paraphrases of the same refund sentence from five copies of the policy.", tone: "rose" },
        { title: "MMR top-5", text: "The refund rule, the exceptions, the contact path, the deadline. Four different angles.", tone: "green" },
      ] },
      data: { title: "MMR scoring (idea)", data: { pick_next: "argmax over candidates of  lambda * sim(query, c)  -  (1 - lambda) * max sim(c, already_picked)", lambda: 0.7 } },
    },
    {
      short: "Context", chapter: "technique", title: "Give each chunk a short label",
      body: [
        "A chunk like \"Revenue grew 3%\" does not say whose revenue or when. **Contextual chunks** prepend a one-line description of the document before embedding.",
        "An LLM can write that line for every chunk at indexing time. The cost is paid once, and matches improve.",
      ],
      callout: { kind: "tip", text: "Put the context in the text you embed and in the text you return." },
      show: ["query", "retriever", "index", "results", "llm"], focus: ["index"],
      data: { title: "Before and after", data: { before: "Revenue grew 3% over the previous quarter.", context_added: "From ACME Corp's Q2 2025 earnings report, section on revenue.", embedded_text: "From ACME Corp's Q2 2025 earnings report, section on revenue. Revenue grew 3% over the previous quarter." } },
    },
    {
      short: "Recap", chapter: "recap", title: "Match the fix to the failure",
      body: [
        "Measure first, then add one upgrade at a time. Most systems need two or three of these, not all five.",
      ],
      callout: { kind: "next", text: "Next: when search finds similar text but misses connections, try Graph RAG." },
      show: ["query", "retriever", "index", "results", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Parent document", text: "Matches are too short to answer from.", tone: "violet" },
        { title: "Multi-vector", text: "Raw text embeds badly: tables, code, jargon.", tone: "blue" },
        { title: "Metadata filter", text: "Wrong date, product or permissions.", tone: "green" },
        { title: "MMR", text: "Results repeat each other.", tone: "orange" },
        { title: "Contextual chunks", text: "Chunks lose meaning without their document.", tone: "rose" },
      ] },
    },
  ],
};
