import type { Lesson } from "../types";

const animal = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "tired"];
const animalW = [
  [0.30, 0.50, 0.05, 0.02, 0.02, 0.03, 0.02, 0.02, 0.02, 0.02],
  [0.10, 0.35, 0.15, 0.10, 0.03, 0.07, 0.05, 0.05, 0.02, 0.08],
  [0.03, 0.30, 0.20, 0.30, 0.02, 0.05, 0.03, 0.03, 0.02, 0.02],
  [0.03, 0.20, 0.20, 0.15, 0.05, 0.30, 0.03, 0.02, 0.01, 0.01],
  [0.02, 0.03, 0.02, 0.10, 0.20, 0.55, 0.02, 0.02, 0.02, 0.02],
  [0.02, 0.05, 0.05, 0.25, 0.28, 0.20, 0.05, 0.03, 0.03, 0.04],
  [0.02, 0.12, 0.15, 0.18, 0.02, 0.10, 0.20, 0.08, 0.05, 0.08],
  [0.02, 0.58, 0.03, 0.03, 0.01, 0.06, 0.04, 0.08, 0.05, 0.10],
  [0.02, 0.15, 0.02, 0.02, 0.01, 0.02, 0.05, 0.40, 0.11, 0.20],
  [0.02, 0.28, 0.02, 0.02, 0.01, 0.02, 0.05, 0.28, 0.10, 0.20],
];

const river = ["She", "sat", "on", "the", "river", "bank"];
const riverW = [
  [0.35, 0.40, 0.05, 0.05, 0.07, 0.08],
  [0.40, 0.25, 0.15, 0.03, 0.05, 0.12],
  [0.05, 0.30, 0.20, 0.15, 0.10, 0.20],
  [0.03, 0.05, 0.20, 0.20, 0.22, 0.30],
  [0.03, 0.05, 0.07, 0.30, 0.35, 0.20],
  [0.04, 0.10, 0.08, 0.08, 0.62, 0.08],
];

