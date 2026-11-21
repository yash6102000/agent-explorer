import type { Lesson } from "../types";

export const aiArchitectures: Lesson = {
  id: "ai-architectures",
  title: "AI Architectures at a Glance",
  summary: "LLM call, RAG, agent, multi-agent: what each adds and costs.",
  goals: ["The four common shapes of an AI app", "What each one adds to the last", "Cost, latency and risk trade-offs", "How to pick the simplest one that works"],
  nodes: [
    { id: "user", icon: "laptop", label: "User", sub: "asks something", x: 90, y: 60, tone: "blue" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 400, y: 60, tone: "rose" },
    { id: "docs", icon: "docs", label: "Retriever + docs", sub: "finds passages", x: 710, y: 60, tone: "green" },
    { id: "tools", icon: "chip", label: "Tools", sub: "search, code, APIs", x: 710, y: 160, tone: "violet" },
    { id: "memory", icon: "layers", label: "Memory", sub: "history, notes", x: 90, y: 160, tone: "orange" },
    { id: "workers", icon: "rack", label: "Specialist agents", sub: "research, code, review", x: 400, y: 250, tone: "gray" },
  ],
  links: [
    { a: "user", b: "llm" }, { a: "llm", b: "docs" }, { a: "llm", b: "tools" },
    { a: "llm", b: "memory" }, { a: "llm", b: "workers" },
  ],
  steps: [
    {
      short: "LLM call", chapter: "setup", title: "1. A bare LLM call",
      body: [
        "The simplest app: send a prompt, get text back. One call, no extras. Good for drafting, rewriting, classifying and summarising text you supply.",
      ],
      callout: { kind: "tip", text: "Many useful products are only this. It is the baseline for everything else." },
      show: ["user", "llm"], focus: ["llm"],
      flows: [{ from: "user", to: "llm", label: "prompt" }, { from: "llm", to: "user", label: "answer" }],
      data: { title: "One request", data: { messages: [{ role: "user", content: "Rewrite this email to sound friendlier." }], calls: 1 } },
    },
    {
      short: "RAG", chapter: "solution", title: "2. RAG adds retrieval",
      body: [
        "**RAG** (retrieval-augmented generation) first searches your documents, then puts the best passages in the prompt. The model answers from them.",
        "It adds knowledge the model never saw: private or fresh data.",
      ],
      show: ["user", "llm", "docs"], focus: ["docs"],
      flows: [{ from: "llm", to: "docs", label: "query" }, { from: "docs", to: "llm", label: "passages" }],
      data: { title: "Prompt after retrieval", data: { question: "What is our refund window?", context: ["[refunds.md] Refunds within 30 days."], calls: 1, searches: 1 } },
    },
    {
      short: "Agent", chapter: "solution", title: "3. An agent adds tools and a loop",
      body: [
        "An **agent** lets the model choose actions: call a tool, read the result, decide the next move, and repeat until done. It also keeps **memory** of what happened so far.",
        "The model now steers. The code just runs the loop.",
      ],
      callout: { kind: "insight", text: "Tools let it act. The loop lets it adapt. Memory lets it continue." },
      show: ["user", "llm", "docs", "tools", "memory"], focus: ["tools", "memory"],
      flows: [{ from: "llm", to: "tools", label: "call tool" }, { from: "tools", to: "llm", label: "result" }, { from: "llm", to: "memory", label: "save" }],
      data: { title: "Agent trace (illustrative)", data: { goal: "Book the cheapest flight", loop: [{ step: 1, action: "search_flights", result: "12 options" }, { step: 2, action: "filter", result: "3 under budget" }, { step: 3, action: "final_answer" }] } },
    },
    {
      short: "Multi-agent", chapter: "solution", title: "4. Multi-agent adds specialists",
      body: [
        "In **multi-agent** systems, an **orchestrator** (a lead model) splits the job and hands pieces to specialist workers, each with its own prompt and tools. It then merges their results.",
        "Useful when tasks are large, parallel or need different skills.",
      ],
      show: ["user", "llm", "docs", "tools", "memory", "workers"], focus: ["llm", "workers"],
      flows: [{ from: "llm", to: "workers", label: "subtasks" }, { from: "workers", to: "llm", label: "results" }],
      data: { title: "Orchestrator plan (illustrative)", data: { orchestrator: "Write a market report", workers: [{ name: "researcher", task: "gather sources" }, { name: "analyst", task: "summarise findings" }, { name: "reviewer", task: "check claims" }] } },
    },
    {
      short: "Compare", chapter: "tradeoff", title: "What each adds, and what it costs",
      body: [
        "Each step up adds capability, but also more model calls, more delay, and more ways to fail.",
      ],
      callout: { kind: "warn", text: "More autonomy means more cost, slower replies and harder debugging." },
      show: ["user", "llm", "docs", "tools", "memory", "workers"],
      panel: { kind: "cards", cards: [
        { title: "LLM call", text: "Adds nothing. Cheapest, fastest, easiest to test. Choose for text tasks.", tone: "rose" },
        { title: "RAG", text: "Adds your data. One search more. Choose when answers live in documents.", tone: "green" },
        { title: "Agent", text: "Adds actions and loops. Many calls, variable latency. Choose for open-ended tasks.", tone: "violet" },
        { title: "Multi-agent", text: "Adds division of labour. Highest cost and risk. Choose for big, parallel work.", tone: "gray" },
      ] },
    },
    {
      short: "Rule", chapter: "recap", title: "Rule of thumb: start simple",
      body: [
        "Start with the **simplest architecture that works**. Move up only when you can show the simpler one fails.",
        "Often a good prompt, then RAG, is enough.",
      ],
      callout: { kind: "next", text: "Next: RAG. Start with \"What is RAG?\" to see how retrieval grounds a model." },
      show: ["user", "llm", "docs", "tools", "memory", "workers"],
      panel: { kind: "cards", cards: [
        { title: "1. Prompt first", text: "Try a plain call with good instructions.", tone: "rose" },
        { title: "2. Missing facts?", text: "Add retrieval.", tone: "green" },
        { title: "3. Needs actions?", text: "Add tools and a loop.", tone: "violet" },
        { title: "4. Too big for one?", text: "Split into specialists.", tone: "gray" },
      ] },
    },
  ],
};
