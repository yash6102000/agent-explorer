import type { Lesson } from "../types";

export const memory: Lesson = {
  id: "memory",
  title: "Memory & Compaction",
  summary: "Models forget everything. Memory is what your app puts back.",
  goals: ["Why a model has no memory of its own", "Compaction: summarising old turns", "Notes and long-term stores", "What not to remember"],
  nodes: [
    { id: "window", icon: "layers", label: "Context window", sub: "short-term memory", x: 90, y: 150, tone: "orange" },
    { id: "summariser", icon: "chip", label: "Summariser", sub: "shrinks old turns", x: 310, y: 150, tone: "violet" },
    { id: "notes", icon: "docs", label: "Notes file", sub: "agent writes it", x: 520, y: 150, tone: "green" },
    { id: "store", icon: "rack", label: "Memory store", sub: "long-term, searchable", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "window", b: "summariser" }, { a: "summariser", b: "notes" }, { a: "notes", b: "store" }, { a: "summariser", b: "store" }],
  steps: [
    {
      short: "No memory", chapter: "problem", title: "The model forgets everything between calls",
      body: [
        "A model keeps nothing from one request to the next. **Memory** is whatever your app puts back into the prompt each time.",
        "A chat that seems to remember you is just resending the history.",
      ],
      callout: { kind: "insight", text: "Memory is an app feature, not a model feature." },
      show: ["window"], focus: ["window"],
      data: { title: "Two separate calls (simplified)", data: { call_1: { user: "My name is Priya." }, call_2: { user: "What is my name?", answer: "I don't know your name." } } },
    },
    {
      short: "Short-term", chapter: "setup", title: "Short-term memory is the context window",
      body: [
        "The current conversation and every tool result sit in the window. That is **short-term memory**: instant to use, but limited in size.",
        "Tool results add up fast. See Tokens & the Context Window for how the limit works.",
      ],
      callout: { kind: "tip", text: "Agents fill windows quicker than chats because tool results are often long." },
      show: ["window"], focus: ["window"],
      panel: { kind: "window", turns: 8, interactive: true },
    },
    {
      short: "Compaction", chapter: "solution", title: "Compaction: summarise old turns when full",
      body: [
        "When the window nears its limit, the app asks a model to **compact** the history: replace old turns with a short summary and keep going.",
        "Recent turns usually stay word for word. Older ones become a paragraph.",
      ],
      show: ["window", "summariser"], focus: ["summariser"], flows: [{ from: "window", to: "summariser", label: "old turns" }, { from: "summariser", to: "window", label: "summary" }],
      panel: { kind: "trace", events: [
        { type: "agent", label: "window 90% full", text: "Context is nearly full after 40 turns and many tool results." },
        { type: "tool", label: "summarise", text: "Older turns are sent to a model with 'summarise what matters for the task'." },
        { type: "result", label: "summary", text: "Goal, decisions made, files changed and open questions, in a few hundred tokens." },
        { type: "agent", label: "continue", text: "The summary replaces the old turns. Work continues in a roomy window." },
      ] },
      data: { title: "Compacted history (simplified)", data: { before_tokens: "many thousands", after: [{ role: "summary", text: "Goal: fix login bug. Found cause in auth.ts. Tests still failing." }, { role: "user", text: "(latest turns kept as is)" }] } },
    },
    {
      short: "What's lost", chapter: "tradeoff", title: "Summaries lose details first",
      body: [
        "A summary keeps the gist: goals, decisions, open problems. It drops **exact numbers, wording, error text and dead ends**, because they look minor.",
        "Those are often what you need later. Compaction is lossy, so pin must-keep facts.",
      ],
      callout: { kind: "warn", text: "After compaction, the model may confidently misremember a figure it no longer sees." },
      show: ["window", "summariser"], focus: ["summariser"],
      panel: { kind: "cards", cards: [
        { title: "Usually kept", text: "Goal, decisions, what is done, what is left to do.", tone: "green" },
        { title: "Often lost", text: "Exact figures, error messages, file paths, user wording.", tone: "rose" },
        { title: "Fix", text: "Tell the summariser what to keep, and write key facts to notes.", tone: "violet" },
      ] },
    },
    {
      short: "Notes", chapter: "technique", title: "Scratchpad: the agent writes notes to files",
      body: [
        "Instead of trusting a summary, the agent can write a **scratchpad**: a notes or to-do file outside the window. It reads the file back when needed.",
        "Notes survive compaction, and even a fresh session.",
      ],
      show: ["window", "summariser", "notes"], focus: ["notes"], flows: [{ from: "window", to: "notes", label: "write" }, { from: "notes", to: "window", label: "read back" }],
      panel: { kind: "trace", events: [
        { type: "user", text: "Migrate 30 files to the new API." },
        { type: "tool", label: "write_file", text: "Creates NOTES.md: plan, files done, files left, decisions so far." },
        { type: "agent", label: "compaction", text: "Context fills up and old turns are summarised away." },
        { type: "tool", label: "read_file", text: "Reads NOTES.md and sees exactly which files remain." },
        { type: "result", text: "Work resumes at file 14 with the exact decisions intact." },
      ] },
    },
    {
      short: "Long-term", chapter: "technique", title: "Long-term memory: save facts, retrieve later",
      body: [
        "A **memory store** keeps facts across sessions, such as 'prefers metric units'. Later, the app searches it and puts the matches into the prompt.",
        "That is RAG over your own past sessions, with the agent deciding what to save.",
      ],
      callout: { kind: "tip", text: "Save short, self-contained facts with a date. Not whole transcripts." },
      show: ["window", "summariser", "notes", "store"], focus: ["store"], flows: [{ from: "summariser", to: "store", label: "save fact" }, { from: "store", to: "window", label: "retrieve" }],
      data: { title: "A stored memory (simplified)", data: { id: "m42", text: "User prefers metric units and short answers.", saved: "2026-03-02", source: "session 17", tags: ["preference"] } },
    },
    {
      short: "Forget", chapter: "insight", title: "What not to remember, and when to forget",
      body: [
        "Never store **secrets** such as passwords or keys, and be careful with personal data. Stored memory can leak into prompts, logs and other sessions.",
        "Facts also go **stale**. Date them, update them, and delete what is wrong or no longer needed.",
      ],
      callout: { kind: "next", text: "Next: when one agent's window is not enough, split work across subagents." },
      show: ["window", "summariser", "notes", "store"],
      panel: { kind: "cards", cards: [
        { title: "Do not store", text: "Passwords, API keys, tokens, and data the user did not expect to be kept.", tone: "rose" },
        { title: "Goes stale", text: "'Project uses v2' stops being true. Date facts and recheck them.", tone: "orange" },
        { title: "Let users see it", text: "Offer a way to view, edit and delete what is remembered.", tone: "green" },
        { title: "Forget on purpose", text: "Expire old items. A smaller store retrieves more accurately.", tone: "blue" },
      ] },
    },
  ],
};
