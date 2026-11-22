import type { Lesson } from "../types";

export const mcp: Lesson = {
  id: "mcp",
  title: "MCP: Tools as a Protocol",
  summary: "One open standard to connect any tool to any AI app.",
  goals: ["Why hand-wiring every tool does not scale", "Hosts, clients and servers", "Discovering and calling tools with JSON-RPC", "Local versus remote servers, and trust"],
  nodes: [
    { id: "host", icon: "laptop", label: "Host app", sub: "chat or coding app", x: 90, y: 150, tone: "green" },
    { id: "client", icon: "layers", label: "MCP client", sub: "inside the host", x: 310, y: 150, tone: "violet" },
    { id: "server", icon: "rack", label: "MCP server", sub: "exposes tools", x: 520, y: 150, tone: "orange" },
    { id: "system", icon: "docs", label: "Real system", sub: "files, DB, SaaS", x: 720, y: 150, tone: "blue" },
  ],
  zones: [
    { label: "Your laptop", sub: "the host app", ids: ["host", "client"], tone: "green" },
    { label: "Outside the model", sub: "code you connect", ids: ["server", "system"], tone: "orange" },
  ],
  links: [{ a: "host", b: "client" }, { a: "client", b: "server" }, { a: "server", b: "system" }],
  steps: [
    {
      short: "Problem", chapter: "problem", title: "Every app wires every tool by hand",
      body: [
        "With **N** AI apps and **M** tools, each pairing needs its own custom integration. That is N x M pieces of glue code.",
        "Each app also re-solves the same problems: describing tools, calling them, handling errors.",
      ],
      callout: { kind: "insight", text: "Same tool, rebuilt for every app." },
      show: ["host", "system"], focus: ["host", "system"],
      panel: { kind: "cards", cards: [
        { title: "Without a standard", text: "3 apps x 4 tools = 12 custom integrations to build and maintain.", tone: "rose" },
        { title: "With a standard", text: "3 clients + 4 servers = 7 pieces. Any client talks to any server.", tone: "green" },
      ] },
    },
    {
      short: "Idea", chapter: "solution", title: "MCP is a shared plug shape",
      body: [
        "The **Model Context Protocol (MCP)** is an open standard for connecting AI apps to tools and data. Think of it as a common plug.",
        "Build a tool once as an MCP server and any MCP-capable app can use it.",
      ],
      callout: { kind: "insight", text: "N x M becomes N + M." },
      show: ["host", "client", "server", "system"], focus: ["client", "server"],
      flows: [{ from: "client", to: "server", label: "MCP" }],
      data: { title: "Shape of an MCP setup (simplified)", data: { host: "your AI app", client: "MCP client (inside the host)", servers: ["files", "github", "database"], each_server_exposes: ["tools", "resources", "prompts"] } },
    },
    {
      short: "Roles", chapter: "setup", title: "Host, client, server",
      body: [
        "The **host** is the app you use. Inside it, an **MCP client** keeps one connection to each **MCP server**. The server wraps a real system.",
        "Servers can offer **tools** (actions), **resources** (data to read) and **prompts** (reusable templates).",
      ],
      callout: { kind: "tip", text: "The host's model decides what to use. The tool-call mechanics are in Tool Calling." },
      show: ["host", "client", "server", "system"], focus: ["host", "client", "server"],
      flows: [{ from: "host", to: "client", label: "use tool" }, { from: "client", to: "server", label: "request" }, { from: "server", to: "system", label: "real call" }],
      panel: { kind: "cards", cards: [
        { title: "Tools", text: "Actions the model can invoke, like create_issue.", tone: "orange" },
        { title: "Resources", text: "Data to read, like a file or a database row.", tone: "blue" },
        { title: "Prompts", text: "Reusable templates the user can pick.", tone: "violet" },
      ] },
    },
    {
      short: "Discovery", chapter: "technique", title: "Discovery: ask what you offer",
      body: [
        "Messages use **JSON-RPC 2.0**, a small request and response format. On connecting, the client sends `tools/list`.",
        "The server replies with each tool's name, description and input schema. The host passes these to the model as its tool definitions.",
      ],
      show: ["host", "client", "server", "system"], focus: ["client", "server"],
      flows: [{ from: "client", to: "server", label: "tools/list" }, { from: "server", to: "client", label: "tool defs" }],
      data: { title: "tools/list (simplified)", data: {
        request: { jsonrpc: "2.0", id: 1, method: "tools/list" },
        response: { jsonrpc: "2.0", id: 1, result: { tools: [{ name: "search_issues", description: "Search issues by keyword.", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } }] } },
      } },
    },
    {
      short: "Calling", chapter: "technique", title: "Invocation: tools/call",
      body: [
        "When the model asks for a tool, the host's client forwards it to the right server as a `tools/call` request.",
        "The server does the real work and returns content. The client hands it back to the model as the tool result.",
      ],
      show: ["host", "client", "server", "system"], focus: ["client", "server", "system"],
      flows: [{ from: "client", to: "server", label: "tools/call" }, { from: "server", to: "system", label: "query" }, { from: "server", to: "client", label: "content" }],
      data: { title: "tools/call (simplified)", data: {
        request: { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "search_issues", arguments: { query: "login bug" } } },
        response: { jsonrpc: "2.0", id: 2, result: { content: [{ type: "text", text: "3 open issues match 'login bug'." }], isError: false } },
      } },
    },
    {
      short: "Transports", chapter: "technique", title: "Local or remote servers",
      body: [
        "A **local** server runs on your machine as a child process and talks over **stdio** (standard input and output). Good for files and dev tools.",
        "A **remote** server runs elsewhere and talks over **HTTP**. Good for shared services that need sign-in.",
      ],
      callout: { kind: "tip", text: "The messages are the same. Only the pipe changes." },
      show: ["host", "client", "server", "system"], focus: ["client", "server"],
      panel: { kind: "cards", cards: [
        { title: "Local (stdio)", text: "Child process on your laptop. Simple, private, uses your own files.", tone: "green" },
        { title: "Remote (HTTP)", text: "Hosted service. Shared by many users, needs authentication.", tone: "blue" },
      ] },
    },
    {
      short: "Trust", chapter: "tradeoff", title: "A server is code you run",
      body: [
        "Connecting a server means trusting it. A local one runs with your permissions. Its tool descriptions and outputs also flow into the model's context.",
        "Install only servers you trust, grant the narrowest access, and review what a tool does before approving.",
      ],
      callout: { kind: "next", text: "Next: Planning and ReAct, how agents decide which tools to use and when." },
      show: ["host", "client", "server", "system"], focus: ["server", "system"],
      panel: { kind: "cards", cards: [
        { title: "Vet the source", text: "Who wrote it? Is it maintained? Prefer known publishers.", tone: "blue" },
        { title: "Limit permissions", text: "Read-only credentials, narrow folders, no extra scopes.", tone: "orange" },
        { title: "Watch the text", text: "Descriptions and results are untrusted input to the model.", tone: "rose" },
      ] },
    },
  ],
};
