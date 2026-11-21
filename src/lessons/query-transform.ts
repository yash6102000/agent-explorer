import type { Lesson } from "../types";

export const queryTransform: Lesson = {
  id: "query-transform",
  title: "Query Transformation",
  summary: "Fix the question before searching, so retrieval finds better matches.",
  goals: ["Why raw user questions retrieve badly", "Rewrite, expand and decompose", "Step-back questions", "HyDE: search with a fake answer"],
  nodes: [
    { id: "user", icon: "laptop", label: "User", sub: "vague question", x: 90, y: 150, tone: "blue" },
    { id: "rewriter", icon: "tower", label: "Query rewriter", sub: "small LLM call", x: 310, y: 150, tone: "orange" },
    { id: "retriever", icon: "rack", label: "Retriever", sub: "searches the index", x: 520, y: 150, tone: "violet" },
    { id: "results", icon: "docs", label: "Results", sub: "better chunks", x: 720, y: 150, tone: "green" },
  ],
  links: [{ a: "user", b: "rewriter" }, { a: "rewriter", b: "retriever" }, { a: "retriever", b: "results" }],
  steps: [
    {
      short: "Problem", chapter: "problem", title: "People ask questions badly",
      body: [
        "Real questions are short, vague or packed with several asks. \"What about the other plan?\" means nothing to a search index.",
        "If the **query** (the text you search with) is weak, retrieval is weak, however good your documents are.",
      ],
      callout: { kind: "insight", text: "Retrieval can only match what you give it." },
      show: ["user", "retriever", "results"], focus: ["user"], flows: [{ from: "user", to: "retriever", label: "raw query" }],
      panel: { kind: "cards", cards: [
        { title: "Vague", text: "\"it doesn't work\" has no topic to match.", tone: "rose" },
        { title: "Depends on history", text: "\"and the other one?\" only makes sense with the earlier chat.", tone: "orange" },
        { title: "Multi-part", text: "\"Compare pricing and refund rules\" needs two different searches.", tone: "violet" },
      ] },
      data: { title: "Raw query sent to search", data: { query: "what about the other plan?", top_hit_score: "low", problem: "no topic words" } },
    },
    {
      short: "Idea", chapter: "setup", title: "Add a step before search",
      body: [
        "Put a **query rewriter** in front of the retriever. It is usually one cheap LLM call that turns the user's text into better search queries.",
        "Retrieval then runs on the improved queries instead.",
      ],
      callout: { kind: "tip", text: "Use a small, fast model. This call sits on the critical path." },
      show: ["user", "rewriter", "retriever", "results"], focus: ["rewriter"],
      flows: [{ from: "user", to: "rewriter", label: "question" }, { from: "rewriter", to: "retriever", label: "queries" }],
      data: { title: "Rewriter instruction (sketch)", data: { role: "system", content: "Rewrite the user's last message as a standalone search query. Use the chat history to resolve pronouns. Return only the query." } },
    },
    {
      short: "Rewrite", chapter: "technique", title: "Rewrite: make it stand alone",
      body: [
        "**Rewriting** cleans up the text and fills in what chat history implies. \"It\" becomes the actual thing.",
        "The result should make sense to a stranger with no chat open.",
      ],
      show: ["user", "rewriter", "retriever", "results"], focus: ["rewriter"], flows: [{ from: "rewriter", to: "retriever", label: "standalone" }],
      panel: { kind: "cards", cards: [
        { title: "Before", text: "\"how much is it per month?\" (after chatting about the Pro plan)", tone: "rose" },
        { title: "After", text: "\"Pro plan monthly price\"", tone: "green" },
      ] },
      data: { title: "Rewrite", data: { history: ["Tell me about the Pro plan."], raw: "how much is it per month?", rewritten: "Pro plan monthly price" } },
    },
    {
      short: "Expand", chapter: "technique", title: "Expand: ask in several ways",
      body: [
        "Documents may use different words than the user. **Expansion** adds synonyms or generates several phrasings, then searches with all of them and merges the results.",
        "More phrasings means fewer misses.",
      ],
      callout: { kind: "tip", text: "Merge the result lists, for example with rank fusion." },
      show: ["user", "rewriter", "retriever", "results"], focus: ["rewriter", "retriever"], flows: [{ from: "rewriter", to: "retriever", label: "3 queries" }],
      panel: { kind: "cards", cards: [
        { title: "User wrote", text: "\"cancel subscription\"", tone: "rose" },
        { title: "Variant 1", text: "\"end my membership\"", tone: "violet" },
        { title: "Variant 2", text: "\"stop recurring billing\"", tone: "violet" },
        { title: "Variant 3", text: "\"close account and refund policy\"", tone: "violet" },
      ] },
      data: { title: "Expanded queries", data: { original: "cancel subscription", queries: ["cancel subscription", "end my membership", "stop recurring billing", "how to close my account"] } },
    },
    {
      short: "Decompose", chapter: "technique", title: "Decompose: one search per ask",
      body: [
        "A question with several parts rarely matches one chunk. **Decomposition** splits it into **sub-queries**, searches each, and gives the model all the evidence.",
        "Step-back is the opposite move: first ask a broader question (\"how do refunds work?\") to fetch general background.",
      ],
      callout: { kind: "insight", text: "Decompose for many facts. Step back for missing context." },
      show: ["user", "rewriter", "retriever", "results"], focus: ["rewriter", "results"], flows: [{ from: "rewriter", to: "retriever", label: "sub-queries" }, { from: "retriever", to: "results", label: "merged" }],
      panel: { kind: "cards", cards: [
        { title: "Original", text: "\"Compare Pro and Team pricing, and can I get a refund?\"", tone: "rose" },
        { title: "Sub-query 1", text: "\"Pro plan price\"", tone: "green" },
        { title: "Sub-query 2", text: "\"Team plan price\"", tone: "green" },
        { title: "Sub-query 3", text: "\"refund policy\"", tone: "green" },
        { title: "Step-back", text: "\"How is billing handled?\"", tone: "blue" },
      ] },
      data: { title: "Decomposition", data: { original: "Compare Pro and Team pricing, and can I get a refund?", sub_queries: ["Pro plan price", "Team plan price", "refund policy"], step_back: "How is billing handled?" } },
    },
    {
      short: "HyDE", chapter: "technique", title: "HyDE: search with a fake answer",
      body: [
        "**HyDE** (Hypothetical Document Embeddings) asks the model to write a plausible answer first, then searches with that text. Answers look more like documents than questions do.",
        "The draft can be wrong. Only its wording and topic matter, and it is never shown as fact.",
      ],
      callout: { kind: "warn", text: "A made-up draft can drag search off course on topics the model knows little about." },
      show: ["user", "rewriter", "retriever", "results"], focus: ["rewriter", "retriever"], flows: [{ from: "rewriter", to: "retriever", label: "fake answer" }],
      panel: { kind: "cards", cards: [
        { title: "Question", text: "\"Why is my build slow?\" Short, little to match.", tone: "rose" },
        { title: "Hypothetical answer", text: "\"Slow builds are often caused by missing dependency caching or large unused packages...\"", tone: "orange" },
        { title: "Search with it", text: "The draft shares vocabulary with real troubleshooting docs.", tone: "green" },
      ] },
      data: { title: "HyDE", data: { question: "Why is my build slow?", hypothetical_answer: "Slow builds are often caused by missing dependency caching, large unused packages, or running every test on each commit.", search_text: "hypothetical_answer" } },
    },
    {
      short: "Recap", chapter: "recap", title: "Fix the question, then search",
      body: ["Each technique costs one extra model call and some latency. Add one only when your retrieval fails in that way."],
      callout: { kind: "next", text: "Next: combine keyword and vector search so exact terms are not lost." },
      show: ["user", "rewriter", "retriever", "results"],
      panel: { kind: "cards", cards: [
        { title: "Rewrite", text: "Standalone, clean query. Resolves \"it\".", tone: "green" },
        { title: "Expand", text: "Several phrasings. Fewer vocabulary misses.", tone: "violet" },
        { title: "Decompose", text: "One sub-query per ask.", tone: "orange" },
        { title: "Step-back", text: "Ask the broader question first.", tone: "blue" },
        { title: "HyDE", text: "Search with a drafted answer.", tone: "rose" },
      ] },
    },
  ],
};
