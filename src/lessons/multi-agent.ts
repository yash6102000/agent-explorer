import type { Lesson } from "../types";

export const multiAgent: Lesson = {
  id: "multi-agent",
  title: "Subagents & Multi-Agent Patterns",
  summary: "Split work across agents with separate context, and know the costs.",
  goals: ["Why separate context windows help", "What a subagent is", "Orchestrator, handoff and review patterns", "When one agent is enough"],
  nodes: [
    { id: "orch", icon: "laptop", label: "Orchestrator", sub: "plans and delegates", x: 90, y: 150, tone: "ink" },
    { id: "w1", icon: "chip", label: "Worker A", sub: "own context + tools", x: 400, y: 80, tone: "violet" },
    { id: "w2", icon: "chip", label: "Worker B", sub: "own context + tools", x: 400, y: 220, tone: "blue" },
    { id: "merge", icon: "docs", label: "Merged result", sub: "short summaries", x: 720, y: 150, tone: "green" },
  ],
  links: [{ a: "orch", b: "w1" }, { a: "orch", b: "w2" }, { a: "w1", b: "merge" }, { a: "w2", b: "merge" }],
  steps: [
    {
      short: "Why split", chapter: "problem", title: "One agent's window gets crowded",
      body: [
        "A big task means reading many files and pages. All of it lands in one context window, which fills with detail the agent no longer needs.",
        "Splitting the work gives each part its own window.",
      ],
      callout: { kind: "insight", text: "A separate window is the main reason to use a second agent." },
      show: ["orch"], focus: ["orch"],
      data: { title: "Context after reading 40 files (illustrative)", data: { one_agent: { context: "everything it read", crowded: true }, with_subagents: { parent: "only short summaries", each_child: "its own files, then discarded" } } },
    },
    {
      short: "Subagent", chapter: "solution", title: "A subagent explores and returns a summary",
      body: [
        "A **subagent** is a child agent a parent hands a task to. It has its own context and tools, does the digging, and returns a **short result**.",
        "The parent never sees the 40 pages the child read. See The Agent Loop for what each agent runs inside.",
      ],
      show: ["orch", "w1"], focus: ["w1"], flows: [{ from: "orch", to: "w1", label: "task" }, { from: "w1", to: "orch", label: "summary" }],
      data: { title: "Delegation (simplified)", data: { task: "Find where login tokens are validated.", child_reads: "about 30 files", returns: "Validation lives in auth/verify.ts, line 88. Expiry is checked there." } },
    },
    {
      short: "Orchestrate", chapter: "technique", title: "Orchestrator-worker: delegate, then merge",
      body: [
        "In the **orchestrator-worker** pattern, a lead agent splits a goal into parts, sends them to workers, then merges the replies into one answer.",
        "Independent parts can run **in parallel**, which saves time.",
      ],
      show: ["orch", "w1", "w2", "merge"], focus: ["orch", "merge"],
      flows: [{ from: "orch", to: "w1", label: "part 1" }, { from: "orch", to: "w2", label: "part 2" }, { from: "w1", to: "merge", label: "result" }, { from: "w2", to: "merge", label: "result" }],
      panel: { kind: "trace", events: [
        { type: "user", text: "Compare our pricing page with two competitors." },
        { type: "think", label: "orchestrator", text: "Two independent lookups. Send one worker to each, in parallel." },
        { type: "agent", label: "worker A", text: "Reads competitor 1 and returns three bullet points." },
        { type: "agent", label: "worker B", text: "Reads competitor 2 and returns three bullet points." },
        { type: "result", label: "merge", text: "The orchestrator combines both summaries into one comparison table." },
      ] },
    },
    {
      short: "Patterns", chapter: "technique", title: "Three common ways to arrange agents",
      body: [
        "Besides delegation, agents can **hand off** control, or **check** each other. Each pattern solves a different problem.",
        "Specialising agents, with their own prompt and tools, can also make each one more focused.",
      ],
      show: ["orch", "w1", "w2", "merge"],
      panel: { kind: "cards", cards: [
        { title: "Orchestrator-worker", text: "A lead splits the task, workers do parts, the lead merges.", tone: "violet" },
        { title: "Handoff", text: "Control passes to another agent, such as billing to a refunds specialist.", tone: "blue" },
        { title: "Debate / review", text: "One agent drafts, another critiques. Good for code and facts.", tone: "orange" },
      ] },
    },
    {
      short: "Costs", chapter: "tradeoff", title: "The costs of many agents",
      body: [
        "Every agent has its own loop, so total **tokens and latency usually go up**. Debugging is harder: a bad answer could start in any agent.",
        "Errors **compound**: a wrong summary becomes the next agent's truth. Agents can also disagree.",
      ],
      callout: { kind: "warn", text: "Summaries are lossy. A subagent's mistake reaches the parent as a confident one-liner." },
      show: ["orch", "w1", "w2", "merge"], focus: ["merge"],
      panel: { kind: "trace", events: [
        { type: "agent", label: "worker A", text: "Reports the refund window is 30 days, from an outdated page." },
        { type: "agent", label: "worker B", text: "Reports the refund window is 14 days, from the current policy." },
        { type: "warn", label: "conflict", text: "The orchestrator sees two answers and cannot see either source." },
        { type: "think", label: "orchestrator", text: "It must ask for sources, or pick one and risk being wrong." },
      ] },
    },
    {
      short: "Enough?", chapter: "insight", title: "Often, one agent is enough",
      body: [
        "Start with a single agent and good tools. Add more only when you hit a real limit: too much context, truly parallel work, or a need for an independent check.",
        "More agents are not a smarter design by default.",
      ],
      callout: { kind: "tip", text: "If you cannot name the problem a second agent solves, you probably do not need it." },
      show: ["orch", "w1", "w2", "merge"],
      panel: { kind: "cards", cards: [
        { title: "Use one agent", text: "Small tasks, tight sequential steps, simple tools, low budget.", tone: "green" },
        { title: "Use several", text: "Large reading jobs, parallel research, independent review.", tone: "violet" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Subagents in four lines",
      body: ["Separate windows keep detail out of the parent. Pick a pattern, expect extra cost, and start simple."],
      callout: { kind: "next", text: "Next: how agents built by different teams find and talk to each other." },
      show: ["orch", "w1", "w2", "merge"],
      panel: { kind: "cards", cards: [
        { title: "Subagent", text: "Child with its own context and tools. Returns a short result.", tone: "violet" },
        { title: "Patterns", text: "Orchestrator-worker, handoff, debate or review.", tone: "blue" },
        { title: "Costs", text: "More tokens, harder debugging, errors that compound.", tone: "rose" },
        { title: "Default", text: "One agent until a real limit says otherwise.", tone: "green" },
      ] },
    },
  ],
};
