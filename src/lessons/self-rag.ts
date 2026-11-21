import type { Lesson } from "../types";

export const selfRag: Lesson = {
  id: "self-rag",
  title: "Self-RAG & Corrective RAG",
  summary: "Let the system check its own retrieval and try again.",
  goals: ["Why plain RAG trusts bad retrieval", "Deciding whether to retrieve at all", "Grading passages and answers", "Correcting with rewrites, retries and fallbacks"],
  nodes: [
    { id: "query", icon: "laptop", label: "Query", sub: "from the user", x: 90, y: 150, tone: "blue" },
    { id: "retriever", icon: "chip", label: "Retriever", sub: "searches the index", x: 300, y: 70, tone: "violet" },
    { id: "grader", icon: "layers", label: "Grader", sub: "are these relevant?", x: 520, y: 70, tone: "orange" },
    { id: "rewrite", icon: "chunker", label: "Rewrite", sub: "new query or web", x: 410, y: 230, tone: "green" },
    { id: "llm", icon: "tower", label: "LLM", sub: "answers from passages", x: 730, y: 150, tone: "rose" },
  ],
  links: [{ a: "query", b: "retriever" }, { a: "retriever", b: "grader" }, { a: "grader", b: "llm" }, { a: "grader", b: "rewrite" }, { a: "rewrite", b: "retriever" }],
  steps: [
    {
      short: "Blind trust", chapter: "problem", title: "Plain RAG trusts whatever it finds",
      body: [
        "A basic pipeline always retrieves, then always writes an answer from the top results. It never asks whether they are any good.",
        "Weak results in, confident wrong answer out.",
      ],
      callout: { kind: "warn", text: "\"Hi, thanks!\" does not need a search. A bad search should not be trusted." },
      show: ["query", "retriever", "llm"], focus: ["retriever"],
      flows: [{ from: "query", to: "retriever", label: "query" }, { from: "retriever", to: "llm", label: "top-k" }],
      panel: { kind: "cards", cards: [
        { title: "Always retrieves", text: "Even for chit-chat or questions the model already knows.", tone: "orange" },
        { title: "Never checks", text: "Off-topic passages go straight into the prompt.", tone: "rose" },
        { title: "Never retries", text: "One search, one shot, no second chance.", tone: "violet" },
      ] },
    },
    {
      short: "Decide", chapter: "technique", title: "First decide whether to retrieve",
      body: [
        "A quick check asks: does this question need outside documents? Greetings, maths and general knowledge can skip retrieval. Company-specific questions cannot.",
        "This saves a search and keeps irrelevant text out of the prompt.",
      ],
      show: ["query", "retriever", "llm"], focus: ["query"],
      data: { title: "Retrieval decision", data: [{ query: "Thanks, that helps!", retrieve: false, reason: "chit-chat" }, { query: "What is 15% of 80?", retrieve: false, reason: "no documents needed" }, { query: "What is our refund window?", retrieve: true, reason: "company policy" }] },
    },
    {
      short: "Grade", chapter: "technique", title: "Grade each retrieved passage",
      body: [
        "A **grader** (a small model or a prompt) looks at the question and each passage and says relevant or not. Irrelevant ones are dropped before the prompt is built.",
        "Graders are fast, cheap and imperfect. They catch obvious misses.",
      ],
      show: ["query", "retriever", "grader", "llm"], focus: ["grader"],
      flows: [{ from: "retriever", to: "grader", label: "passages" }, { from: "grader", to: "llm", label: "kept" }],
      data: { title: "Grader verdicts", data: { question: "What is our refund window?", verdicts: [{ passage: "Refunds: 30 days from purchase.", relevant: true }, { passage: "Shipping takes 3 to 5 days.", relevant: false }, { passage: "Gift cards cannot be refunded.", relevant: true }], action: "keep 2, drop 1" } },
    },
    {
      short: "Correct", chapter: "technique", title: "If results are weak, correct course",
      body: [
        "When most passages fail, **corrective RAG** acts instead of answering. It can rewrite the query, search again, or fall back to another source such as a web search.",
        "The rewrite loop goes back to the retriever, which is the loop in the diagram.",
      ],
      callout: { kind: "tip", text: "Rewrite example: \"how long do I have\" becomes \"refund window in days\"." },
      show: ["query", "retriever", "grader", "rewrite", "llm"], focus: ["grader", "rewrite"],
      flows: [{ from: "grader", to: "rewrite", label: "weak" }, { from: "rewrite", to: "retriever", label: "new query" }],
      panel: { kind: "cards", cards: [
        { title: "Good", text: "Enough relevant passages. Go ahead and answer.", tone: "green" },
        { title: "Mixed", text: "Keep the good ones, add a second search for the gap.", tone: "orange" },
        { title: "Weak", text: "Rewrite the query, retry, or fall back to web search.", tone: "rose" },
      ] },
    },
    {
      short: "Check answer", chapter: "technique", title: "Then grade the answer too",
      body: [
        "After writing, ask a second question: is every claim **supported** by the passages? An unsupported claim means a hallucination slipped in.",
        "On failure, regenerate with a stricter prompt or admit \"I could not find this\".",
      ],
      show: ["query", "retriever", "grader", "rewrite", "llm"], focus: ["llm", "grader"],
      data: { title: "Answer check", data: { answer: "Refunds take 30 days and include shipping costs.", claims: [{ text: "Refunds take 30 days", supported: true }, { text: "Includes shipping costs", supported: false }], verdict: "regenerate without the unsupported claim" } },
    },
    {
      short: "Cost", chapter: "tradeoff", title: "Every check costs a model call",
      body: [
        "Each grader and retry adds a model call and waiting time. A bad question can loop forever if nothing stops it.",
        "Set a **max retries** limit, often one or two. After that, answer with what you have or say you could not find it.",
      ],
      callout: { kind: "insight", text: "Use checks where wrong answers cost more than a slower answer." },
      metrics: [{ label: "Plain RAG", value: "1 model call" }, { label: "With checks", value: "3 or more" }],
      show: ["query", "retriever", "grader", "rewrite", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Cost", text: "More model calls per question, so a higher bill.", tone: "orange" },
        { title: "Latency", text: "Each step and retry adds waiting time.", tone: "violet" },
        { title: "Guardrail", text: "Max retries, then answer or give up. Never loop without a limit.", tone: "green" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Retrieve, check, correct",
      body: [
        "Self-RAG and corrective RAG add judgement around retrieval: decide, grade, correct, verify. Keep the loop short and bounded.",
      ],
      callout: { kind: "next", text: "Next: hand the whole loop to an agent that chooses its own tools." },
      show: ["query", "retriever", "grader", "rewrite", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Decide", text: "Skip retrieval when it is not needed.", tone: "blue" },
        { title: "Grade", text: "Drop irrelevant passages.", tone: "orange" },
        { title: "Correct", text: "Rewrite, retry or fall back.", tone: "green" },
        { title: "Verify", text: "Check the answer against its sources.", tone: "rose" },
      ] },
    },
  ],
};