export const attention: Lesson = {
  id: "attention",
  title: "Attention, in One Picture",
  summary: "Each word looks at every other word to work out its meaning.",
  goals: ["Why order and context change meaning", "What attention does, in plain terms", "How stacked layers refine meaning", "Why long inputs cost more"],
  nodes: [
    { id: "tokens", icon: "laptop", label: "Tokens", sub: "the input text", x: 90, y: 150, tone: "ink" },
    { id: "layers", icon: "layers", label: "Attention layers", sub: "words look at words", x: 310, y: 150, tone: "violet" },
    { id: "meaning", icon: "chip", label: "Contextual meaning", sub: "one vector per token", x: 520, y: 150, tone: "blue" },
    { id: "head", icon: "tower", label: "Next-token head", sub: "scores what comes next", x: 720, y: 150, tone: "orange" },
  ],
  links: [{ a: "tokens", b: "layers" }, { a: "layers", b: "meaning" }, { a: "meaning", b: "head" }],
  steps: [
    {
      short: "Context", chapter: "problem", title: "The same word can mean different things",
      body: [
        "\"Bank\" means something different in \"river bank\" and \"bank account\". A model that reads each word alone cannot tell which one you mean.",
        "Meaning comes from the **context**: the words around it.",
      ],
      callout: { kind: "insight", text: "Order and neighbours decide meaning. \"Dog bites man\" is not \"man bites dog\"." },
      show: ["tokens"], focus: ["tokens"],
      panel: { kind: "cards", cards: [
        { title: "She sat on the river bank", text: "bank = the side of a river", tone: "green" },
        { title: "She went to the bank to deposit money", text: "bank = a place for money", tone: "blue" },
      ] },
      data: { title: "Same token, two meanings", data: { token: "bank", contexts: ["river bank", "bank account"] } },
    },
    {
      short: "Look around", chapter: "solution", title: "Attention: every word looks at every word",
      body: [
        "**Attention** lets each token look at all the other tokens and decide how much each one matters to it. Higher weight means \"pay more attention here\".",
        "Click \"bank\" and see which word it leans on.",
      ],
      show: ["tokens", "layers"], focus: ["layers"], flows: [{ from: "tokens", to: "layers", label: "tokens" }],
      panel: { kind: "attention", tokens: river, weights: riverW, focus: 5, note: "Toy weights for illustration. \"bank\" leans on \"river\", so it reads as a riverside." },
      data: { title: "Attention weights for \"bank\" (toy)", data: { token: "bank", looks_at: { river: 0.62, bank: 0.08, the: 0.08, on: 0.08, sat: 0.1, She: 0.04 } } },
    },
    {
      short: "Pronouns", chapter: "technique", title: "Attention resolves what \"it\" refers to",
      body: [
        "In \"The animal didn't cross the street because it was tired\", what is tired? Humans see it is the animal.",
        "Click \"it\". Attention puts most weight on \"animal\", linking the two.",
      ],
      callout: { kind: "tip", text: "Weights are learned from data during training, not written by hand." },
      show: ["tokens", "layers"], focus: ["layers"],
      panel: { kind: "attention", tokens: animal, weights: animalW, focus: 7, note: "Toy weights. Each row adds up to 1, spread over the sentence." },
      data: { title: "Attention weights for \"it\" (toy)", data: { token: "it", top: [{ token: "animal", weight: 0.58 }, { token: "tired", weight: 0.1 }, { token: "it", weight: 0.08 }] } },
    },
    {
      short: "Transformer", chapter: "insight", title: "This is the heart of the transformer",
      body: [
        "A **transformer** is the model design behind modern LLMs. Its key part is attention, run by many \"heads\" at once, each free to track a different kind of link.",
        "Because all tokens are handled together, it trains well on lots of hardware.",
      ],
      show: ["tokens", "layers", "meaning"], focus: ["layers", "meaning"], flows: [{ from: "layers", to: "meaning", label: "refined" }],
      data: { title: "Transformer block (simplified)", data: { parts: ["attention (tokens look at tokens)", "feed-forward network (per-token processing)"], repeated: "many times, stacked" } },
    },
    {
      short: "Layers", chapter: "technique", title: "Stacked layers refine meaning",
      body: [
        "One round of attention is not enough. Models stack **many layers**, each updating every token's vector using what it just learned from the others.",
        "Early layers tend to catch simple patterns, later ones richer meaning. This is a loose rule of thumb.",
      ],
      callout: { kind: "insight", text: "After the last layer, each token's vector carries its meaning in context." },
      show: ["tokens", "layers", "meaning", "head"], focus: ["meaning", "head"], flows: [{ from: "meaning", to: "head", label: "last token" }],
      panel: { kind: "cards", cards: [
        { title: "Layer 1", text: "\"bank\" is just the word bank, with a little neighbour info.", tone: "gray" },
        { title: "Middle layers", text: "It mixes in \"river\" and \"sat\". The riverside sense wins.", tone: "violet" },
        { title: "Final layer", text: "The last token's vector is used to score the next token.", tone: "orange" },
      ] },
    },
    {
      short: "Cost", chapter: "tradeoff", title: "Long inputs cost more",
      body: [
        "If every token looks at every other token, doubling the input roughly **quadruples** the attention work. That is why long contexts are slower and pricier.",
        "Engineering tricks soften this, but the pressure stays.",
      ],
      callout: { kind: "warn", text: "More context is not free. Send what the model needs, not everything." },
      metrics: [{ label: "10 tokens", value: "100 pairs" }, { label: "100 tokens", value: "10,000 pairs" }, { label: "Doubling input", value: "about 4x work" }],
      show: ["tokens", "layers", "meaning", "head"], focus: ["layers"],
      data: { title: "Pairs to compare (simplified)", data: { tokens: [10, 100, 1000], pairs: [100, 10000, 1000000] } },
    },
    {
      short: "Recap", chapter: "recap", title: "Attention in four lines",
      body: ["Attention is how a model uses context to understand each word before it predicts the next one."],
      callout: { kind: "next", text: "Next: next-token prediction, how the model picks each word it writes." },
      show: ["tokens", "layers", "meaning", "head"],
      panel: { kind: "cards", cards: [
        { title: "Look", text: "Each token weighs every other token.", tone: "violet" },
        { title: "Mix", text: "It blends in the ones that matter, like \"it\" with \"animal\".", tone: "blue" },
        { title: "Stack", text: "Many layers refine meaning step by step.", tone: "green" },
        { title: "Predict", text: "The final vector scores the next token.", tone: "orange" },
      ] },
    },
  ],
};
