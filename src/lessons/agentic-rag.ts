import type { Lesson } from "../types";

export const agenticRag: Lesson = {
  id: "agentic-rag",
  title: "Agentic RAG",
  summary: "An agent decides what to search, where, and when to stop.",
  goals: ["Fixed pipeline vs an agent that uses retrieval as a tool", "How an agent picks sources and searches again", "What a trace looks like", "Trade-offs and guardrails"],
  nodes: [
    { id: "user", icon: "laptop", label: "User", sub: "asks a question", x: 90, y: 150, tone: "blue" },
    { id: "agent", icon: "tower", label: "Agent", sub: "plans, calls tools", x: 330, y: 150, tone: "rose" },
    { id: "memory", icon: "layers", label: "Scratchpad", sub: "notes so far", x: 330, y: 250, tone: "gray" },
    { id: "tools", icon: "rack", label: "Tools", sub: "vector, SQL, web", x: 560, y: 70, tone: "violet" },
    { id: "answer", icon: "docs", label: "Answer", sub: "with sources", x: 730, y: 190, tone: "green" },
  ],
  links: [{ a: "user", b: "agent" }, { a: "agent", b: "tools" }, { a: "agent", b: "memory" }, { a: "agent", b: "answer" }],
  steps: [
    {
      short: "Fixed", chapter: "problem", title: "A fixed pipeline cannot adapt",
      body: [
        "Classic RAG runs the same steps every time: one search, one prompt, one answer.",
        "Some questions need two searches, a database lookup, or a different source. A fixed pipeline cannot choose.",
      ],
      callout: { kind: "insight", text: "Example: \"Compare our Q2 sales to the competitor's launch\" needs two sources." },
      show: ["user", "tools", "answer"], focus: ["tools"],
      flows: [{ from: "user", to: "tools", label: "query" }, { from: "tools", to: "answer", label: "top-k" }],
      panel: { kind: "cards", cards: [
        { title: "One search", text: "Complex questions need several, and the first rarely covers all of it.", tone: "orange" },
        { title: "One source", text: "The answer may sit in a database or on the web, not the docs index.", tone: "violet" },
        { title: "No second look", text: "The pipeline cannot notice the results are not enough.", tone: "rose" },
      ] },
    },
    {
      short: "Tool", chapter: "setup", title: "Make retrieval a tool the agent calls",
      body: [
        "An **agent** is a model in a loop: it decides an action, runs a **tool** (a function it may call), reads the result, then decides again.",
        "Retrieval becomes one tool among several, and the model chooses when to use it.",
      ],
      show: ["user", "agent", "tools", "answer"], focus: ["agent", "tools"],
      flows: [{ from: "agent", to: "tools", label: "call" }, { from: "tools", to: "agent", label: "result" }],
      data: { title: "Tools the agent can call", data: [{ name: "search_docs", args: { query: "string" }, use: "semantic search over the knowledge base" }, { name: "run_sql", args: { sql: "string" }, use: "read-only queries on the sales database" }, { name: "web_search", args: { query: "string" }, use: "fresh public information" }] },
    },
    {
      short: "Trace", chapter: "technique", title: "It searches, reads, and searches again",
      body: [
        "The agent writes its own queries, picks the source per question, and keeps going until it judges it has enough.",
        "A **trace** is the logged list of every step. Read it like a flight recorder.",
      ],
      show: ["user", "agent", "memory", "tools", "answer"], focus: ["agent", "memory"],
      flows: [{ from: "agent", to: "memory", label: "notes" }],
      data: { title: "Example agent trace", data: [{ step: 1, thought: "Need Q2 sales first", tool: "run_sql", result: "Q2 revenue: $4.1M" }, { step: 2, thought: "Now the competitor launch", tool: "web_search", result: "Rival launched on May 12" }, { step: 3, thought: "Check our own launch plan", tool: "search_docs", result: "Our launch: June 3" }, { step: 4, thought: "Enough to answer", tool: null, result: "final answer with 3 sources" }] },
    },
    {
      short: "Compare", chapter: "insight", title: "Pipeline or agent?",
      body: [
        "Neither is better in general. A pipeline is predictable. An agent is flexible. Choose by how varied your questions are.",
      ],
      show: ["user", "agent", "memory", "tools", "answer"], focus: ["agent"],
      panel: { kind: "cards", cards: [
        { title: "Fixed pipeline", text: "Same steps every time. Fast, cheap, easy to test. Struggles with odd questions.", tone: "blue" },
        { title: "Agentic", text: "Plans per question, uses many sources. Slower, costlier, harder to predict.", tone: "rose" },
      ] },
    },
    {
      short: "Trade-offs", chapter: "tradeoff", title: "Flexibility has a price",
      body: [
        "Every loop turn is a model call, so cost and delay grow with the number of steps. Behaviour varies between runs, which makes testing harder.",
        "Agents can also get stuck repeating the same failing search.",
      ],
      callout: { kind: "warn", text: "Start with a pipeline. Move to an agent only when it fails real questions." },
      show: ["user", "agent", "memory", "tools", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Slower", text: "Several model calls and searches before the first word of the answer.", tone: "orange" },
        { title: "Costlier", text: "Tokens for every thought, tool call and result.", tone: "violet" },
        { title: "Harder to test", text: "Different runs can take different paths to the answer.", tone: "rose" },
        { title: "Can loop", text: "Repeats a failing step without a stopping rule.", tone: "gray" },
      ] },
    },
    {
      short: "Guardrails", chapter: "technique", title: "Keep the agent on a leash",
      body: [
        "Set a **step budget**: a hard cap on tool calls, such as eight. Cap total tokens and time too.",
        "Log every step. Limit tools to read-only where you can, and ask for sources in the final answer.",
      ],
      show: ["user", "agent", "memory", "tools", "answer"], focus: ["agent"],
      data: { title: "Agent limits (example)", data: { max_steps: 8, max_tokens: 20000, timeout_seconds: 60, tools: "read-only", log: "every thought, call and result", on_limit: "answer with what is known, or say it could not finish" } },
    },
    {
      short: "Recap", chapter: "recap", title: "Retrieval as a decision",
      body: [
        "Agentic RAG turns retrieval from a fixed step into a choice. The agent picks tools, reads results and retries, within limits you set.",
        "Use a fixed pipeline for the common case and an agent for the hard ones.",
      ],
      callout: { kind: "next", text: "Next: multimodal RAG, for documents full of images and tables." },
      show: ["user", "agent", "memory", "tools", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Tool", text: "Retrieval is one function the agent can call.", tone: "violet" },
        { title: "Loop", text: "Search, read, decide, repeat until enough.", tone: "blue" },
        { title: "Limits", text: "Step budget, logs and read-only tools.", tone: "green" },
      ] },
    },
  ],
};
