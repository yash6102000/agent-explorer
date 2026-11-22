import type { Lesson } from "../types";

export const a2a: Lesson = {
  id: "a2a",
  title: "Agent-to-Agent (A2A)",
  summary: "An open protocol for agents from different teams to work together.",
  goals: ["How A2A differs from MCP", "The Agent Card", "Tasks and their lifecycle", "Messages, artifacts and streaming"],
  nodes: [
    { id: "client", icon: "laptop", label: "Client agent", sub: "your agent", x: 90, y: 150, tone: "blue" },
    { id: "remote", icon: "chip", label: "Remote agent", sub: "another team's agent", x: 400, y: 150, tone: "violet" },
    { id: "tools", icon: "rack", label: "Its own tools", sub: "hidden from you", x: 720, y: 150, tone: "gray" },
  ],
  zones: [
    { label: "Your side", ids: ["client"], tone: "blue" },
    { label: "Their side", sub: "internals stay private", ids: ["remote", "tools"], tone: "violet" },
  ],
  links: [{ a: "client", b: "remote" }, { a: "remote", b: "tools" }],
  steps: [
    {
      short: "Peers", chapter: "problem", title: "Agents built by others need a common language",
      body: [
        "MCP connects an agent to **tools**. But what if the helper you need is itself an agent, built by another team or vendor?",
        "**A2A** (Agent2Agent) is an open protocol that lets agents discover each other and collaborate **without sharing internals**.",
      ],
      callout: { kind: "insight", text: "MCP is agent to tool. A2A is agent to agent." },
      show: ["client", "remote"], focus: ["client", "remote"],
      panel: { kind: "cards", cards: [
        { title: "MCP", text: "Gives an agent tools and data: functions it calls and gets results from.", tone: "green" },
        { title: "A2A", text: "Lets an agent hand a goal to a peer agent that decides how to do it.", tone: "violet" },
        { title: "Subagents", text: "In-process children you control. Same codebase, same trust.", tone: "orange" },
      ] },
    },
    {
      short: "Agent Card", chapter: "solution", title: "The Agent Card says what an agent can do",
      body: [
        "An **Agent Card** is a public description of an agent: its name, skills, where to reach it and how to authenticate.",
        "A client reads the card first, then decides whether this agent is the right one.",
      ],
      show: ["client", "remote"], focus: ["remote"], flows: [{ from: "client", to: "remote", label: "get card" }],
      data: { title: "Agent Card (simplified)", data: { name: "TravelBot", description: "Plans and books trips.", url: "https://agents.example.com/travel", skills: [{ id: "find-flights", description: "Search flights by route and date" }], auth: "OAuth 2.0" } },
    },
    {
      short: "Tasks", chapter: "technique", title: "Work is organised as a task",
      body: [
        "The client sends a message to start a **task**: a unit of work with its own id and state. The remote agent works on it and may take a while.",
        "The client sees only the task state and results. The tools stay hidden.",
      ],
      show: ["client", "remote", "tools"], focus: ["remote", "tools"],
      flows: [{ from: "client", to: "remote", label: "message" }, { from: "remote", to: "tools", label: "its tools" }],
      data: { title: "Start a task (simplified)", data: { jsonrpc: "2.0", method: "message/send", params: { message: { role: "user", parts: [{ text: "Find flights Delhi to Pune on Friday." }] } } } },
    },
    {
      short: "Lifecycle", chapter: "technique", title: "A task moves through states",
      body: [
        "A task is **submitted**, then **working**. It may pause as **input-needed** to ask a question, and ends **completed** or **failed**.",
        "Step through one. Results arrive as **artifacts**: outputs such as a file or a structured answer.",
      ],
      callout: { kind: "tip", text: "Input-needed lets the remote agent ask a clarifying question mid-task." },
      show: ["client", "remote", "tools"], focus: ["remote"],
      panel: { kind: "trace", events: [
        { type: "user", label: "submitted", text: "Client sends: find flights Delhi to Pune on Friday." },
        { type: "agent", label: "working", text: "Remote agent starts searching using its own tools." },
        { type: "warn", label: "input-needed", text: "Remote asks: morning or evening? Task pauses until the client replies." },
        { type: "user", label: "reply", text: "Client answers: morning." },
        { type: "agent", label: "working", text: "Remote agent continues with the answer." },
        { type: "result", label: "completed", text: "Task ends with an artifact: three flight options." },
      ] },
    },
    {
      short: "Streaming", chapter: "insight", title: "Long tasks stream progress updates",
      body: [
        "Some tasks take minutes. The remote agent can **stream** status updates and partial artifacts as it goes, so the client can show progress instead of waiting.",
        "For very long jobs, it can also notify the client when done.",
      ],
      show: ["client", "remote", "tools"], focus: ["client", "remote"], flows: [{ from: "remote", to: "client", label: "updates" }],
      data: { title: "Streamed update (simplified)", data: { task_id: "t-91", status: "working", note: "Checked 2 of 4 airlines.", partial_artifact: "2 options so far" } },
    },
    {
      short: "Recap", chapter: "recap", title: "A2A versus MCP, side by side",
      body: ["Use MCP for tools you call. Use A2A when the other side is an agent that owns its own reasoning."],
      callout: { kind: "next", text: "Next: agents that see a screen and click, in Computer Use." },
      show: ["client", "remote", "tools"],
      panel: { kind: "cards", cards: [
        { title: "MCP", text: "Agent to tool. You call a function, get a result.", tone: "green" },
        { title: "A2A", text: "Agent to peer agent. You hand over a task and track it.", tone: "violet" },
        { title: "Subagent", text: "In-process child you build and trust. No network protocol needed.", tone: "orange" },
        { title: "Combined", text: "A remote agent may use MCP for its own tools behind the scenes.", tone: "blue" },
      ] },
    },
  ],
};
