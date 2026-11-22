import type { Lesson } from "../types";

export const planning: Lesson = {
  id: "planning",
  title: "Planning & ReAct",
  summary: "Plan first or think as you go: how agents stay on track.",
  goals: ["Why acting without a plan wanders", "ReAct: reason, act, observe", "Plan-and-execute and re-planning", "Reflection, and when each style fits"],
  nodes: [
    { id: "planner", icon: "chip", label: "Planner", sub: "decides what next", x: 90, y: 150, tone: "violet" },
    { id: "executor", icon: "laptop", label: "Executor", sub: "carries out steps", x: 310, y: 150, tone: "green" },
    { id: "tools", icon: "rack", label: "Tools", sub: "search, code, APIs", x: 520, y: 150, tone: "orange" },
    { id: "checker", icon: "layers", label: "Checker", sub: "is it right?", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "planner", b: "executor" }, { a: "executor", b: "tools" }, { a: "tools", b: "checker" }],
  steps: [
    {
      short: "Problem", chapter: "problem", title: "Acting without a plan wanders",
      body: [
        "Give an agent a big goal and tools, and it may pick the first action that looks useful, then the next. Easy to loop, repeat itself or drift.",
        "Complex tasks need some structure about what to do and in what order.",
      ],
      callout: { kind: "insight", text: "Tools give ability. Planning gives direction." },
      show: ["planner", "executor"], focus: ["planner"], flows: [{ from: "planner", to: "executor", label: "next?" }],
      data: { title: "An agent with no plan (illustrative)", data: { goal: "Compare two phone plans", actions: ["search plan A", "search plan A", "open page", "search plan A"], problem: "repeats itself, never opens plan B" } },
    },
    {
      short: "ReAct", chapter: "solution", title: "ReAct: think, act, observe",
      body: [
        "**ReAct** (Reason + Act) interleaves a short thought with an action. The result is observed, then the next thought builds on it.",
        "No fixed plan. Each step is chosen with the latest facts in view. Step through a run.",
      ],
      show: ["planner", "executor", "tools"], focus: ["planner", "tools"],
      flows: [{ from: "planner", to: "executor", label: "thought" }, { from: "executor", to: "tools", label: "action" }],
      panel: { kind: "trace", events: [
        { type: "user", text: "Which is bigger, the population of Norway or of Denmark?" },
        { type: "think", text: "I need both populations. Search Norway first." },
        { type: "tool", label: "search", text: "search(\"Norway population\")" },
        { type: "result", text: "About 5.5 million." },
        { type: "think", text: "Now Denmark." },
        { type: "tool", label: "search", text: "search(\"Denmark population\")" },
        { type: "result", text: "About 5.9 million." },
        { type: "agent", label: "answer", text: "Denmark is slightly larger (illustrative numbers)." },
      ] },
      data: { title: "ReAct pattern (simplified)", data: { loop: ["Thought", "Action", "Observation", "Thought", "..."], stops_when: "the model gives a final answer" } },
    },
    {
      short: "Plan first", chapter: "technique", title: "Plan-and-execute: write the plan first",
      body: [
        "**Plan-and-execute** has the model write a full step list up front, then runs the steps in order, often with a cheaper model or plain code.",
        "Fewer model calls and easier to inspect. But the plan was written before the world answered back.",
      ],
      callout: { kind: "tip", text: "Great when steps are known. Brittle when they are not." },
      show: ["planner", "executor", "tools"], focus: ["planner", "executor"],
      flows: [{ from: "planner", to: "executor", label: "plan" }, { from: "executor", to: "tools", label: "step 1" }],
      data: { title: "A plan (simplified)", data: { goal: "Book a Friday train to Lyon", steps: ["1. search_trains(Paris, Lyon, Fri)", "2. pick cheapest before 10:00", "3. book_ticket(train_id)", "4. email confirmation"] } },
    },
    {
      short: "Re-plan", chapter: "technique", title: "When a step fails, re-plan",
      body: [
        "Plans meet surprises: sold out, empty results, an error. A good agent **re-plans**: it keeps what worked and rewrites the rest.",
        "Step through a failed booking and the recovery.",
      ],
      show: ["planner", "executor", "tools", "checker"], focus: ["planner", "tools"],
      flows: [{ from: "tools", to: "checker", label: "failed" }, { from: "checker", to: "planner", label: "re-plan" }],
      panel: { kind: "trace", events: [
        { type: "agent", label: "plan", text: "1 search trains, 2 pick cheapest before 10:00, 3 book, 4 email." },
        { type: "tool", label: "search_trains", text: "Step 1 runs. Returns 3 trains." },
        { type: "tool", label: "book_ticket", text: "Step 3 runs on the 08:10 train." },
        { type: "warn", label: "failed", text: "Sold out. The rest of the plan no longer applies." },
        { type: "think", label: "re-plan", text: "Keep search results. Try the 09:05 train, then book and email." },
        { type: "result", text: "Booked. Confirmation sent." },
      ] },
    },
    {
      short: "Reflection", chapter: "technique", title: "Reflection: check, then fix",
      body: [
        "**Reflection** adds a check after the work: re-read the output against the goal, test the code, or have a second pass critique it. If it falls short, revise.",
        "A checker is only as good as its signal. Tests and real data beat a model grading itself.",
      ],
      callout: { kind: "tip", text: "Prefer checks that can fail objectively, like tests." },
      show: ["planner", "executor", "tools", "checker"], focus: ["checker", "planner"],
      flows: [{ from: "tools", to: "checker", label: "output" }, { from: "checker", to: "planner", label: "fix this" }],
      data: { title: "Reflection round (simplified)", data: { draft: "def avg(xs): return sum(xs) / len(xs)", check: "run tests", result: "fail: avg([]) raises ZeroDivisionError", revise: "return 0 if list is empty" } },
    },
    {
      short: "Choosing", chapter: "tradeoff", title: "Which style fits?",
      body: [
        "No style wins everywhere. Match it to how predictable the task is and how costly a wrong step is. Many real agents mix them: a rough plan, ReAct inside each step, a final check.",
      ],
      callout: { kind: "next", text: "Next: Memory, what happens when a long run fills the context window." },
      show: ["planner", "executor", "tools", "checker"], focus: ["planner", "checker"],
      panel: { kind: "cards", cards: [
        { title: "ReAct", text: "Unknown path, discovery tasks. Flexible, but more model calls.", tone: "violet" },
        { title: "Plan-and-execute", text: "Known steps, repeatable jobs. Cheaper and predictable, brittle to surprises.", tone: "green" },
        { title: "+ Re-planning", text: "Plans that survive failed steps.", tone: "orange" },
        { title: "+ Reflection", text: "Add where output can be tested or checked.", tone: "blue" },
      ] },
    },
  ],
};
