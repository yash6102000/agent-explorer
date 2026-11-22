import type { Lesson } from "../types";

export const whatIsAgent: Lesson = {
  id: "what-is-agent",
  title: "What is an Agent?",
  summary: "A model that uses tools in a loop to reach a goal.",
  goals: ["The four parts of an agent", "How it differs from a chatbot and a script", "Why agents are useful", "Why more autonomy means more risk"],
  nodes: [
    { id: "goal", icon: "laptop", label: "Goal", sub: "from the user", x: 90, y: 70, tone: "blue" },
    { id: "agent", icon: "tower", label: "Agent", sub: "model + loop", x: 340, y: 150, tone: "rose" },
    { id: "tools", icon: "rack", label: "Tools", sub: "search, files, APIs", x: 560, y: 70, tone: "violet" },
    { id: "result", icon: "chip", label: "Result", sub: "what the tool returned", x: 560, y: 230, tone: "green" },
    { id: "memory", icon: "layers", label: "Memory", sub: "optional notes", x: 90, y: 230, tone: "orange" },
  ],
  links: [{ a: "goal", b: "agent" }, { a: "agent", b: "tools" }, { a: "tools", b: "result" }, { a: "result", b: "agent" }, { a: "agent", b: "memory" }],
  steps: [
    {
      short: "Chatbot", chapter: "problem", title: "A chatbot answers. It cannot act.",
      body: [
        "A plain model takes text in and gives text out. Ask it to book a flight and it can only **describe** how.",
        "It cannot check prices, click buy or notice that a step failed.",
      ],
      callout: { kind: "insight", text: "Answering is not the same as getting something done." },
      show: ["goal", "agent"], focus: ["agent"], flows: [{ from: "goal", to: "agent", label: "question" }],
      data: { title: "Chatbot reply", data: { user: "Find me the cheapest flight to Lisbon next Friday.", reply: "Check a flight search site and compare fares.", did_anything: false } },
    },
    {
      short: "The idea", chapter: "setup", title: "An agent is four things",
      body: [
        "An **agent** is a model that works toward a goal by using tools, again and again, until it is done.",
        "A **tool** is a function the model can ask the program to run, like search or read a file.",
      ],
      show: ["goal", "agent", "tools", "result"], focus: ["agent", "tools"],
      flows: [{ from: "agent", to: "tools", label: "call" }, { from: "tools", to: "result", label: "run" }],
      panel: { kind: "cards", cards: [
        { title: "Model", text: "Reads the situation and decides what to do next.", tone: "rose" },
        { title: "Tools", text: "Ways to look things up or change something.", tone: "violet" },
        { title: "Loop", text: "Act, look at the result, decide again.", tone: "green" },
        { title: "Goal", text: "What counts as done. Without one, it never stops.", tone: "blue" },
      ] },
    },
    {
      short: "A tiny run", chapter: "technique", title: "Watch one small agent work",
      body: [
        "Step through a toy run. The model thinks, picks a tool, reads the result, then decides it has enough to answer.",
      ],
      show: ["goal", "agent", "tools", "result"], focus: ["agent", "tools", "result"],
      flows: [{ from: "agent", to: "tools", label: "search" }, { from: "result", to: "agent", label: "flights" }],
      panel: { kind: "trace", events: [
        { type: "user", label: "goal", text: "Cheapest flight to Lisbon next Friday?" },
        { type: "think", text: "I need live fares. I should search, not guess." },
        { type: "tool", label: "search_flights", text: "to: Lisbon, date: next Friday" },
        { type: "result", text: "3 fares found: 212, 187, 240 (toy numbers)." },
        { type: "think", text: "187 is the lowest. That answers the goal." },
        { type: "agent", label: "answer", text: "The cheapest is 187, found in a live search." },
      ] },
    },
    {
      short: "Vs script", chapter: "insight", title: "A script follows steps. An agent chooses.",
      body: [
        "A script runs the steps its author wrote, in that order. An agent **picks the next step itself** based on what it just saw.",
        "That is why it can handle a surprise, and why you cannot predict its exact path.",
      ],
      show: ["goal", "agent", "tools", "result"], focus: ["agent"],
      panel: { kind: "cards", cards: [
        { title: "Chatbot", text: "Answers in one go. No tools, no actions.", tone: "blue" },
        { title: "Script", text: "Fixed steps. Predictable, but breaks on the unexpected.", tone: "gray" },
        { title: "Agent", text: "Model decides each step. Flexible, less predictable.", tone: "rose" },
      ] },
    },
    {
      short: "Risk", chapter: "tradeoff", title: "More autonomy, more ways to fail",
      body: [
        "Agents help with open-ended work: research, coding, booking, cleanup. Each extra step also adds a **chance for error**, cost and delay.",
        "A wrong answer is annoying. A wrong **action**, like deleting a file, is harder to undo.",
      ],
      callout: { kind: "warn", text: "Give an agent only the tools and freedom the task needs." },
      show: ["goal", "agent", "tools", "result", "memory"], focus: ["agent", "tools"],
      panel: { kind: "cards", cards: [
        { title: "Useful for", text: "Tasks where the steps are not known in advance.", tone: "green" },
        { title: "Errors compound", text: "One bad step can feed every step after it.", tone: "orange" },
        { title: "Real side effects", text: "Tools can send, spend or delete. Mistakes cost more.", tone: "rose" },
        { title: "Cost and time", text: "Every loop is another model call.", tone: "violet" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Model, tools, loop, goal",
      body: [
        "An agent is a model that acts through tools in a loop toward a goal. It chooses its own steps, which is its strength and its risk.",
        "Memory is optional: notes it keeps between steps or sessions.",
      ],
      callout: { kind: "next", text: "Next: Workflows vs Agents. When should the model decide?" },
      show: ["goal", "agent", "tools", "result", "memory"],
      data: { title: "Agent in one object (simplified)", data: { model: "an LLM", tools: ["search_flights", "read_file"], loop: "act, observe, repeat", goal: "cheapest flight to Lisbon", memory: "optional" } },
    },
  ],
};
