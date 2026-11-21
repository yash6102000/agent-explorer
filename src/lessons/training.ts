import type { Lesson } from "../types";

export const training: Lesson = {
  id: "training",
  title: "From Pretraining to Chat",
  summary: "How a raw text predictor becomes a helpful assistant.",
  goals: ["What pretraining teaches", "What instruction tuning changes", "What preference tuning (RLHF) adds", "Why base models ramble but chat models answer"],
  nodes: [
    { id: "data", icon: "docs", label: "Huge text corpus", sub: "web, books, code", x: 90, y: 70, tone: "green" },
    { id: "base", icon: "chip", label: "Base model", sub: "continues text", x: 400, y: 70, tone: "violet" },
    { id: "tuned", icon: "layers", label: "Instruction-tuned", sub: "follows requests", x: 400, y: 230, tone: "orange" },
    { id: "assistant", icon: "tower", label: "Chat assistant", sub: "helpful, safer", x: 710, y: 230, tone: "rose" },
  ],
  links: [{ a: "data", b: "base" }, { a: "base", b: "tuned" }, { a: "tuned", b: "assistant" }],
  steps: [
    {
      short: "Pretraining", chapter: "setup", title: "Stage 1: pretrain on a huge corpus",
      body: [
        "**Pretraining** means predicting the next token across an enormous pile of text. It is the most expensive stage by far.",
        "The result is a **base model**: it knows language and facts, but only continues text.",
      ],
      show: ["data", "base"], focus: ["data", "base"], flows: [{ from: "data", to: "base", label: "next token" }],
      data: { title: "Pretraining signal (toy)", data: { text: "The cat sat on the mat", input: "The cat sat on the", target: " mat", labels_needed: "none, the text is its own answer" } },
    },
    {
      short: "Rambling", chapter: "problem", title: "A base model rambles",
      body: [
        "Ask a base model a question and it may continue with more questions, since quizzes look like that online. It completes text, it does not follow orders.",
      ],
      callout: { kind: "insight", text: "Base models are knowledgeable but not yet helpful." },
      show: ["data", "base"], focus: ["base"],
      panel: { kind: "cards", cards: [
        { title: "You type", text: "\"What is the capital of France?\"", tone: "blue" },
        { title: "Base model may write", text: "\"What is the capital of Spain? What is the capital of Italy?\"", tone: "orange" },
        { title: "Chat model writes", text: "\"The capital of France is Paris.\"", tone: "green" },
      ] },
    },
    {
      short: "Instruction", chapter: "solution", title: "Stage 2: instruction tuning",
      body: [
        "**Instruction tuning** trains the base model further on thousands of examples: a request paired with a good answer written by people.",
        "It learns the pattern: when asked, answer.",
      ],
      show: ["data", "base", "tuned"], focus: ["tuned"], flows: [{ from: "base", to: "tuned", label: "examples" }],
      data: { title: "One training example (illustrative)", data: { instruction: "Summarise in one line: ...", good_answer: "The report finds sales grew in Q3.", effect: "model learns to follow requests" } },
    },
    {
      short: "Preferences", chapter: "solution", title: "Stage 3: learn from preferences",
      body: [
        "**Preference tuning** (often called **RLHF**, reinforcement learning from human feedback) shows people two answers and asks which is better. The model is then nudged toward the preferred style.",
        "It shapes tone, helpfulness and refusing unsafe requests.",
      ],
      show: ["data", "base", "tuned", "assistant"], focus: ["assistant"], flows: [{ from: "tuned", to: "assistant", label: "rankings" }],
      data: { title: "A preference pair (illustrative)", data: { prompt: "Explain photosynthesis simply.", answer_A: "Plants turn light, water and air into sugar.", answer_B: "Photosynthesis is a process.", human_choice: "A" } },
    },
    {
      short: "Compare", chapter: "insight", title: "What each stage changes",
      body: [
        "Knowledge mostly comes from pretraining. The later stages mainly change **behaviour**: how the model responds.",
      ],
      callout: { kind: "tip", text: "Tuning is cheap next to pretraining, and it makes the model usable." },
      show: ["data", "base", "tuned", "assistant"],
      panel: { kind: "cards", cards: [
        { title: "Pretraining", text: "Learns language and facts from raw text. Output: a base model.", tone: "violet" },
        { title: "Instruction tuning", text: "Learns to follow requests from example answers.", tone: "orange" },
        { title: "Preference tuning", text: "Learns which answers people prefer. Output: a chat assistant.", tone: "rose" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Same brain, better manners",
      body: [
        "A chat assistant is a pretrained model plus extra tuning. It still predicts the next token, but it has learned to behave like an assistant.",
        "It is still fallible, which is why grounding and tools matter.",
      ],
      callout: { kind: "next", text: "Next: prompting, how to talk to a model so it does what you mean." },
      show: ["data", "base", "tuned", "assistant"], focus: ["assistant"],
      panel: { kind: "cards", cards: [
        { title: "Pretrain", text: "Predict the next token on a huge corpus. Learns language and facts.", tone: "blue" },
        { title: "Instruction-tune", text: "Learn from example questions and good answers.", tone: "green" },
        { title: "Preference-tune", text: "Humans rank answers. The model learns what people prefer.", tone: "violet" },
      ] },
    },
  ],
};
