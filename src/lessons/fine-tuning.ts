import type { Lesson } from "../types";

export const fineTuning: Lesson = {
  id: "fine-tuning",
  title: "Fine-Tuning & LoRA",
  summary: "Teach a model a style or skill by training on examples.",
  goals: ["When fine-tuning helps and when it does not", "What training examples look like", "How LoRA makes tuning cheap", "Risks, and how to check the result"],
  nodes: [
    { id: "examples", icon: "docs", label: "Examples", sub: "ideal input and output", x: 90, y: 150, tone: "blue" },
    { id: "training", icon: "rack", label: "Training", sub: "small updates", x: 340, y: 150, tone: "orange" },
    { id: "adapter", icon: "chunker", label: "Adapter", sub: "small add-on", x: 540, y: 70, tone: "violet" },
    { id: "base", icon: "tower", label: "Base model", sub: "frozen", x: 540, y: 230, tone: "gray" },
    { id: "tuned", icon: "chip", label: "Tuned model", sub: "base + adapter", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "examples", b: "training" }, { a: "training", b: "adapter" }, { a: "base", b: "training" }, { a: "adapter", b: "tuned" }, { a: "base", b: "tuned" }],
  steps: [
    {
      short: "Idea", chapter: "setup", title: "Fine-tuning means more training, on less data",
      body: [
        "**Fine-tuning** continues training a finished model on your own examples, so its habits shift toward them.",
        "It changes how the model behaves: format, tone, a narrow skill. It is not a good way to add facts.",
      ],
      show: ["examples", "training", "base"], focus: ["training"],
      flows: [{ from: "examples", to: "training", label: "examples" }],
      data: { title: "What changes (illustrative)", data: { before: "Replies in a long, chatty style", after: "Replies in your short, structured format", facts_changed: false, why: "Fine-tuning shifts habits, not what the model knows." } },
    },
    {
      short: "When", chapter: "problem", title: "When it helps, and when it does not",
      body: [
        "Try prompting and retrieval first. They are cheaper and easier to change. Fine-tune when those leave a gap.",
      ],
      callout: { kind: "tip", text: "Facts that change belong in retrieval. See What is RAG?" },
      show: ["examples", "training", "base"], focus: ["examples"],
      panel: { kind: "cards", cards: [
        { title: "Good fit", text: "A strict output format, a brand voice, a narrow repeated skill, shorter prompts.", tone: "green" },
        { title: "Also good", text: "Teaching a small model to imitate a larger one on one task.", tone: "blue" },
        { title: "Poor fit", text: "Fast-changing facts, private documents you must cite, or one-off tasks.", tone: "rose" },
      ] },
    },
    {
      short: "Data", chapter: "technique", title: "Training data is ideal input and output",
      body: [
        "Each example shows a request and the exact answer you wish the model gave. Hundreds of clean examples often beat thousands of sloppy ones.",
        "**Quality beats quantity.** The model copies your examples, mistakes included.",
      ],
      show: ["examples", "training", "base"], focus: ["examples"],
      data: { title: "One training example (simplified chat format)", data: { messages: [{ role: "system", content: "You write support replies in our brand voice." }, { role: "user", content: "My order has not arrived." }, { role: "assistant", content: "Sorry about the wait! I have checked your order and chased the courier. You will get an update within one day." }] } },
    },
    {
      short: "LoRA", chapter: "technique", title: "LoRA trains a small add-on",
      body: [
        "Updating billions of weights is costly. **LoRA** (low-rank adaptation) freezes the base model and trains small extra matrices, the **adapter**, instead.",
        "The adapter is tiny, quick to train and swappable. One base model can serve many adapters.",
      ],
      show: ["examples", "training", "base", "adapter", "tuned"], focus: ["adapter", "base"],
      flows: [{ from: "training", to: "adapter", label: "learns" }, { from: "adapter", to: "tuned", label: "add-on" }],
      panel: { kind: "cards", cards: [
        { title: "Full fine-tune", text: "Updates every weight. Large memory need, one big copy per task.", tone: "orange" },
        { title: "LoRA", text: "Trains only a small adapter. Far less memory, easy to swap.", tone: "violet" },
      ] },
    },
    {
      short: "Distill", chapter: "insight", title: "Distillation: a small model learns from a big one",
      body: [
        "**Distillation** uses a strong model's answers as training examples for a smaller one.",
        "The small model can then match the big one on a narrow task at lower cost. Check licence terms before using another model's outputs.",
      ],
      show: ["examples", "training", "base", "adapter", "tuned"], focus: ["examples", "tuned"],
      panel: { kind: "cards", cards: [
        { title: "1 · Generate", text: "A large model answers many task examples.", tone: "violet" },
        { title: "2 · Filter", text: "Keep only the answers that are correct.", tone: "orange" },
        { title: "3 · Train", text: "Fine-tune a small model on those pairs.", tone: "green" },
      ] },
    },
    {
      short: "Risks", chapter: "tradeoff", title: "What can go wrong",
      body: [
        "Over-training can make the model **forget** general skills or **overfit** (memorise examples instead of learning the pattern).",
        "Training data can also leak: private text in it may resurface in answers.",
      ],
      show: ["examples", "training", "base", "adapter", "tuned"], focus: ["training"],
      panel: { kind: "cards", cards: [
        { title: "Forgetting", text: "Gains on your task, losses elsewhere.", tone: "rose" },
        { title: "Overfitting", text: "Great on training examples, weak on new ones.", tone: "orange" },
        { title: "Data leakage", text: "Private text in training data can resurface in answers.", tone: "violet" },
      ] },
    },
    {
      short: "Check", chapter: "recap", title: "Compare before and after",
      body: [
        "Run the same eval on the base model and the tuned one, including tasks outside your target. Ship only if it clearly wins.",
      ],
      callout: { kind: "next", text: "Next: Running Models Locally, where small tuned models often live." },
      show: ["examples", "training", "base", "adapter", "tuned"], focus: ["tuned"],
      data: { title: "Before and after (illustrative)", data: { eval: "60 held-out tickets", base: { formatCorrect: "70%" }, tuned: { formatCorrect: "95%" }, generalSkillsCheck: "unchanged", verdict: "ship the tuned model" } },
    },
  ],
};
