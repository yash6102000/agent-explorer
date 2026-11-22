import type { Lesson } from "../types";

export const costLatency: Lesson = {
  id: "cost-latency",
  title: "Cost, Latency & Caching",
  summary: "Tokens are the bill and the wait. Learn the levers.",
  goals: ["Input vs output tokens", "Where cost hides", "Caching, routing and batching", "Latency budgets"],
  nodes: [
    { id: "req", icon: "laptop", label: "Request", sub: "user asks", x: 90, y: 150, tone: "green" },
    { id: "cache", icon: "rack", label: "Cache", sub: "seen this before?", x: 310, y: 150, tone: "blue" },
    { id: "router", icon: "layers", label: "Router", sub: "pick a model size", x: 520, y: 150, tone: "orange" },
    { id: "model", icon: "tower", label: "Model", sub: "generates tokens", x: 720, y: 150, tone: "violet" },
  ],
  links: [{ a: "req", b: "cache" }, { a: "cache", b: "router" }, { a: "router", b: "model" }],
  steps: [
    {
      short: "Tokens", chapter: "problem", title: "Tokens are the bill",
      body: [
        "Hosted models charge per **token** (a small chunk of text). Input and output are priced separately, and output usually costs more per token.",
        "Output is also slower: the model writes it one token at a time.",
      ],
      callout: { kind: "insight", text: "Cost and wait both grow with token count." },
      show: ["req", "model"], focus: ["model"], flows: [{ from: "req", to: "model", label: "tokens" }],
      data: { title: "One request (illustrative)", data: { input_tokens: 2000, output_tokens: 300, input_price: "lower per token", output_price: "higher per token" } },
    },
    {
      short: "Model size", chapter: "solution", title: "Model size and volume set the baseline",
      body: [
        "A larger model costs more per token. Multiply by requests per day and a small price becomes a large monthly bill.",
        "Try it. Prices here are **illustrative**, not real.",
      ],
      show: ["req", "model"], focus: ["model"],
      panel: { kind: "cost", controls: ["model", "volume"], model: "large", requestsPerDay: 10000, inTokens: 1500, outTokens: 300 },
      data: { title: "Cost formula", data: { monthly: "requests x (in x in_price + out x out_price) x 30" } },
    },
    {
      short: "Hidden cost", chapter: "technique", title: "Where cost hides",
      body: [
        "The bill is rarely the question alone. Long context, big retrieved sets, retries and agent loops each add tokens that nobody typed.",
        "An agent that loops ten times pays for the growing history ten times.",
      ],
      callout: { kind: "warn", text: "Track tokens per request, not just per day." },
      show: ["req", "cache", "model"], focus: ["model"],
      panel: { kind: "cards", cards: [
        { title: "Long context", text: "Pasting whole documents when a few chunks would do.", tone: "rose" },
        { title: "Retrieval size", text: "Retrieving 20 chunks when 4 answer the question.", tone: "orange" },
        { title: "Agent loops", text: "Each turn resends the history. See Agent Loop.", tone: "violet" },
        { title: "Retries", text: "Failed or malformed output tried again, billed twice.", tone: "blue" },
      ] },
    },
    {
      short: "Caching", chapter: "technique", title: "Cache what repeats",
      body: [
        "**Prompt caching** reuses a stable prefix (system prompt, tools, documents) at lower cost and latency. Put fixed text first, changing text last.",
        "**Response caching** stores whole answers for repeated questions. Slide the hit rate.",
      ],
      callout: { kind: "tip", text: "Any change inside the prefix breaks the cached part." },
      show: ["req", "cache", "model"], focus: ["cache"], flows: [{ from: "req", to: "cache", label: "lookup" }],
      panel: { kind: "cost", controls: ["cache", "tokens"], model: "medium", requestsPerDay: 10000, inTokens: 4000, outTokens: 300, cacheRate: 60 },
      data: { title: "Prompt layout (simplified)", data: { prefix_cached: ["system prompt", "tool definitions", "policy document"], suffix_new: ["user question"] } },
    },
    {
      short: "Routing", chapter: "technique", title: "Send easy work to small models",
      body: [
        "A **router** picks a model per request. Simple questions go to a small, cheap model; hard ones go to a larger one.",
        "Two more levers: **batching** non-urgent jobs, and capping output length.",
      ],
      callout: { kind: "tip", text: "Check routed answers with an eval before trusting the savings." },
      show: ["req", "cache", "router", "model"], focus: ["router"], flows: [{ from: "router", to: "model", label: "easy: small" }],
      panel: { kind: "cards", cards: [
        { title: "Easy", text: "\"What are your hours?\" goes to a small model.", tone: "green" },
        { title: "Hard", text: "A multi-step refund dispute goes to a large model.", tone: "violet" },
        { title: "Batch", text: "Overnight summaries run in bulk for a lower rate.", tone: "blue" },
        { title: "Cap output", text: "Ask for short answers. Output is the pricey part.", tone: "orange" },
      ] },
    },
    {
      short: "Latency", chapter: "technique", title: "Latency is a budget",
      body: [
        "Wait time is roughly **time to first token** plus tokens times speed. **Streaming** shows words as they arrive, so it feels faster even when total time is the same.",
        "Tap each stage to apply its fix. Numbers are illustrative.",
      ],
      show: ["req", "cache", "router", "model"], focus: ["model"],
      panel: { kind: "budget", target: 2000, unit: "ms", stages: [
        { label: "Retrieval", ms: 350, fastMs: 150, fix: "Cache hot queries" },
        { label: "Model first token", ms: 900, fastMs: 400, fix: "Smaller model, cached prefix" },
        { label: "Generation", ms: 1100, fastMs: 800, fix: "Cap output length" },
        { label: "Post-processing", ms: 250, fastMs: 50, fix: "Stream, skip extra pass" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Measure, then pull a lever",
      body: [
        "Set a cost and latency budget per request, alert when you cross it, then pull the cheapest lever first.",
      ],
      callout: { kind: "next", text: "You now have the shipping toolkit. Next: put it to work in your own app." },
      show: ["req", "cache", "router", "model"],
      panel: { kind: "cards", cards: [
        { title: "Shorten", text: "Trim prompts and retrieved sets.", tone: "green" },
        { title: "Cache", text: "Reuse stable prefixes and repeated answers.", tone: "blue" },
        { title: "Route", text: "Small model first for easy cases.", tone: "orange" },
        { title: "Stream", text: "Show output early. See Tracing & Observability to measure.", tone: "violet" },
      ] },
    },
  ],
};
