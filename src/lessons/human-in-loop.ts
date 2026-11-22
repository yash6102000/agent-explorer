import type { Lesson } from "../types";

export const humanInLoop: Lesson = {
  id: "human-in-loop",
  title: "Human in the Loop",
  summary: "Agents act, so decide which actions need a person's approval.",
  goals: ["Sort actions by risk", "Permission modes and checkpoints", "Approval prompts that say what will happen", "Why too many prompts backfire"],
  nodes: [
    { id: "agent", icon: "tower", label: "Agent", sub: "proposes an action", x: 90, y: 150, tone: "rose" },
    { id: "gate", icon: "laptop", label: "Approval gate", sub: "you decide", x: 300, y: 150, tone: "orange" },
    { id: "tool", icon: "chip", label: "Tool", sub: "runs the action", x: 520, y: 150, tone: "violet" },
    { id: "world", icon: "rack", label: "The world", sub: "files, email, money", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "agent", b: "gate" }, { a: "gate", b: "tool" }, { a: "tool", b: "world" }],
  steps: [
    {
      short: "Why", chapter: "problem", title: "Agents act, and mistakes are real",
      body: [
        "A chatbot's mistake is a wrong sentence. An agent's mistake can be a deleted file, a sent email or a payment.",
        "A **human in the loop** means a person approves some actions before they happen.",
      ],
      callout: { kind: "insight", text: "Fluent plans can still be wrong. The gate limits the damage." },
      show: ["agent", "world"], focus: ["world"], flows: [{ from: "agent", to: "world", label: "acts" }],
      data: { title: "Same model, bigger stakes", data: { chatbot_mistake: "wrong answer, you notice", agent_mistake: "wrong email sent to 400 customers" } },
    },
    {
      short: "Risk tiers", chapter: "setup", title: "Sort actions by what they can undo",
      body: [
        "Not every action needs a person. Ask how bad a mistake would be and whether you could reverse it.",
        "Read-only is safe, reversible is cheap to fix, irreversible or costly needs a human.",
      ],
      show: ["agent", "gate", "tool", "world"], focus: ["tool"],
      panel: { kind: "cards", cards: [
        { title: "Read-only", text: "Search, read a file, list events. Nothing changes. Usually auto-allow.", tone: "green" },
        { title: "Reversible", text: "Edit a file in git, create a draft. Can be undone. Often allow with a log.", tone: "blue" },
        { title: "Irreversible", text: "Send email, delete data, deploy. Cannot be taken back. Ask first.", tone: "orange" },
        { title: "Costly", text: "Payments, bulk actions, anything touching other people. Ask, with details.", tone: "rose" },
      ] },
    },
    {
      short: "Modes", chapter: "technique", title: "Three ways to set the gate",
      body: [
        "**Permission modes** decide when the agent must ask. Pick one per task, and per risk level.",
      ],
      callout: { kind: "tip", text: "Start strict. Loosen only for actions you have watched be safe." },
      show: ["agent", "gate", "tool", "world"], focus: ["gate"],
      panel: { kind: "cards", cards: [
        { title: "Ask every time", text: "Safest and slowest. Good for new agents and unfamiliar tasks.", tone: "rose" },
        { title: "Allow-list", text: "Pre-approve a named set of safe actions. Anything else asks.", tone: "orange" },
        { title: "Auto with limits", text: "Runs freely inside a budget, a folder or a sandbox. Stops at the edge.", tone: "green" },
      ] },
    },
    {
      short: "Checkpoints", chapter: "technique", title: "Approve the plan, review the diff",
      body: [
        "A **checkpoint** is a planned pause. Approve a plan before the agent starts, or review a **diff** (a before and after view of changes) before they apply.",
        "Pair these with undo, like version control, and **dry runs**: show what would happen without doing it.",
      ],
      show: ["agent", "gate", "tool", "world"], focus: ["gate", "tool"],
      flows: [{ from: "agent", to: "gate", label: "plan" }, { from: "gate", to: "tool", label: "approved" }],
      data: { title: "A diff checkpoint (simplified)", data: { action: "apply_changes", files: ["billing.py"], diff: "-  rate = 0.05\n+  rate = 0.50", dry_run: true, awaiting: "approve | reject" } },
    },
    {
      short: "Good prompts", chapter: "technique", title: "Show what will happen, not just Allow?",
      body: [
        "\"Allow?\" teaches people to click yes. A good prompt names the **action, target and effect**: \"Send this email to 400 customers.\"",
        "Let the person see the real content and approve, edit or reject.",
      ],
      show: ["agent", "gate", "tool", "world"], focus: ["gate"],
      panel: { kind: "trace", events: [
        { type: "user", text: "Tell everyone on the list about the Friday outage." },
        { type: "think", text: "I will draft the email, then send it to the customer list." },
        { type: "tool", label: "draft_email", text: "Creates a draft. Nothing is sent yet." },
        { type: "warn", label: "needs approval", text: "Send to 400 customers, subject: \"Friday outage\". This cannot be undone." },
        { type: "approve", text: "You read the draft, fix one line and approve." },
        { type: "tool", label: "send_email", text: "Sends the approved email to 400 customers." },
      ] },
    },
    {
      short: "Fatigue", chapter: "insight", title: "Too many prompts get ignored",
      body: [
        "**Approval fatigue** is when constant prompts train people to click yes without reading. Then the gate protects nothing.",
        "Ask rarely but meaningfully: auto-allow the safe, undo the cheap, and save real prompts for the actions that matter.",
      ],
      callout: { kind: "next", text: "Next: Prompt Injection, when text the agent reads tries to steer it." },
      show: ["agent", "gate", "tool", "world"], focus: ["gate"],
      panel: { kind: "cards", cards: [
        { title: "Too many asks", text: "Fifty prompts a day. Soon every one gets a reflex yes.", tone: "rose" },
        { title: "Too few asks", text: "Nothing stops the one action that cannot be undone.", tone: "orange" },
        { title: "Meaningful asks", text: "Rare, specific and tied to real risk. People read them.", tone: "green" },
      ] },
    },
  ],
};
