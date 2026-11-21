import type { Lesson } from "../types";

const tokens = [
  { t: " Paris", p: 0.82 },
  { t: " the", p: 0.06 },
  { t: " a", p: 0.04 },
  { t: " located", p: 0.03 },
  { t: " Lyon", p: 0.02 },
  { t: " known", p: 0.02 },
  { t: " Berlin", p: 0.01 },
];
const prompt = "The capital of France is";

export const nextToken: Lesson = {
  id: "next-token",
  title: "Next-Token Prediction & Sampling",
  summary: "An LLM scores every possible next token, then one is picked.",
  goals: ["The model outputs a probability for every token", "Greedy versus sampling", "What temperature and top-p change", "Why one prompt can give different answers"],
  nodes: [
    { id: "prompt", icon: "laptop", label: "Prompt", sub: "text so far", x: 90, y: 150, tone: "ink" },
    { id: "llm", icon: "chip", label: "LLM", sub: "scores every token", x: 310, y: 150, tone: "violet" },
    { id: "probs", icon: "rack", label: "Probabilities", sub: "one per token", x: 520, y: 150, tone: "blue" },
    { id: "sampler", icon: "tower", label: "Sampler", sub: "picks one token", x: 720, y: 150, tone: "orange" },
  ],
  links: [{ a: "prompt", b: "llm" }, { a: "llm", b: "probs" }, { a: "probs", b: "sampler" }],
  steps: [
    {
      short: "Predict", chapter: "problem", title: "An LLM only predicts the next token",
      body: [
        "A **token** is a small piece of text, often a word or part of one. Given the text so far, the model's whole job is to guess what token comes next.",
        "It does not look up the answer. It scores likely continuations.",
      ],
      callout: { kind: "insight", text: "Everything an LLM writes is one next-token guess, repeated." },
      show: ["prompt", "llm"], focus: ["llm"], flows: [{ from: "prompt", to: "llm", label: "text so far" }],
      data: { title: "Model input", data: { text: prompt, task: "predict the next token" } },
    },
    {
      short: "Probabilities", chapter: "setup", title: "It scores every token in its vocabulary",
      body: [
        "The model outputs a **probability** for each token it knows: a number from 0 to 1, all adding up to 1. Most tokens get almost nothing.",
        "Here are the top few for our prompt. These numbers are illustrative.",
      ],
      show: ["prompt", "llm", "probs"], focus: ["probs"], flows: [{ from: "llm", to: "probs", label: "scores" }],
      panel: { kind: "sampler", prompt, tokens },
      data: { title: "Top next-token probabilities (illustrative)", data: { prompt, top: tokens.map((x) => ({ token: x.t, p: x.p })), others: "tiny, thousands more" } },
    },
    {
      short: "Pick one", chapter: "solution", title: "Greedy or sampling: how to pick",
      body: [
        "**Greedy** decoding always takes the top token. It is steady but can be dull and repetitive.",
        "**Sampling** rolls weighted dice: \" Paris\" wins most often, but not always. Press sample a few times.",
      ],
      callout: { kind: "tip", text: "Sampling is why the same prompt can give different answers." },
      show: ["prompt", "llm", "probs", "sampler"], focus: ["sampler"], flows: [{ from: "probs", to: "sampler", label: "weights" }],
      panel: { kind: "sampler", prompt, tokens },
      data: { title: "Two ways to choose", data: { greedy: " Paris", sampled: [" Paris", " Paris", " the", " Paris"] } },
    },
    {
      short: "Temperature", chapter: "technique", title: "Temperature sharpens or flattens odds",
      body: [
        "**Temperature** is a dial that reshapes the probabilities before sampling. Low makes the top token even more likely. High flattens the odds, so unlikely tokens get picked more.",
        "Drag it and watch the bars.",
      ],
      callout: { kind: "insight", text: "Near zero is almost greedy. High values add variety and risk." },
      show: ["prompt", "llm", "probs", "sampler"], focus: ["sampler"],
      panel: { kind: "sampler", prompt, tokens, temperature: 1, controls: ["temperature"] },
      data: { title: "Request settings", data: { temperature: 1.0, note: "lower = steadier, higher = more varied" } },
    },
    {
      short: "Top-p", chapter: "technique", title: "Top-p cuts off the unlikely tail",
      body: [
        "**Top-p** (nucleus sampling) keeps only the most likely tokens whose probabilities add up to p, and drops the rest. Odd picks like \" Berlin\" can no longer happen.",
        "Try raising temperature, then lowering top-p to tame it.",
      ],
      callout: { kind: "tip", text: "Temperature reshapes the odds. Top-p removes the long tail." },
      show: ["prompt", "llm", "probs", "sampler"], focus: ["probs", "sampler"],
      panel: { kind: "sampler", prompt, tokens, temperature: 1.5, topP: 0.9, controls: ["temperature", "topP"] },
      data: { title: "Request settings", data: { temperature: 1.5, top_p: 0.9, effect: "tail tokens removed before sampling" } },
    },
    {
      short: "Which setting", chapter: "tradeoff", title: "Low for facts, high for ideas",
      body: [
        "There is no best setting. It depends on whether you want one reliable answer or many different ones.",
        "Low temperature is not a truth switch, though. It makes the model consistent, not correct.",
      ],
      show: ["prompt", "llm", "probs", "sampler"], focus: ["sampler"],
      panel: { kind: "cards", cards: [
        { title: "Low (0 to 0.3)", text: "Extraction, code, factual Q&A, classification. Same input, nearly same output.", tone: "blue" },
        { title: "Medium (0.5 to 0.8)", text: "General chat and writing help. A balance of steady and fresh.", tone: "green" },
        { title: "High (1 and up)", text: "Brainstorming, names, fiction. More variety, more odd or wrong picks.", tone: "orange" },
      ] },
      data: { title: "Typical starting points", data: { extraction: { temperature: 0 }, chat: { temperature: 0.7 }, brainstorm: { temperature: 1.0, top_p: 0.95 } } },
    },
    {
      short: "Recap", chapter: "recap", title: "The loop in four lines",
      body: ["The chosen token is added to the text, and the whole loop runs again until the answer ends."],
      callout: { kind: "next", text: "Next: how a raw text predictor was trained into a helpful chat assistant." },
      show: ["prompt", "llm", "probs", "sampler"], flows: [{ from: "sampler", to: "prompt", label: "next token" }],
      panel: { kind: "cards", cards: [
        { title: "1. Score", text: "The model gives every token a probability.", tone: "violet" },
        { title: "2. Reshape", text: "Temperature sharpens or flattens the odds.", tone: "blue" },
        { title: "3. Trim", text: "Top-p drops the unlikely tail.", tone: "orange" },
        { title: "4. Pick and repeat", text: "One token is sampled, appended, and the loop restarts.", tone: "green" },
      ] },
    },
  ],
};
