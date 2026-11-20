## 1. Agent Explorer: "Protocol Explorer, but for AI agents"

**Status:** Partly open (a few MCP-only explainers exist; nothing found that covers the whole agent picture). Not started.

### Inspiration
- [Protocol Explorer](https://a2aprotocol.ai/tools/protocol-explorer): 39 animated lessons on network protocols (TCP, HTTP, TLS, DNS). Play and step controls, a network map, a sequence diagram, and a click-to-inspect panel. Scripted and simulated, not live traffic.
- [designed-to-scale](https://designed-to-scale.vercel.app/): "System Design — an interactive course". Not reviewed in detail (page content loads with JavaScript).

### Problem
People learn how AI agents work from long text articles. The ideas are hard to picture: the agent loop, what is inside the context window, what a tool call really looks like, what compaction drops. Seeing it step by step teaches faster than reading.

### Idea
A free, single-page interactive explorer with scripted, step-by-step lessons about how AI agents work.

Each lesson has:
- Play, pause, step forward and back, and speed controls.
- A diagram view (who talks to whom) and a sequence view (messages in order).
- A click-to-inspect panel that shows the real message, such as the JSON of a tool call.
- Light and dark themes, and a layout that works on a phone.

Possible lessons:
1. The agent loop: think, call a tool, observe, repeat.
2. The context window: what is in it at each step, and how it fills up.
3. Compaction: what gets summarized and what gets lost.
4. Tool calling and MCP: the real message flow (`tools/list`, `tools/call`).
5. Subagents: how a parent hands work to a child and gets a result back.
6. Agent-to-agent (A2A) messages.
7. Prompt injection: how untrusted text reaches the agent and what stops it.

### Who it's for
Beginners learning how agents work, engineers explaining agent design to a team, and anyone preparing for interviews.

### Why it could work
- It is visual and easy to show in a 15-second clip.
- It is a proven format (Protocol Explorer), applied to a topic where no one covers the whole picture.
- Lessons are scripted, so no API keys, no backend, and it is cheap to host.

### Known limits
- Scenarios are simulated. Say so clearly on the page, the way Protocol Explorer does.
- It is a lot of content to write well. The first version should be only 2 or 3 lessons.
- Existing MCP explainers overlap with lesson 4: [MCP Explained](https://ai-tldr.dev/releases/runlayer-mcp-explained/), [Peplinski's demo](https://jessepeplinski.com/blog/how-does-mcp-work/), [MCP Playground](https://mcpplaygroundonline.com/blog/ai-agent-mcp-explained). The difference has to be covering the whole agent, not one protocol.

### MVP
A single static HTML page with three lessons (agent loop, context window, tool call), play and step controls, a sequence diagram and an inspector panel.

### Next steps
- [ ] Look at designed-to-scale in a browser to see how it structures lessons.
- [ ] Search GitHub directly for "agent loop visualizer", "context window visualizer", "interactive agent explainer".
- [ ] Build the three-lesson prototype.

### Side idea: spike decision page
For any engineering spike, an interactive page instead of a markdown doc: options, trade-offs, an architecture diagram, evidence, and sliders for what matters (cost, speed, risk) that re-rank the options live, ending in a go or no-go. No established tool found. Weakness: easy to copy, because anyone can ask an AI for HTML.

---

