import type { Lesson } from "../types";

export const leastPrivilege: Lesson = {
  id: "least-privilege",
  title: "Sandboxing & Least Privilege",
  summary: "Assume the agent gets tricked, and shrink what that can cost.",
  goals: ["Why to plan for a tricked or wrong agent", "Scoped, short-lived credentials", "Allow-lists and sandboxes", "A worked example: a refund agent"],
  nodes: [
    { id: "agent", icon: "tower", label: "Agent", sub: "may be tricked", x: 90, y: 150, tone: "rose" },
    { id: "perms", icon: "layers", label: "Permission layer", sub: "scopes, allow-lists", x: 300, y: 150, tone: "orange" },
    { id: "sandbox", icon: "chip", label: "Sandbox", sub: "isolated runtime", x: 510, y: 150, tone: "violet" },
    { id: "resources", icon: "rack", label: "Resources", sub: "data, APIs, files", x: 720, y: 150, tone: "green" },
  ],
  links: [{ a: "agent", b: "perms" }, { a: "perms", b: "sandbox" }, { a: "sandbox", b: "resources" }],
  steps: [
    {
      short: "Assume", chapter: "problem", title: "Assume it will eventually be tricked",
      body: [
        "Models make mistakes and can be steered by hostile text (see Prompt Injection). You cannot promise it never happens.",
        "So ask a different question: **if it does, how bad can it get?** That is the **blast radius**.",
      ],
      callout: { kind: "insight", text: "Security that depends on the model behaving is not security." },
      show: ["agent", "resources"], focus: ["agent", "resources"], flows: [{ from: "agent", to: "resources", label: "any action" }],
      data: { title: "No limits (anti-pattern)", data: { credential: "admin key", network: "open", filesystem: "whole machine", worst_case: "everything the admin can touch" } },
    },
    {
      short: "Least privilege", chapter: "setup", title: "Give only what the task needs",
      body: [
        "**Least privilege** means each agent gets only the tools and data its job needs, and nothing more. Fewer tools means fewer ways to go wrong.",
        "Split abilities too: reading and writing are separate permissions.",
      ],
      callout: { kind: "tip", text: "If the agent never needs a tool, do not connect it." },
      show: ["agent", "perms", "resources"], focus: ["perms"], flows: [{ from: "agent", to: "perms", label: "request" }, { from: "perms", to: "resources", label: "if in scope" }],
      panel: { kind: "cards", cards: [
        { title: "Few tools", text: "A summariser needs read access. It does not need delete or send.", tone: "blue" },
        { title: "Narrow data", text: "One customer's records, not the whole database.", tone: "green" },
        { title: "Split read and write", text: "Most tasks only read. Make writing a separate, rarer grant.", tone: "orange" },
      ] },
    },
    {
      short: "Credentials", chapter: "technique", title: "Scoped, short-lived credentials",
      body: [
        "Never hand an agent your admin key. Give it a **scoped credential**: a token limited to specific actions, ideally **short-lived** so it expires after the task.",
        "If it leaks or is misused, the damage is small and ends soon.",
      ],
      callout: { kind: "warn", text: "Secrets in a prompt can be repeated back. Keep keys in the tool layer." },
      show: ["agent", "perms", "resources"], focus: ["perms"],
      panel: { kind: "cards", cards: [
        { title: "Admin key", text: "Full access, never expires. One trick away from disaster.", tone: "rose" },
        { title: "Read-only token", text: "Can look, cannot change. Blocks deletes and edits.", tone: "green" },
        { title: "Per-task key", text: "Created for one job, expires in minutes.", tone: "violet" },
      ] },
      data: { title: "Credential request (simplified)", data: { agent: "support-bot", scope: ["orders:read", "refunds:create"], refund_limit_usd: 50, expires_in: "15m" } },
    },
    {
      short: "Sandbox", chapter: "technique", title: "Allow-lists and a sandbox",
      body: [
        "An **allow-list** names what is permitted (commands, domains, folders) and denies the rest. It beats a block-list, which always misses something.",
        "A **sandbox** is an isolated container or VM for running code: no network or limited network, and a throwaway filesystem.",
      ],
      show: ["agent", "perms", "sandbox", "resources"], focus: ["sandbox"],
      flows: [{ from: "perms", to: "sandbox", label: "approved" }, { from: "sandbox", to: "resources", label: "limited" }],
      panel: { kind: "cards", cards: [
        { title: "Command allow-list", text: "Only `git status`, `npm test`, and a few more.", tone: "orange" },
        { title: "Domain allow-list", text: "Calls reach `api.mycompany.com`. Everything else is dropped.", tone: "blue" },
        { title: "Throwaway filesystem", text: "Wiped after each run. Nothing real to delete or steal.", tone: "violet" },
      ] },
    },
    {
      short: "Try it", chapter: "technique", title: "Hijacked agent: which limit saves you?",
      body: [
        "Below, a tricked agent tries to delete a database. Switch on limits one at a time and see what actually stops it.",
        "Then change the story in your head: if it were copying a file out, the **network allow-list** would be the one that matters.",
      ],
      callout: { kind: "insight", text: "Different attacks need different limits. Cover all of them." },
      show: ["agent", "perms", "sandbox", "resources"], focus: ["agent", "perms", "sandbox"],
      panel: { kind: "defenses", attack: "A tricked agent runs a command to delete the production database", harm: "The database is gone", layers: [
        { id: "admin", label: "Admin key", blocks: false, note: "Full rights. It makes the delete succeed." },
        { id: "ro", label: "Read-only credential", blocks: true, note: "No write permission, so the delete is refused." },
        { id: "net", label: "Network allow-list", blocks: false, note: "Stops data leaving, but not a delete inside the allowed host." },
        { id: "fs", label: "Sandbox filesystem", blocks: true, note: "The command runs in a copy. Production is untouched." },
        { id: "spend", label: "Spend limit", blocks: false, note: "Caps cost, not a one-off destructive command." },
      ] },
    },
    {
      short: "Worked case", chapter: "recap", title: "Example: a support agent for orders",
      body: [
        "A support agent needs to read orders and issue small refunds. Everything else is off the table, and every action is logged in an **audit log** (a record of who did what).",
        "Limits on rate and spend mean even a fully tricked agent can only do a bounded amount of harm.",
      ],
      callout: { kind: "next", text: "Next: Data Leakage & Privacy, for what escapes without any attack." },
      show: ["agent", "perms", "sandbox", "resources"],
      panel: { kind: "cards", cards: [
        { title: "Allowed", text: "Read this customer's orders. Refund up to a set amount.", tone: "green" },
        { title: "Denied", text: "Delete records, read other customers, email outside the company.", tone: "rose" },
        { title: "Limits", text: "A few refunds per hour, a daily spend cap, every call logged.", tone: "orange" },
      ] },
      data: { title: "Support-agent policy (illustrative)", data: { tools: ["get_order", "issue_refund"], credential: "orders:read + refunds:create", refund_cap_usd: 50, refunds_per_hour: 5, network: ["api.shop.example"], audit_log: true } },
    },
  ],
};
