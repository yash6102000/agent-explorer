import type { Lesson } from "../types";

export const whatIsLlm: Lesson = {
  id: "what-is-llm",
  title: "What is an LLM?",
  summary: "A next-token predictor trained on huge text, and what that means.",
  goals: ["What a language model actually does", "What \"large\" refers to", "What it can and cannot do", "One mental model to keep"],
  nodes: [
    { id: "train", icon: "docs", label: "Training text", sub: "books, web, code", x: 400, y: 60, tone: "green" },
    { id: "prompt", icon: "laptop", label: "Prompt", sub: "your text, as tokens", x: 90, y: 210, tone: "blue" },
    { id: "llm", icon: "tower", label: "LLM", sub: "predicts next token", x: 400, y: 210, tone: "rose" },
    { id: "answer", icon: "layers", label: "Answer", sub: "one token at a time", x: 710, y: 210, tone: "orange" },
  ],
  zones: [
    { label: "Offline", sub: "done once, in the past", ids: ["train"], tone: "green" },
    { label: "Online", sub: "every time you ask", ids: ["prompt", "llm", "answer"], tone: "rose" },
  ],
  links: [{ a: "train", b: "llm" }, { a: "prompt", b: "llm" }, { a: "llm", b: "answer" }],
  steps: [
    {
      short: "Next token", chapter: "problem", title: "It predicts the next piece of text",
      body: [
        "A **large language model (LLM)** is a program that reads text and predicts what comes next. The pieces it works in are **tokens**: short chunks of words.",
        "Chat answers are that one move, repeated.",
      ],
      callout: { kind: "insight", text: "No hidden database of answers. Just: given this text, what token is likely next?" },
      show: ["prompt", "llm"], focus: ["llm"], flows: [{ from: "prompt", to: "llm", label: "tokens in" }],
      panel: { kind: "tokens" },
      data: { title: "One prediction (illustrative)", data: { input: "The capital of France is", next_token_odds: { " Paris": 0.92, " a": 0.03, " the": 0.02, "other": 0.03 } } },
    },
    {
      short: "Loop", chapter: "setup", title: "A full answer is a loop",
      body: [
        "The model picks one token, adds it to the text, and predicts again. Repeat until it decides to stop.",
        "It writes left to right, one token at a time.",
      ],
      show: ["prompt", "llm", "answer"], focus: ["llm", "answer"],
      flows: [{ from: "llm", to: "answer", label: "next token" }],
      data: { title: "Generating step by step", data: { start: "The capital of France is", step_1: "... is Paris", step_2: "... is Paris.", step_3: "<stop>" } },
    },
    {
      short: "Training", chapter: "technique", title: "It learned from a huge pile of text",
      body: [
        "During **training**, the model reads enormous amounts of text and practises predicting each next token. Every miss nudges its internal numbers.",
        "That happens once, offline. Afterwards the numbers are fixed.",
      ],
      callout: { kind: "tip", text: "Grammar, facts and coding patterns are all side effects of predicting text well." },
      show: ["train", "prompt", "llm", "answer"], focus: ["train", "llm"],
      flows: [{ from: "train", to: "llm", label: "learns" }],
      data: { title: "Training example (toy)", data: { text: "Water boils at 100 degrees", input: "Water boils at 100", target: " degrees", result: "numbers adjusted to make this likelier" } },
    },
    {
      short: "\"Large\"", chapter: "technique", title: "\"Large\" means parameters and data",
      body: [
        "**Parameters** are the adjustable numbers inside the model, learned in training. Modern LLMs have billions or more of them.",
        "\"Large\" also covers the training data: trillions of tokens is typical for today's biggest models.",
      ],
      show: ["train", "prompt", "llm", "answer"], focus: ["llm"],
      panel: { kind: "cards", cards: [
        { title: "Parameters", text: "The learned numbers that hold what the model knows. Billions or more.", tone: "violet" },
        { title: "Training data", text: "Books, web pages, code. Far more than anyone could read.", tone: "green" },
        { title: "Compute", text: "Training takes huge clusters of chips for weeks or months.", tone: "orange" },
      ] },
    },
    {
      short: "Limits", chapter: "tradeoff", title: "What it can and cannot do",
      body: [
        "It is strong at writing, summarising, translating and coding. But it has **no live lookup**, **no memory between chats**, and it can be **confidently wrong**.",
      ],
      callout: { kind: "warn", text: "Fluent is not the same as true. Check what matters." },
      show: ["train", "prompt", "llm", "answer"], focus: ["llm"],
      panel: { kind: "cards", cards: [
        { title: "Good at", text: "Drafting, rewriting, summarising, translating, explaining, writing code.", tone: "green" },
        { title: "No live data", text: "It only knows text up to its training cutoff, unless you supply more.", tone: "orange" },
        { title: "No memory", text: "A new chat starts blank. It only sees what is in the prompt.", tone: "blue" },
        { title: "Can be wrong", text: "It predicts likely text, so it can invent plausible but false facts.", tone: "rose" },
      ] },
    },
    {
      short: "Model", chapter: "recap", title: "The mental model to keep",
      body: [
        "An LLM is a **very well-read autocomplete**. It knows patterns from the past and sees only the text you give it right now.",
        "Everything else in this course builds on that: give it better text, tools and structure.",
      ],
      callout: { kind: "next", text: "Next: tokens, the pieces a model reads, and the window that limits its memory." },
      show: ["train", "prompt", "llm", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Frozen knowledge", text: "Learned once from training text, then fixed.", tone: "green" },
        { title: "Fresh input", text: "The prompt is the only thing it sees at answer time.", tone: "blue" },
        { title: "Likely output", text: "One most-plausible token at a time.", tone: "rose" },
      ] },
    },
  ],
};
