import type { Lesson } from "../types";

export const workflowsVsAgents: Lesson = {
  id: "workflows-vs-agents",
  title: "Workflows vs Agents",
  summary: "Fixed steps you wrote, or steps the model chooses.",
  goals: ["What a workflow is and its common patterns", "How an agent differs", "How to choose by predictability", "Why hybrids are common"],
  nodes: [
    { id: "input", icon: "laptop", label: "Input", sub: "task or question", x: 90, y: 70, tone: "blue" },
    { id: "chain", icon: "chunker", label: "Chain", sub: "draft, check, polish", x: 340, y: 70, tone: "green" },
    { id: "router", icon: "chip", label: "Router", sub: "classify, then route", x: 340, y: 230, tone: "violet" },
    { id: "parallel", icon: "rack", label: "Parallel", sub: "three calls, merged", x: 580, y: 150, tone: "orange" },
    { id: "agent", icon: "tower", label: "Agent", sub: "picks its own steps", x: 720, y: 70, tone: "rose" },
  ],
  links: [{ a: "input", b: "chain" }, { a: "input", b: "router" }, { a: "router", b: "parallel" }, { a: "chain", b: "parallel" }, { a: "parallel", b: "agent" }],
  steps: [
    {
      short: "Two kinds", chapter: "problem", title: "Who decides the next step?",
      body: [
        "In a **workflow**, you wrote the steps and the code runs them in order. The model fills in each step.",
        "In an **agent**, the model decides the next step itself. Everything else follows from that choice.",
      ],
      show: ["input", "chain", "agent"], focus: ["chain", "agent"],
      panel: { kind: "cards", cards: [
        { title: "Workflow", text: "You write the path. The model works inside each step.", tone: "green" },
        { title: "Agent", text: "The model chooses the path as it goes.", tone: "rose" },
      ] },
    },
    {
      short: "Chain", chapter: "technique", title: "Chaining: one step feeds the next",
      body: [
        "**Prompt chaining** splits a job into fixed stages. Each model call gets the previous output, and you can check it between calls.",
        "Example: draft an email, check it for tone, polish the wording.",
      ],
      show: ["input", "chain", "agent"], focus: ["chain"], flows: [{ from: "input", to: "chain", label: "task" }],
      panel: { kind: "trace", events: [
        { type: "user", label: "input", text: "Write a short email declining a meeting." },
        { type: "agent", label: "1 draft", text: "Hi Sam, I can't make Tuesday. Could we move it?" },
        { type: "think", label: "2 check", text: "Tone is fine. Missing a proposed new time." },
        { type: "agent", label: "3 polish", text: "Hi Sam, Tuesday doesn't work for me. Could we try Thursday at 2?" },
      ] },
      data: { title: "Chain, defined in code (simplified)", data: { steps: ["draft", "check", "polish"], order: "always the same", model_decides_order: false } },
    },
    {
      short: "Routing", chapter: "technique", title: "Routing: classify, then specialise",
      body: [
        "**Routing** first labels the input, then sends it to a prompt built for that label. Each specialist prompt stays short and focused.",
        "Example: a refund question goes to the billing prompt, a bug report to the tech prompt.",
      ],
      show: ["input", "chain", "router", "agent"], focus: ["router"], flows: [{ from: "input", to: "router", label: "classify" }],
      panel: { kind: "cards", cards: [
        { title: "Classify", text: "\"My card was charged twice\" gets the label: billing.", tone: "violet" },
        { title: "Billing prompt", text: "Knows refund rules and tone for money questions.", tone: "green" },
        { title: "Tech prompt", text: "Asks for logs and versions. Used for bug reports.", tone: "blue" },
      ] },
      data: { title: "Router output (toy)", data: { input: "My card was charged twice", label: "billing", send_to: "billing_prompt" } },
    },
    {
      short: "Parallel", chapter: "technique", title: "Parallel: ask three at once, then merge",
      body: [
        "**Parallel calls** run independent model calls at the same time, then code combines the answers. It saves time, or gives several opinions to compare.",
        "Example: three reviewers read one draft, then a merge step lists the shared complaints.",
      ],
      show: ["input", "chain", "router", "parallel", "agent"], focus: ["parallel"], flows: [{ from: "router", to: "parallel", label: "3 calls" }],
      panel: { kind: "cards", cards: [
        { title: "Call A: clarity", text: "Is anything confusing?", tone: "blue" },
        { title: "Call B: facts", text: "Is any claim wrong?", tone: "violet" },
        { title: "Call C: tone", text: "Does it sound right for the reader?", tone: "orange" },
        { title: "Merge", text: "Code combines the three lists into one.", tone: "green" },
      ] },
    },
    {
      short: "Choose", chapter: "insight", title: "Choose by how predictable the task is",
      body: [
        "If you can write the steps down, write a workflow: cheaper, faster and easier to test. Use an agent when the steps depend on what turns up along the way.",
        "Start with the simplest thing that works, and add autonomy only where it earns its cost.",
      ],
      callout: { kind: "tip", text: "One plain model call often beats a fancy agent." },
      show: ["input", "chain", "router", "parallel", "agent"], focus: ["agent"],
      panel: { kind: "cards", cards: [
        { title: "Predictable steps: workflow", text: "Invoice parsing, form routing, fixed reviews.", tone: "green" },
        { title: "Open-ended: agent", text: "Debug this repo, research a topic, fix a failing build.", tone: "rose" },
        { title: "Trade-offs", text: "Agents cost more, take longer and give you less control.", tone: "orange" },
      ] },
    },
    {
      short: "Hybrids", chapter: "recap", title: "Most real systems mix both",
      body: [
        "A common shape is a workflow with one agent step inside it, or an agent that calls a fixed workflow as a tool. Pick the control level per step.",
      ],
      callout: { kind: "next", text: "Next: The Agent Loop. How an agent actually runs." },
      show: ["input", "chain", "router", "parallel", "agent"], focus: ["chain", "agent"],
      data: { title: "A hybrid (simplified)", data: { step1: "classify request (workflow)", step2: "if simple, answer from template (workflow)", step3: "if open-ended, hand to agent", step4: "review result before sending (workflow)" } },
    },
  ],
};
