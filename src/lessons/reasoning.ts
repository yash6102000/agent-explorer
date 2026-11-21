import type { Lesson } from "../types";

export const reasoning: Lesson = {
  id: "reasoning",
  title: "Reasoning Models",
  summary: "Letting a model think before it answers, and what that costs.",
  goals: ["Why step-by-step helps", "What thinking tokens are", "The cost in time and tokens", "When not to use reasoning"],
  nodes: [
    { id: "question", icon: "laptop", label: "Question", sub: "from the user", x: 90, y: 150, tone: "blue" },
    { id: "thinking", icon: "tower", label: "Thinking tokens", sub: "scratch work", x: 400, y: 150, tone: "violet" },
    { id: "answer", icon: "layers", label: "Answer", sub: "what you see", x: 720, y: 150, tone: "green" },
  ],
  links: [{ a: "question", b: "thinking" }, { a: "thinking", b: "answer" }],
  steps: [
    {
      short: "One shot", chapter: "problem", title: "Fast answers can be wrong",
      body: [
        "A model writes one token at a time. Ask a multi-step question and demand an instant answer, and it must **jump to the end** with no room to work.",
        "Harder problems like maths, code and planning often fail this way.",
      ],
      callout: { kind: "warn", text: "A confident one-line answer may skip the steps that matter." },
      show: ["question", "answer"], focus: ["answer"], flows: [{ from: "question", to: "answer", label: "answer now" }],
      data: { title: "Answer with no working", data: { question: "A shirt costs $40 after a 20% discount. What was the original price?", answer: "$48" } },
    },
    {
      short: "Step by step", chapter: "setup", title: "Writing out the steps helps",
      body: [
        "**Chain of thought** means the model writes its intermediate steps before the final answer. Each step becomes input for the next.",
        "Adding \"think step by step\" to a prompt was the classic way to trigger it.",
      ],
      callout: { kind: "insight", text: "Written steps act as working memory the model can reread." },
      show: ["question", "thinking", "answer"], focus: ["thinking"],
      flows: [{ from: "question", to: "thinking", label: "problem" }, { from: "thinking", to: "answer", label: "result" }],
      data: { title: "Chain of thought", data: { question: "A shirt costs $40 after a 20% discount. Original price?", steps: ["After a 20% discount the price is 80% of the original.", "So 0.8 x original = 40.", "Original = 40 / 0.8 = 50."], answer: "$50" } },
    },
    {
      short: "Thinking", chapter: "technique", title: "Reasoning models think by default",
      body: [
        "**Reasoning models** are trained to produce a long internal chain of thought before replying. These are **thinking tokens**, extra output the model writes for itself.",
        "Depending on the product, you may see a summary of it, or none.",
      ],
      show: ["question", "thinking", "answer"], focus: ["thinking", "answer"],
      flows: [{ from: "thinking", to: "answer", label: "final" }],
      data: { title: "Hidden trace vs final answer", data: { thinking: "Need original price P. Discounted = 0.8P = 40. P = 50. Check: 50 x 0.8 = 40. Good.", final_answer: "The original price was $50.", note: "Illustrative. Real traces are longer and messier." } },
    },
    {
      short: "Where it helps", chapter: "technique", title: "It shines on multi-step problems",
      body: [
        "Thinking lets the model **plan, try and check** its work. That pays off when the answer depends on several linked steps.",
      ],
      show: ["question", "thinking", "answer"], focus: ["thinking"],
      panel: { kind: "cards", cards: [
        { title: "Maths", text: "Chains of arithmetic and algebra where one slip ruins the result.", tone: "violet" },
        { title: "Code", text: "Debugging, design and edge cases that need planning.", tone: "blue" },
        { title: "Multi-step logic", text: "Puzzles, scheduling and questions with constraints.", tone: "orange" },
      ] },
    },
    {
      short: "Cost", chapter: "tradeoff", title: "Thinking costs time and tokens",
      body: [
        "Thinking tokens are real tokens. They take time to generate and usually **count toward your bill** and your context window.",
        "Many APIs let you set a **thinking budget**, a cap on how much the model may think.",
      ],
      callout: { kind: "tip", text: "Raise the budget only when quality demands it." },
      metrics: [{ label: "Latency", value: "higher" }, { label: "Tokens", value: "more" }, { label: "Control", value: "budget" }],
      show: ["question", "thinking", "answer"], focus: ["thinking"],
      data: { title: "A request with a budget (illustrative)", data: { model: "reasoning-model", messages: [{ role: "user", content: "Plan the migration steps." }], thinking: { budget_tokens: 4000 }, usage: { thinking_tokens: 2310, answer_tokens: 180 } } },
    },
    {
      short: "Skip it", chapter: "insight", title: "Not every question needs it",
      body: [
        "For simple lookups, rewrites or classification, thinking is wasted time and money. The answer was never hard.",
        "And thinking is not proof: a model can reason **confidently to a wrong answer**.",
      ],
      callout: { kind: "warn", text: "Check important results. A long trace is not a guarantee." },
      show: ["question", "thinking", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Skip thinking", text: "\"Capital of France?\" Translate this. Reformat this list.", tone: "green" },
        { title: "Use thinking", text: "Prove it, debug it, plan it, or solve with several constraints.", tone: "violet" },
        { title: "Still verify", text: "Tests, sources or a second check catch confident mistakes.", tone: "rose" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Think more only when it pays",
      body: [
        "Step-by-step writing gives the model working room. Reasoning models do it automatically, at the price of speed and tokens.",
        "Match the effort to the problem.",
      ],
      callout: { kind: "next", text: "Next: where models still fail: hallucinations and limits." },
      show: ["question", "thinking", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Idea", text: "Write steps first, answer second.", tone: "violet" },
        { title: "Cost", text: "More tokens, slower replies.", tone: "orange" },
        { title: "Rule", text: "Hard and multi-step: think. Simple: don't.", tone: "green" },
      ] },
    },
  ],
};
