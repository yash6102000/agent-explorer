import type { Lesson } from "../types";

export const toolCalling: Lesson = {
  id: "tool-calling",
  title: "Tool Calling",
  summary: "The model asks, your app acts, and the result goes back.",
  goals: ["Why a model cannot run code itself", "What a tool definition, call and result look like", "Returning errors so the model can recover", "Parallel calls and validating arguments"],
  nodes: [
    { id: "app", icon: "laptop", label: "Your app", sub: "runs the code", x: 90, y: 150, tone: "green" },
    { id: "model", icon: "chip", label: "Model", sub: "only writes text", x: 400, y: 150, tone: "violet" },
    { id: "tool", icon: "rack", label: "Tool", sub: "API, database, code", x: 710, y: 150, tone: "orange" },
  ],
  links: [{ a: "app", b: "model" }, { a: "app", b: "tool" }],
  steps: [
    {
      short: "Problem", chapter: "problem", title: "A model can only write text",
      body: [
        "A language model cannot check the weather, query a database or send an email. It only produces text.",
        "Ask it for today's weather and it can only guess.",
      ],
      callout: { kind: "insight", text: "Models have no hands. Your app supplies them." },
      show: ["app", "model"], focus: ["model"], flows: [{ from: "app", to: "model", label: "question" }],
      data: { title: "Without tools (simplified)", data: { user: "What's the weather in Paris right now?", model: "I can't see live data, but Paris is often mild in spring..." } },
    },
    {
      short: "Idea", chapter: "solution", title: "The model asks, your app acts",
      body: [
        "**Tool calling** lets the model reply with a structured request instead of prose: a tool name plus JSON arguments.",
        "Your app runs the tool, sends back the result, and the model continues. The model never executes anything itself.",
      ],
      callout: { kind: "insight", text: "A tool call is a request, not an action." },
      show: ["app", "model", "tool"], focus: ["app", "model", "tool"],
      flows: [{ from: "model", to: "app", label: "tool call" }, { from: "app", to: "tool", label: "run" }],
      panel: { kind: "cards", cards: [
        { title: "1. Ask", text: "Model emits a tool name and JSON arguments.", tone: "violet" },
        { title: "2. Run", text: "Your app executes the real function.", tone: "green" },
        { title: "3. Return", text: "App sends the result back as a message.", tone: "orange" },
        { title: "4. Answer", text: "Model uses the result to reply.", tone: "blue" },
      ] },
    },
    {
      short: "Definition", chapter: "setup", title: "You describe each tool up front",
      body: [
        "Each request includes tool **definitions**: a name, a plain-language description, and a **JSON schema** (a formal description of the allowed arguments).",
        "This is all the model knows about the tool. It decides what to call from these words alone.",
      ],
      callout: { kind: "tip", text: "Treat the description like a prompt. Say when to use it and when not to." },
      show: ["app", "model", "tool"], focus: ["app", "model"], flows: [{ from: "app", to: "model", label: "tool list" }],
      data: { title: "Tool definition (simplified)", data: {
        name: "get_weather",
        description: "Current weather for a city. Use for live conditions, not forecasts.",
        input_schema: { type: "object", properties: { city: { type: "string", description: "City name, e.g. Paris" }, unit: { type: "string", enum: ["celsius", "fahrenheit"] } }, required: ["city"] },
      } },
    },
    {
      short: "The loop", chapter: "technique", title: "One call, step by step",
      body: [
        "Step through a full round trip. The model's tool call is just a message. Your app does the work and replies with a **tool result** message.",
        "Then the model reads the result and writes the final answer.",
      ],
      show: ["app", "model", "tool"], focus: ["app", "model", "tool"],
      flows: [{ from: "model", to: "app", label: "tool call" }, { from: "app", to: "tool", label: "run" }, { from: "tool", to: "app", label: "result" }],
      panel: { kind: "trace", events: [
        { type: "user", text: "What's the weather in Paris?" },
        { type: "agent", label: "tool call", text: "Model requests get_weather with city = Paris. It runs nothing." },
        { type: "tool", label: "get_weather", text: "Your app calls the real weather API." },
        { type: "result", text: "API returns 14 C, light rain. App sends it back as a tool result." },
        { type: "agent", label: "answer", text: "It's 14 C with light rain in Paris. Take an umbrella." },
      ] },
      data: { title: "The two messages (simplified)", data: {
        assistant: { tool_call: { id: "call_1", name: "get_weather", arguments: { city: "Paris", unit: "celsius" } } },
        tool_result: { tool_call_id: "call_1", content: { temp_c: 14, conditions: "light rain" } },
      } },
    },
    {
      short: "Errors", chapter: "technique", title: "Return errors as results",
      body: [
        "Tools fail: bad input, timeouts, missing records. Do not crash the loop. Send the error back as the tool result.",
        "A clear message lets the model fix its arguments and retry, or explain the problem to the user.",
      ],
      callout: { kind: "tip", text: "Say what went wrong and how to fix it, not just \"error\"." },
      show: ["app", "model", "tool"], focus: ["app", "tool"], flows: [{ from: "tool", to: "app", label: "error" }, { from: "app", to: "model", label: "error text" }],
      data: { title: "Error as a result (simplified)", data: {
        tool_result: { tool_call_id: "call_2", is_error: true, content: "City 'Pariss' not found. Did you mean 'Paris'? Check the spelling and retry." },
        next: "Model calls get_weather again with city = Paris",
      } },
    },
    {
      short: "Parallel", chapter: "technique", title: "Independent calls can run together",
      body: [
        "Some models can request **several tool calls in one turn**. If they do not depend on each other, your app can run them at once.",
        "Each result carries the call's id, so the model knows which answer belongs to which request.",
      ],
      show: ["app", "model", "tool"], focus: ["app", "tool"],
      flows: [{ from: "model", to: "app", label: "2 calls" }, { from: "app", to: "tool", label: "run both" }],
      data: { title: "Parallel calls (simplified)", data: {
        assistant: { tool_calls: [
          { id: "call_3", name: "get_weather", arguments: { city: "Paris" } },
          { id: "call_4", name: "get_weather", arguments: { city: "Rome" } },
        ] },
        tool_results: [{ tool_call_id: "call_3", content: "14 C, rain" }, { tool_call_id: "call_4", content: "21 C, sun" }],
      } },
    },
    {
      short: "Validate", chapter: "tradeoff", title: "Never trust tool arguments blindly",
      body: [
        "The arguments are model output, shaped by whatever text it read. They can be wrong, or even steered by an attacker.",
        "Validate them against the schema, check permissions, and confirm risky actions like deleting data or spending money.",
      ],
      callout: { kind: "next", text: "Next: MCP, a standard way to plug tools into any app." },
      show: ["app", "model", "tool"], focus: ["app"],
      panel: { kind: "cards", cards: [
        { title: "Check the shape", text: "Reject arguments that break the schema: wrong type, missing field.", tone: "blue" },
        { title: "Check the value", text: "Is that file path or record id one this user may touch?", tone: "orange" },
        { title: "Gate risky actions", text: "Ask a human before irreversible or costly calls.", tone: "rose" },
        { title: "Describe well", text: "Clear names and descriptions prevent most wrong calls.", tone: "green" },
      ] },
    },
  ],
};
