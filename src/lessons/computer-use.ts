import type { Lesson } from "../types";

export const computerUse: Lesson = {
  id: "computer-use",
  title: "Computer Use & Browser Agents",
  summary: "Agents that look at a screen and click, like a person would.",
  goals: ["Why some agents use a screen instead of an API", "How the screenshot-and-click loop works", "Where it fails, and why it is slow", "Why it raises the safety stakes"],
  nodes: [
    { id: "model", icon: "tower", label: "Model", sub: "decides the next action", x: 90, y: 150, tone: "rose" },
    { id: "screen", icon: "layers", label: "Screenshot", sub: "what the screen shows", x: 300, y: 70, tone: "violet" },
    { id: "actions", icon: "laptop", label: "Actions", sub: "click, type, scroll", x: 300, y: 230, tone: "orange" },
    { id: "app", icon: "docs", label: "App or website", sub: "no API, only a UI", x: 560, y: 150, tone: "blue" },
  ],
  links: [{ a: "model", b: "screen" }, { a: "model", b: "actions" }, { a: "actions", b: "app" }, { a: "app", b: "screen" }],
  steps: [
    {
      short: "No API", chapter: "problem", title: "Some software has no API",
      body: [
        "Many tools were built for people: old internal apps, airline sites, admin dashboards. They offer buttons, not a clean way for code to call them.",
        "If an agent can only use tools, it cannot touch any of this.",
      ],
      callout: { kind: "insight", text: "The screen is a universal interface: every app has one." },
      show: ["model", "app"], focus: ["app"], flows: [{ from: "model", to: "app", label: "no API?" }],
      data: { title: "The gap", data: { task: "Book the 9:40 train", available: "A website with forms and buttons", api: "none" } },
    },
    {
      short: "The loop", chapter: "solution", title: "Look, decide, act, look again",
      body: [
        "A **computer-use agent** works through a screen. It takes a **screenshot** (an image of the screen), decides what to do, then acts: click, type, scroll.",
        "Then it looks again to see what changed. The loop repeats until the task is done.",
      ],
      show: ["model", "screen", "actions", "app"], focus: ["screen", "actions"],
      flows: [{ from: "app", to: "screen", label: "screenshot" }, { from: "model", to: "actions", label: "click" }, { from: "actions", to: "app", label: "input" }],
      data: { title: "One action (simplified)", data: { observation: "screenshot.png (1280x800)", action: { type: "click", x: 642, y: 388 }, then: "take a new screenshot" } },
    },
    {
      short: "vs tools", chapter: "technique", title: "How it differs from tool calling",
      body: [
        "A normal tool call returns clean text or JSON. Here the model gets **pixels**, so it must read the page visually and name **coordinates** to click.",
        "Each step needs a fresh image and a model call. The agent loop is the same; the senses are not.",
      ],
      callout: { kind: "tip", text: "If a tool or API exists, use it. The screen is the fallback." },
      show: ["model", "screen", "actions", "app"], focus: ["model"],
      panel: { kind: "cards", cards: [
        { title: "Tool call", text: "Structured input and output. Fast, exact, easy to check.", tone: "green" },
        { title: "Screen control", text: "Image in, coordinates out. Slower, and less precise.", tone: "orange" },
        { title: "Same loop", text: "Think, act, observe. Only the observation is an image.", tone: "violet" },
      ] },
    },
    {
      short: "A run", chapter: "technique", title: "A booking, and a surprise pop-up",
      body: [
        "Watch one run. The agent does well until a pop-up covers the page. It must notice, deal with it, then continue.",
      ],
      callout: { kind: "insight", text: "Good agents re-check the screen instead of assuming the last click worked." },
      show: ["model", "screen", "actions", "app"], focus: ["screen"],
      panel: { kind: "trace", events: [
        { type: "user", text: "Book the 9:40 train to Leeds for tomorrow." },
        { type: "tool", label: "screenshot", text: "Takes a screenshot of the booking site." },
        { type: "agent", label: "click", text: "Clicks the date field, types tomorrow's date, clicks Search." },
        { type: "warn", label: "pop-up", text: "New screenshot: a cookie banner hides the results." },
        { type: "think", text: "The banner blocks the page. Dismiss it, then pick the 9:40 row." },
        { type: "agent", label: "click", text: "Clicks Reject on the banner, then Select on the 9:40 train." },
        { type: "result", text: "Screenshot shows the checkout page. Stops to ask before paying." },
      ] },
    },
    {
      short: "Failures", chapter: "tradeoff", title: "Why it is slow, costly and fragile",
      body: [
        "Every step is a model call with an image, so runs take seconds per action and use many tokens. A task of fifty clicks adds up.",
        "The page can change under the agent too. Layouts shift, and some barriers, like **captchas** (tests meant to block bots), are built to stop it.",
      ],
      show: ["model", "screen", "actions", "app"], focus: ["app"],
      panel: { kind: "cards", cards: [
        { title: "Misclicks", text: "A button moved or looks like another. Wrong thing gets clicked.", tone: "rose" },
        { title: "Pop-ups", text: "Banners and dialogs cover the target and derail the plan.", tone: "orange" },
        { title: "Layout changes", text: "A redesign or slow load breaks what worked yesterday.", tone: "violet" },
        { title: "Captchas", text: "Designed to stop automation. Usually needs a person.", tone: "blue" },
      ] },
    },
    {
      short: "Safety", chapter: "recap", title: "A screen can click anything",
      body: [
        "On a logged-in screen, the agent can click anything you can: send, buy, delete. And text on the page is **untrusted input** it reads.",
        "So keep it in a sandbox or a limited account, and ask a person before risky clicks.",
      ],
      callout: { kind: "next", text: "Next: Human in the Loop, deciding which actions need approval." },
      show: ["model", "screen", "actions", "app"], focus: ["actions", "app"],
      panel: { kind: "cards", cards: [
        { title: "Broad reach", text: "Anything on a logged-in screen is within the agent's reach.", tone: "rose" },
        { title: "Page text", text: "A web page can contain instructions aimed at the agent.", tone: "orange" },
        { title: "Contain it", text: "Use a throwaway profile or VM, with limited accounts.", tone: "green" },
        { title: "Ask first", text: "Pause before paying, sending or deleting.", tone: "blue" },
      ] },
    },
  ],
};
