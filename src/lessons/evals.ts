import type { Lesson } from "../types";

export const evals: Lesson = {
  id: "evals",
  title: "Evals & LLM-as-Judge",
  summary: "Test AI changes with a real test set, like unit tests for answers.",
  goals: ["Why spot-checking fails", "Test sets and metrics", "LLM-as-judge and its biases", "Evals for agents and in production"],
  nodes: [
    { id: "tests", icon: "docs", label: "Test set", sub: "real cases + answers", x: 90, y: 150, tone: "green" },
    { id: "app", icon: "tower", label: "Your app", sub: "prompt, model, tools", x: 310, y: 150, tone: "violet" },
    { id: "judge", icon: "layers", label: "Judge", sub: "code, model or human", x: 520, y: 150, tone: "orange" },
    { id: "scores", icon: "rack", label: "Scores", sub: "pass rate per change", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "tests", b: "app" }, { a: "app", b: "judge" }, { a: "judge", b: "scores" }],
  steps: [
    {
      short: "Vibes", chapter: "problem", title: "\"It looks fine\" does not scale",
      body: [
        "You tweak a prompt, try three questions, and ship. Next week something else breaks and nobody knows which change did it.",
        "AI output varies, so you need numbers, not impressions.",
      ],
      callout: { kind: "insight", text: "An **eval** is a repeatable test that scores your AI system's answers." },
      show: ["app"], focus: ["app"],
      data: { title: "Two versions, three spot checks (illustrative)", data: { spot_checks: { v1: "looks fine", v2: "looks fine" }, question: "Which version is better?", answer: "Nobody can tell yet. Spot checks cannot separate them." } },
    },
    {
      short: "Test set", chapter: "setup", title: "Start with a small, real test set",
      body: [
        "Collect 20 to 100 **real** cases: actual user questions, plus the tricky ones. Write what a good answer looks like.",
        "Small and honest beats large and made up. Grow it every time something fails.",
      ],
      show: ["tests", "app"], focus: ["tests"], flows: [{ from: "tests", to: "app", label: "questions" }],
      data: { title: "Test cases (simplified)", data: [
        { id: "t1", category: "refunds", input: "Can I return an opened item?", expect: "Says no unless defective" },
        { id: "t2", category: "shipping", input: "Do you ship to Canada?", expect: "Yes, 5-8 business days" },
        { id: "t3", category: "billing", input: "Why was I charged twice?", expect: "Asks for order number" },
      ] },
    },
    {
      short: "Metrics", chapter: "technique", title: "Pick a metric that fits the task",
      body: [
        "Use the cheapest check that works. If a clear right answer exists, check it with code. If quality is a matter of degree, use a rubric.",
        "For retrieval metrics, see Evaluating RAG.",
      ],
      show: ["tests", "app", "judge"], focus: ["judge"],
      panel: { kind: "cards", cards: [
        { title: "Exact match", text: "Code compares to the answer. Fast, free, for labels and numbers.", tone: "green" },
        { title: "Rubric", text: "Checklist: cites policy, polite, under 80 words. Score each item.", tone: "violet" },
        { title: "Human rating", text: "Slow and costly, but the ground truth for taste and safety.", tone: "orange" },
        { title: "LLM judge", text: "A model applies the rubric. Scales like code, reads like a person.", tone: "blue" },
      ] },
    },
    {
      short: "LLM judge", chapter: "technique", title: "LLM-as-judge: a model grades answers",
      body: [
        "An **LLM-as-judge** gets the question, the answer and a clear rubric, then returns a score and a reason. It is cheap and fast enough to run on every change.",
        "Ask for the reason first and the score second. Ask for pass or fail, or a short scale.",
      ],
      show: ["tests", "app", "judge", "scores"], focus: ["judge"], flows: [{ from: "app", to: "judge", label: "answer" }, { from: "judge", to: "scores", label: "verdict" }],
      data: { title: "Judge verdict (simplified)", data: {
        rubric: "Pass only if the answer states the 30-day refund window and does not invent other terms.",
        answer: "You can return items within 30 days for a full refund.",
        reason: "States the 30-day window. No invented terms.",
        verdict: "pass",
      } },
    },
    {
      short: "Judge bias", chapter: "tradeoff", title: "Judges have biases. Calibrate them.",
      body: [
        "Judges tend to prefer **longer** answers, text in **their own style**, and whichever option appears **first**. They can be confidently wrong.",
        "Compare to human labels on a sample, and write sharp rubrics.",
      ],
      callout: { kind: "tip", text: "For A versus B, judge both orders and keep only consistent wins." },
      show: ["tests", "app", "judge", "scores"], focus: ["judge"],
      panel: { kind: "cards", cards: [
        { title: "Length bias", text: "Longer sounds better. Put length limits in the rubric.", tone: "orange" },
        { title: "Self-preference", text: "A model rates its own style higher. Judge with a different model.", tone: "violet" },
        { title: "Position bias", text: "The first option wins too often. Swap the order and rerun.", tone: "rose" },
        { title: "Calibrate", text: "Label 30 cases by hand. Check the judge agrees with you.", tone: "green" },
      ] },
    },
    {
      short: "Regression", chapter: "insight", title: "Run it on every change",
      body: [
        "Treat evals like unit tests. Run the same set after each prompt, model or retrieval change, and compare pass rates to the last run.",
        "Look at categories too. A better average can hide one broken area.",
      ],
      callout: { kind: "insight", text: "A change is good only if the numbers say so, on cases you did not tune for." },
      show: ["tests", "app", "judge", "scores"], focus: ["scores"], flows: [{ from: "judge", to: "scores", label: "pass rate" }],
      data: { title: "Eval run: prompt v2 vs v1 (illustrative)", data: {
        cases: 10,
        v1: { passed: 6, pass_rate: "6/10 = 60%" },
        v2: {
          passed: 8,
          pass_rate: "8/10 = 80%",
          by_category: { billing: "3/4 = 75%", shipping: "3/3 = 100%", refunds: "2/3 = 67%" },
        },
        change: "+20 points. Refunds is still the weak spot.",
      } },
    },
    {
      short: "Agents + live", chapter: "recap", title: "Agents and production need evals too",
      body: [
        "**Agent evals** score more than the final answer: did the task succeed, how many steps, were tool calls correct, and what did it cost?",
        "Offline evals run before release. **Online** signals (thumbs, A/B tests) show real use. Turn bad cases into new tests.",
      ],
      callout: { kind: "next", text: "Next: see inside each run. Continue with Observability." },
      show: ["tests", "app", "judge", "scores"],
      panel: { kind: "cards", cards: [
        { title: "Task success", text: "Did the agent finish the job? Check the end state, not the wording.", tone: "green" },
        { title: "Steps taken", text: "Fewer is usually better. Loops and retries signal trouble.", tone: "blue" },
        { title: "Tool-call correctness", text: "Right tool, valid arguments, no forbidden actions.", tone: "violet" },
        { title: "Cost and time", text: "Tokens and seconds per task, tracked beside quality.", tone: "orange" },
        { title: "Online feedback", text: "Thumbs and A/B tests catch what the test set missed.", tone: "rose" },
      ] },
    },
  ],
};
