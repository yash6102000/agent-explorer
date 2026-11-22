import type { Lesson } from "../types";

export const structuredOutput: Lesson = {
  id: "structured-output",
  title: "Structured Outputs",
  summary: "Get JSON your code can trust, then validate it anyway.",
  goals: ["Why free text breaks code", "Schemas and how to enforce them", "Validate and retry", "Schema design that helps"],
  nodes: [
    { id: "prompt", icon: "docs", label: "Prompt + schema", sub: "text and the shape", x: 90, y: 90, tone: "green" },
    { id: "model", icon: "tower", label: "Model", sub: "writes the JSON", x: 380, y: 90, tone: "violet" },
    { id: "validator", icon: "layers", label: "Validator", sub: "checks the schema", x: 380, y: 230, tone: "orange" },
    { id: "code", icon: "laptop", label: "Your code", sub: "uses typed data", x: 700, y: 230, tone: "blue" },
  ],
  links: [{ a: "prompt", b: "model" }, { a: "model", b: "validator" }, { a: "validator", b: "code" }],
  steps: [
    {
      short: "Free text", chapter: "problem", title: "Code cannot parse a friendly reply",
      body: [
        "Ask a model to pull details from an email and you get a sentence. Your code needs fields, not prose.",
        "Parsing prose with string tricks breaks the first time the wording changes.",
      ],
      callout: { kind: "warn", text: "Every extra word the model adds is something your code must guess around." },
      show: ["prompt", "model"], focus: ["model"], flows: [{ from: "prompt", to: "model", label: "email" }],
      data: { title: "Model reply (free text)", data: { text: "Sure! The order is 4821 and the customer wants a refund, I think. They sound upset." } },
    },
    {
      short: "Schema", chapter: "setup", title: "Describe the shape with a schema",
      body: [
        "A **schema** says which fields exist, their types, and which values are allowed. **JSON** is the plain-text format for that data.",
        "Send the schema along with the prompt. The model fills it in.",
      ],
      show: ["prompt", "model"], focus: ["prompt"], flows: [{ from: "prompt", to: "model", label: "schema" }],
      data: { title: "Schema (JSON Schema style, simplified)", data: {
        type: "object",
        properties: {
          order_id: { type: ["string", "null"], description: "Order number, or null if absent" },
          intent: { enum: ["refund", "status", "other", "unknown"] },
          urgent: { type: "boolean" },
        },
        required: ["order_id", "intent", "urgent"],
      } },
    },
    {
      short: "Enforce", chapter: "technique", title: "Four ways to enforce it",
      body: [
        "They differ in how strongly they guarantee the shape. Stronger options constrain the model while it writes.",
        "A tool call is also a structured output. See Tool Calling for the wire format.",
      ],
      show: ["prompt", "model"], focus: ["model"],
      panel: { kind: "cards", cards: [
        { title: "Ask in the prompt", text: "\"Reply with JSON like this.\" Works often, no guarantee.", tone: "rose" },
        { title: "JSON mode", text: "Output is valid JSON, but fields and types can still be wrong.", tone: "orange" },
        { title: "Schema-constrained", text: "Decoding only allows tokens that fit the schema. Shape is guaranteed.", tone: "green" },
        { title: "Tool call", text: "Define a tool whose arguments are your schema. Take the arguments.", tone: "violet" },
      ] },
    },
    {
      short: "Validate", chapter: "technique", title: "Always validate, then retry",
      body: [
        "Even with enforcement, check the result in code. Output can be cut off, refused, or valid in shape but wrong in value.",
        "On failure, send the error back and ask again. Cap retries at two or three.",
      ],
      callout: { kind: "tip", text: "Feeding the exact error back fixes most failures on the next try." },
      show: ["prompt", "model", "validator", "code"], focus: ["validator"],
      flows: [{ from: "model", to: "validator", label: "JSON" }, { from: "validator", to: "model", label: "error" }],
      data: { title: "Invalid output and the error fed back", data: {
        model_output: { order_id: 4821, intent: "angry", urgent: "yes" },
        validator_errors: [
          "order_id: expected string, got number",
          "intent: must be one of refund, status, other, unknown",
          "urgent: expected boolean, got string",
        ],
        retry_message: "Your JSON failed validation. Fix these errors and return only JSON.",
      } },
    },
    {
      short: "Schema design", chapter: "insight", title: "Design schemas the model can follow",
      body: [
        "Keep schemas **small**. Use **enums** for fixed choices. Add a short **description** to each field.",
        "Allow `null` or `\"unknown\"`. Otherwise the model is forced to guess a value.",
      ],
      callout: { kind: "insight", text: "A required field with no valid answer invites a made-up one." },
      show: ["prompt", "model", "validator", "code"], focus: ["prompt"],
      panel: { kind: "cards", cards: [
        { title: "Small", text: "Ask only for fields you will use. Fewer fields, fewer errors.", tone: "green" },
        { title: "Enums", text: "\"intent\": refund, status, other, unknown. Not free text.", tone: "violet" },
        { title: "Descriptions", text: "\"Order number, or null if absent.\" Tells the model what you mean.", tone: "blue" },
        { title: "Room to say no", text: "null or \"unknown\" beats an invented answer.", tone: "orange" },
      ] },
    },
    {
      short: "Edge cases", chapter: "recap", title: "A good run, and what can still go wrong",
      body: [
        "A valid result is typed data your code can use. Plan for the edge cases too: a **refusal** (the model declines, so no JSON) and **truncation** (output hits the length limit mid-object).",
        "Treat both as failures: check the stop reason, then retry or fall back.",
      ],
      callout: { kind: "next", text: "Next: measure how often it works. See Evals & LLM-as-Judge." },
      show: ["prompt", "model", "validator", "code"], focus: ["code"],
      flows: [{ from: "validator", to: "code", label: "typed data" }],
      data: { title: "Valid output", data: { order_id: "4821", intent: "refund", urgent: false, _checks: { schema: "pass", stop_reason: "end_of_output" } } },
    },
  ],
};
