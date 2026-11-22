import type { Lesson } from "../types";

export const choosingModel: Lesson = {
  id: "choosing-model",
  title: "Choosing a Model",
  summary: "Pick the smallest model that passes your own test.",
  goals: ["The trade-offs between capability, speed and price", "What to check besides quality", "Why your own eval beats a leaderboard", "Start strong, then try smaller"],
  nodes: [
    { id: "task", icon: "laptop", label: "Your task", sub: "real examples", x: 90, y: 150, tone: "blue" },
    { id: "small", icon: "chip", label: "Small model", sub: "fast, cheap", x: 340, y: 70, tone: "green" },
    { id: "large", icon: "rack", label: "Large model", sub: "stronger, slower", x: 340, y: 230, tone: "violet" },
    { id: "eval", icon: "layers", label: "Eval", sub: "score each one", x: 540, y: 150, tone: "orange" },
    { id: "pick", icon: "tower", label: "Pick", sub: "cheapest that passes", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "task", b: "small" }, { a: "task", b: "large" }, { a: "small", b: "eval" }, { a: "large", b: "eval" }, { a: "eval", b: "pick" }],
  steps: [
    {
      short: "Trade-offs", chapter: "problem", title: "No model is best at everything",
      body: [
        "Models come in sizes. **Larger** ones usually reason better and handle harder tasks, but they cost more and respond more slowly.",
        "So \"best model\" is not a thing. There is only the best fit for one task.",
      ],
      callout: { kind: "insight", text: "Choosing is a trade between quality, speed and price." },
      show: ["task", "small", "large"], focus: ["small", "large"],
      panel: { kind: "cards", cards: [
        { title: "Small", text: "Fast and cheap. Good at simple, well-defined tasks.", tone: "green" },
        { title: "Medium", text: "A balanced default for many everyday tasks.", tone: "blue" },
        { title: "Large", text: "Best on hard reasoning and messy input. Slowest, priciest.", tone: "violet" },
      ] },
    },
    {
      short: "Checklist", chapter: "setup", title: "What to compare besides quality",
      body: [
        "Quality is one column. Also check the **context window** (how much text fits in one request), the **price per token**, and whether the model has the features you need.",
        "Input and output tokens are usually priced differently, and output costs more.",
      ],
      show: ["task", "small", "large"], focus: ["task"],
      panel: { kind: "cards", cards: [
        { title: "Speed", text: "Time to first token, then tokens per second. Matters for chat.", tone: "orange" },
        { title: "Context window", text: "Does your longest realistic input fit, with room for the answer?", tone: "blue" },
        { title: "Features", text: "Tool calling, image or audio input, structured output.", tone: "violet" },
        { title: "Terms", text: "Open weights or hosted? Check data handling and licence.", tone: "rose" },
      ] },
    },
    {
      short: "Your eval", chapter: "solution", title: "Test on your task, not a leaderboard",
      body: [
        "Public rankings measure other people's tasks. Collect 20 to 50 **real examples** of yours, run each candidate, and score the answers.",
        "That small **eval** (a repeatable test with a score) turns opinion into evidence. See Evals for how to measure.",
      ],
      callout: { kind: "tip", text: "Include the hard and weird cases. Averages hide failures." },
      show: ["task", "small", "large", "eval"], focus: ["eval"],
      flows: [{ from: "small", to: "eval", label: "answers" }, { from: "large", to: "eval", label: "answers" }],
      data: { title: "Eval results (illustrative)", data: { task: "Classify support tickets", examples: 40, results: [{ model: "small", correct: 34, pass: "85%" }, { model: "large", correct: 38, pass: "95%" }], note: "Is 10 points worth the extra cost?" } },
    },
    {
      short: "Start strong", chapter: "technique", title: "Start strong, then try smaller",
      body: [
        "Begin with a large model to learn what is possible. Once the task works, try a smaller one on the same eval.",
        "If it still passes, you just cut cost and delay. Prompt tweaks often close the gap.",
      ],
      show: ["task", "small", "large", "eval", "pick"], focus: ["small", "pick"],
      flows: [{ from: "eval", to: "pick", label: "cheapest pass" }],
      panel: { kind: "cost", controls: ["model"], model: "medium", requestsPerDay: 5000, inTokens: 1500, outTokens: 300 },
      callout: { kind: "insight", text: "Prices here are illustrative. The pattern holds: tier changes monthly cost a lot." },
    },
    {
      short: "Routing", chapter: "technique", title: "Use the small model for easy requests",
      body: [
        "Not every request is hard. A **router** (a cheap check that sorts requests) can send easy ones to a small model and hard ones to a large model.",
        "You pay large-model prices only when you need large-model quality.",
      ],
      show: ["task", "small", "large", "eval", "pick"], focus: ["task", "small", "large"],
      flows: [{ from: "task", to: "small", label: "easy" }, { from: "task", to: "large", label: "hard" }],
      data: { title: "Routing rule (simplified)", data: { rules: [{ if: "short FAQ-style question", use: "small" }, { if: "multi-step or ambiguous request", use: "large" }], fallback: "If the small model is unsure, escalate to large." } },
    },
    {
      short: "Recap", chapter: "recap", title: "Pick by evidence, revisit often",
      body: [
        "Models change quickly. Keep your eval, and re-run it when a new option appears or your task shifts.",
      ],
      callout: { kind: "next", text: "Next: models that see and hear, not just read." },
      show: ["task", "small", "large", "eval", "pick"], focus: ["pick"],
      panel: { kind: "cards", cards: [
        { title: "1 · Define", text: "Write down the task and collect real examples.", tone: "blue" },
        { title: "2 · Compare", text: "Run two or three sizes through the same eval.", tone: "orange" },
        { title: "3 · Choose", text: "Take the cheapest model that passes. Route if it helps.", tone: "green" },
      ] },
    },
  ],
};
