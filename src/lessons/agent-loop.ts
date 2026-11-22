import type { Lesson } from "../types";

export const agentLoop: Lesson = {
  id: "agent-loop",
  title: "The Agent Loop",
  summary: "Observe, think, act, repeat, and how the loop stops.",
  goals: ["The observe, think, act cycle", "Why context grows every turn", "How a loop decides to stop", "How loops go wrong and the guards"],
  nodes: [
    { id: "model", icon: "tower", label: "Model", sub: "thinks, picks an action", x: 340, y: 60, tone: "rose" },
    { id: "tool", icon: "rack", label: "Tool", sub: "runs the action", x: 600, y: 150, tone: "violet" },
    { id: "obs", icon: "chip", label: "Observation", sub: "the tool's result", x: 340, y: 240, tone: "green" },
    { id: "ctx", icon: "layers", label: "Context", sub: "everything so far", x: 90, y: 150, tone: "orange" },
  ],
  links: [{ a: "model", b: "tool" }, { a: "tool", b: "obs" }, { a: "obs", b: "ctx" }, { a: "ctx", b: "model" }],
  steps: [
    {
      short: "The cycle", chapter: "setup", title: "Observe, think, act, repeat",
      body: [
        "An agent runs a **loop**. It looks at what it knows, thinks, takes one action, then looks at the result.",
        "Each pass is one **turn**. The model makes one decision per turn, never the whole plan at once.",
      ],
      show: ["model", "tool", "obs"], focus: ["model"],
      flows: [{ from: "model", to: "tool", label: "action" }, { from: "tool", to: "obs", label: "result" }],
      data: { title: "One turn (simplified)", data: { observe: "tests failed: 2 errors", think: "open the file named in the error", act: { tool: "read_file", args: { path: "app.py" } } } },
    },
    {
      short: "Normal run", chapter: "technique", title: "A run that ends well",
      body: [
        "Step through a toy run. Every observation goes back to the model, which uses it to choose the next action.",
      ],
      show: ["model", "tool", "obs", "ctx"], focus: ["model", "tool", "obs"],
      flows: [{ from: "obs", to: "ctx", label: "append" }, { from: "ctx", to: "model", label: "read all" }],
      panel: { kind: "trace", events: [
        { type: "user", label: "goal", text: "Fix the failing test." },
        { type: "think", text: "Run the tests to see the error first." },
        { type: "tool", label: "run_tests", text: "pytest" },
        { type: "result", text: "1 failed: add(2, 3) returned 6, expected 5." },
        { type: "tool", label: "edit_file", text: "Change a * b to a + b in add()." },
        { type: "result", text: "Tests pass." },
        { type: "agent", label: "final answer", text: "Fixed: add() was multiplying. All tests pass now." },
      ] },
    },
    {
      short: "Context", chapter: "technique", title: "Every turn, the model rereads everything",
      body: [
        "The model has no memory between calls. Each turn the program sends the **whole history**: goal, actions and results so far.",
        "So the context grows every turn. Long runs cost more and eventually fill the window.",
      ],
      callout: { kind: "tip", text: "Slide the turns up and watch the window fill." },
      show: ["model", "tool", "obs", "ctx"], focus: ["ctx"],
      panel: { kind: "window", turns: 6, interactive: true },
      data: { title: "What turn 3 sends (simplified)", data: { messages: ["goal", "action 1", "result 1", "action 2", "result 2"], note: "Turn 4 sends all of this plus action 3 and result 3." } },
    },
    {
      short: "Stopping", chapter: "technique", title: "Four ways a loop ends",
      body: [
        "The usual exit is a **final answer**: the model replies without asking for a tool. The program also needs exits the model does not control.",
      ],
      show: ["model", "tool", "obs", "ctx"], focus: ["model"],
      panel: { kind: "cards", cards: [
        { title: "Final answer", text: "The model replies with no tool call. Normal success.", tone: "green" },
        { title: "Step limit", text: "A hard cap on turns, set by the program.", tone: "orange" },
        { title: "Error", text: "A tool crashes or a call is invalid and cannot be recovered.", tone: "rose" },
        { title: "User interrupt", text: "The person hits stop or changes the goal.", tone: "blue" },
      ] },
    },
    {
      short: "Failure", chapter: "insight", title: "Loops can go wrong",
      body: [
        "Models can repeat the same failing action, drift away from the goal, or keep going without ever finishing. Here is a repeat, stopped by a step limit.",
      ],
      callout: { kind: "warn", text: "Never run an agent loop without a hard stop." },
      show: ["model", "tool", "obs", "ctx"], focus: ["model", "obs"],
      panel: { kind: "trace", events: [
        { type: "user", label: "goal", text: "Open the report file." },
        { type: "tool", label: "read_file", text: "path: report.txt" },
        { type: "result", text: "Error: file not found." },
        { type: "tool", label: "read_file", text: "path: report.txt (same call again)" },
        { type: "result", text: "Error: file not found." },
        { type: "tool", label: "read_file", text: "path: report.txt (third time)" },
        { type: "warn", label: "step limit", text: "Reached 10 steps. The program stops the run." },
      ] },
    },
    {
      short: "Guards", chapter: "tradeoff", title: "Guards that keep loops safe",
      body: [
        "Put the guards in code, not in the prompt. The model can ignore a request, but not a hard limit.",
      ],
      show: ["model", "tool", "obs", "ctx"], focus: ["ctx"],
      panel: { kind: "cards", cards: [
        { title: "Max steps", text: "Stop after N turns, whatever the model says.", tone: "orange" },
        { title: "Budget", text: "Cap tokens, money or wall-clock time per run.", tone: "violet" },
        { title: "Repeat detection", text: "Same action and same result twice? Stop or change course.", tone: "rose" },
        { title: "Report, don't hide", text: "On a stop, tell the user what was tried.", tone: "green" },
      ] },
      data: { title: "Loop guards (simplified)", data: { max_steps: 10, max_tokens: 100000, stop_if_repeated: 3, on_stop: "return partial progress" } },
    },
    {
      short: "Recap", chapter: "recap", title: "A loop plus a way to stop",
      body: [
        "The loop is simple: observe, think, act. What makes it safe is a clear finish line and limits the model cannot override.",
      ],
      callout: { kind: "next", text: "Next: tool calling. What an action looks like on the wire." },
      show: ["model", "tool", "obs", "ctx"],
      data: { title: "Loop in pseudocode", data: { while: "steps < max_steps and within budget", do: ["send full history to model", "if model gives final answer: return it", "run the requested tool", "append the result to history"] } },
    },
  ],
};
