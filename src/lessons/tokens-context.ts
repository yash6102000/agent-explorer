import type { Lesson } from "../types";

export const tokensContext: Lesson = {
  id: "tokens-context",
  title: "Tokens & the Context Window",
  summary: "How a model reads text, and why its memory is a fixed-size window.",
  goals: ["What a token is", "Why prompts are measured in tokens", "What fills the context window", "What to do when it overflows"],
  nodes: [
    { id: "text", icon: "laptop", label: "Your text", sub: "characters", x: 90, y: 110, tone: "blue" },
    { id: "tokenizer", icon: "chunker", label: "Tokenizer", sub: "text → token ids", x: 290, y: 110, tone: "green" },
    { id: "window", icon: "layers", label: "Context window", sub: "fixed token budget", x: 500, y: 110, tone: "orange" },
    { id: "model", icon: "tower", label: "LLM", sub: "predicts next token", x: 700, y: 110, tone: "rose" },
  ],
  zones: [
    { label: "Your side", sub: "plain text", ids: ["text", "tokenizer"], tone: "blue" },
    { label: "Model side", sub: "fixed-size memory", ids: ["window", "model"], tone: "rose" },
  ],
  links: [{ a: "text", b: "tokenizer" }, { a: "tokenizer", b: "window" }, { a: "window", b: "model" }],
  steps: [
    {
      short: "Tokens", chapter: "problem", title: "Models don't read words. They read tokens.",
      body: [
        "Before a model sees your text, a **tokenizer** chops it into pieces called **tokens**. A token is often a whole common word, but rare or long words split into several.",
        "Type your own text below and watch it break apart. Hover a chip to see its id.",
      ],
      callout: { kind: "insight", text: "Rule of thumb: 1 token ≈ 4 characters of English, or about ¾ of a word. Other languages and code usually need more." },
      show: ["text", "tokenizer"], focus: ["tokenizer"], flows: [{ from: "text", to: "tokenizer", label: "text" }],
      panel: { kind: "tokens" },
      data: { title: "Tokenizer output (toy)", data: { input: "Retrieval-augmented generation", tokens: ["Retrieval", "-", "augment", "ed", " generation"], ids: [30211, 12, 8841, 276, 4410] } },
    },
    {
      short: "IDs", chapter: "technique", title: "Tokens become numbers",
      body: [
        "Each token maps to an integer id in the model's fixed **vocabulary** (typically 50k to 250k entries). The model only ever sees those integers.",
        "It then predicts a probability for **every token in the vocabulary** as the next one, picks one, appends it and repeats. That is all generation is.",
      ],
      callout: { kind: "tip", text: "Because the model works on tokens, it can't easily count letters in a word or reverse a string. It never saw the letters." },
      show: ["text", "tokenizer", "model"], focus: ["model"], flows: [{ from: "tokenizer", to: "model", label: "ids" }],
      panel: { kind: "tokens" },
      data: { title: "What the model receives", data: { input_ids: [30211, 12, 8841, 276, 4410], next_token_probs: { " is": 0.31, " (": 0.12, " models": 0.09, "…": "50k more" } } },
    },
    {
      short: "Why it matters", chapter: "insight", title: "Tokens are the unit of cost, speed and limits",
      body: ["Everything about using a model is counted in tokens, not words or requests."],
      show: ["text", "tokenizer", "window", "model"],
      panel: { kind: "cards", cards: [
        { title: "Cost", text: "You pay per input token and per output token. Output usually costs several times more.", tone: "orange" },
        { title: "Speed", text: "Output is generated one token at a time, so long answers take longer.", tone: "blue" },
        { title: "Limits", text: "Each model has a maximum number of tokens it can hold at once: the context window.", tone: "rose" },
      ] },
    },
    {
      short: "The window", chapter: "technique", title: "The context window is the model's whole memory",
      body: [
        "The **context window** is the maximum tokens the model can consider in one request: the system prompt, tool definitions, the whole conversation so far, and room for its answer.",
        "Slide the conversation length. The model has **no memory** beyond what is in this window.",
      ],
      callout: { kind: "warn", text: "This demo uses an 8k window so you can see it fill. Real models range from 8k to over a million tokens." },
      show: ["text", "tokenizer", "window", "model"], focus: ["window"], flows: [{ from: "window", to: "model", label: "everything" }],
      panel: { kind: "window", turns: 6, interactive: true },
      data: { title: "Request size", data: { system_prompt_tokens: 800, tools_tokens: 600, history_tokens: "turns × ~420", max_output_tokens: 1000, context_limit: 8192 } },
    },
    {
      short: "Resending", chapter: "insight", title: "Every turn re-sends the entire history",
      body: [
        "Chat feels like a continuing conversation, but each turn is a **fresh request** carrying everything said so far.",
        "So the tokens processed grow much faster than the text you write. Drag the slider to 10 turns and compare the two numbers.",
      ],
      callout: { kind: "tip", text: "Prompt caching can make repeated prefixes cheaper, but the tokens still occupy the window." },
      show: ["text", "tokenizer", "window", "model"], focus: ["window"],
      panel: { kind: "window", turns: 10, interactive: true },
    },
    {
      short: "Overflow", chapter: "tradeoff", title: "What happens when the window is full",
      body: ["Push the slider past 13 turns on the previous step and the budget is gone. You have four options."],
      show: ["text", "tokenizer", "window", "model"],
      panel: { kind: "cards", cards: [
        { title: "Truncate", text: "Drop the oldest messages. Simple, but the model forgets early instructions and facts.", tone: "rose" },
        { title: "Summarize (compaction)", text: "Replace old turns with a short summary. Keeps the gist, loses detail.", tone: "orange" },
        { title: "Retrieve (RAG)", text: "Keep knowledge outside the window and fetch only the relevant pieces per question.", tone: "green" },
        { title: "Bigger window", text: "Costs more and slows down; very long contexts can also dilute attention.", tone: "blue" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Recap",
      body: [
        "**Tokens** are the pieces of text a model reads and writes.",
        "The **context window** is a fixed token budget holding the system prompt, tools, history and the answer.",
        "The whole prompt is resent every turn, so long chats get expensive and eventually overflow.",
      ],
      callout: { kind: "next", text: "Next: embeddings, how text becomes numbers that capture meaning." },
      show: ["text", "tokenizer", "window", "model"],
      panel: { kind: "cards", cards: [
        { title: "Token", text: "≈ ¾ of a word. The unit of cost and limits.", tone: "green" },
        { title: "Window", text: "Fixed budget. No memory outside it.", tone: "orange" },
        { title: "Overflow fixes", text: "Truncate, compact, retrieve or enlarge.", tone: "rose" },
      ] },
    },
  ],
};
