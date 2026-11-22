import type { Lesson } from "../types";

export const observability: Lesson = {
  id: "observability",
  title: "Tracing & Observability",
  summary: "Record every request so you can see why an answer went wrong.",
  goals: ["Why print-logging is not enough", "Traces and spans", "What to capture and what to redact", "Alerts, feedback and new eval cases"],
  nodes: [
    { id: "app", icon: "laptop", label: "Your app", sub: "handles a request", x: 90, y: 150, tone: "green" },
    { id: "model", icon: "tower", label: "Model & tools", sub: "retrieval, calls, answer", x: 310, y: 150, tone: "violet" },
    { id: "store", icon: "rack", label: "Trace store", sub: "one record per request", x: 520, y: 150, tone: "blue" },
    { id: "dash", icon: "layers", label: "Dashboard", sub: "search, alerts, replay", x: 720, y: 150, tone: "orange" },
  ],
  links: [{ a: "app", b: "model" }, { a: "model", b: "store" }, { a: "store", b: "dash" }],
  steps: [
    {
      short: "Black box", chapter: "problem", title: "A bad answer, and no idea why",
      body: [
        "A user says the assistant gave a wrong answer. Which chunk was retrieved? Which tool ran? What did the prompt actually look like?",
        "Models are **non-deterministic** (the same input can give different outputs), so you cannot just rerun and hope.",
      ],
      callout: { kind: "insight", text: "If you cannot see what happened, you cannot fix it." },
      show: ["app", "model"], focus: ["model"], flows: [{ from: "app", to: "model", label: "request" }],
      data: { title: "What the user sent", data: { user: "Can I return opened headphones?", reply: "No, opened items cannot be returned.", complaint: "Wrong, policy says 30 days." } },
    },
    {
      short: "Traces", chapter: "solution", title: "A trace records one request end to end",
      body: [
        "A **trace** is the full record of one request: the prompt, retrieved chunks, tool calls, model reply, plus time, tokens and cost.",
        "Plain print-logging scatters this across lines. A trace keeps it together, so you can replay it.",
      ],
      callout: { kind: "tip", text: "Give every request an ID and attach it to everything it touches." },
      show: ["app", "model", "store"], focus: ["store"], flows: [{ from: "model", to: "store", label: "trace" }],
      data: { title: "A trace (simplified)", data: { trace_id: "t_8f21", user: "Can I return opened headphones?", latency_ms: 2140, tokens: { in: 1850, out: 96 }, cost_usd: 0.004, status: "ok" } },
    },
    {
      short: "Spans", chapter: "technique", title: "Spans nest inside the trace",
      body: [
        "Each step is a **span**: a timed piece of work with its own inputs and outputs. Spans nest, so a request holds a retrieval, a tool call and a model call.",
        "Step through one run and watch the answer's evidence appear.",
      ],
      show: ["app", "model", "store"], focus: ["model", "store"],
      panel: { kind: "trace", events: [
        { type: "user", text: "Request t_8f21: Can I return opened headphones?" },
        { type: "tool", label: "span: retrieve", text: "Top 3 chunks fetched in 180 ms. Best match: an old 14-day policy page." },
        { type: "tool", label: "span: lookup_order", text: "Order found. Delivered 9 days ago. 60 ms." },
        { type: "agent", label: "span: model call", text: "Prompt 1,850 tokens in, 96 out. First token at 820 ms." },
        { type: "result", text: "Reply sent. Total 2,140 ms. Cause: retrieval returned a stale page." },
      ] },
      data: { title: "Span tree (simplified)", data: { trace: "t_8f21", spans: [{ name: "retrieve", ms: 180 }, { name: "lookup_order", ms: 60 }, { name: "model_call", ms: 1700 }] } },
    },
    {
      short: "Capture", chapter: "technique", title: "Capture enough, redact the rest",
      body: [
        "Traces hold real user text, so decide what to keep. Store what you need to debug, and mask secrets and personal data before it is written.",
        "See Data Leakage & Privacy for the rules.",
      ],
      callout: { kind: "warn", text: "A trace store is a copy of your users' data. Protect it like one." },
      show: ["app", "model", "store"], focus: ["store"],
      panel: { kind: "cards", cards: [
        { title: "Capture", text: "Prompt, retrieved chunk IDs, tool names and arguments, reply, latency, tokens, cost.", tone: "green" },
        { title: "Link", text: "Attach version of prompt, model and index, so changes can be compared.", tone: "blue" },
        { title: "Redact", text: "Emails, card numbers, API keys. Mask before storing, not after.", tone: "rose" },
        { title: "Feedback", text: "Thumbs up or down saved against the trace ID.", tone: "orange" },
      ] },
    },
    {
      short: "Watch", chapter: "technique", title: "Sample, alert, and watch trends",
      body: [
        "You rarely read every trace. **Sample** some for review, and **alert** on signals: error rate, latency, cost spikes and thumbs-down rate.",
        "Slow drift (answers getting worse over weeks) shows up as a trend, not a crash.",
      ],
      show: ["app", "model", "store", "dash"], focus: ["dash"], flows: [{ from: "store", to: "dash", label: "metrics" }],
      panel: { kind: "cards", cards: [
        { title: "Error rate", text: "Failed calls, timeouts, malformed output.", tone: "rose" },
        { title: "Latency", text: "Slow first token or slow tool.", tone: "orange" },
        { title: "Cost", text: "Spikes from long contexts or looping agents.", tone: "violet" },
        { title: "Quality", text: "Thumbs-down rate and judge scores over time.", tone: "green" },
      ] },
      data: { title: "Alert rule (simplified)", data: { metric: "cost_per_request", window: "1h", threshold: "2x last week", notify: "on-call" } },
    },
    {
      short: "Recap", chapter: "recap", title: "Bad traces become test cases",
      body: [
        "Find the bad trace, fix the cause, then save that input as a new test so it never breaks quietly again.",
      ],
      callout: { kind: "next", text: "Next: Cost, Latency & Caching, to act on what the traces show." },
      show: ["app", "model", "store", "dash"], focus: ["dash"],
      panel: { kind: "cards", cards: [
        { title: "1. Trace", text: "Record each request end to end.", tone: "green" },
        { title: "2. Inspect", text: "Open spans to find the failing step.", tone: "blue" },
        { title: "3. Fix", text: "Update retrieval, prompt or tool.", tone: "orange" },
        { title: "4. Add to evals", text: "Turn the bad case into a regression test. See Evals.", tone: "violet" },
      ] },
    },
  ],
};
