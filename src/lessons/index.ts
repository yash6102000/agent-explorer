import type { Lesson, Module } from "../types";
import { a2a } from "./a2a";
import { advancedRetrieval } from "./advanced-retrieval";
import { agentLoop } from "./agent-loop";
import { agenticRag } from "./agentic-rag";
import { aiArchitectures } from "./ai-architectures";
import { attention } from "./attention";
import { chunking } from "./chunking";
import { computerUse } from "./computer-use";
import { dataLeakage } from "./data-leakage";
import { embeddings } from "./embeddings";
import { graphRag } from "./graph-rag";
import { hallucinations } from "./hallucinations";
import { humanInLoop } from "./human-in-loop";
import { hybridSearch } from "./hybrid-search";
import { jailbreaks } from "./jailbreaks";
import { leastPrivilege } from "./least-privilege";
import { mcp } from "./mcp";
import { memory } from "./memory";
import { multiAgent } from "./multi-agent";
import { multimodalRag } from "./multimodal-rag";
import { nextToken } from "./next-token";
import { planning } from "./planning";
import { promptInjection } from "./prompt-injection";
import { prompting } from "./prompting";
import { queryTransform } from "./query-transform";
import { ragArchitectures } from "./rag-architectures";
import { ragEval } from "./rag-eval";
import { ragFailures } from "./rag-failures";
import { reasoning } from "./reasoning";
import { redTeaming } from "./red-teaming";
import { reranking } from "./reranking";
import { selfRag } from "./self-rag";
import { simpleRag } from "./simple-rag";
import { tokensContext } from "./tokens-context";
import { toolCalling } from "./tool-calling";
import { training } from "./training";
import { vectorSearch } from "./vector-search";
import { whatIsAgent } from "./what-is-agent";
import { whatIsLlm } from "./what-is-llm";
import { whatIsRag } from "./what-is-rag";
import { workflowsVsAgents } from "./workflows-vs-agents";

export const LESSONS: Record<string, Lesson> = {
  [a2a.id]: a2a,
  [advancedRetrieval.id]: advancedRetrieval,
  [agentLoop.id]: agentLoop,
  [agenticRag.id]: agenticRag,
  [aiArchitectures.id]: aiArchitectures,
  [attention.id]: attention,
  [chunking.id]: chunking,
  [computerUse.id]: computerUse,
  [dataLeakage.id]: dataLeakage,
  [embeddings.id]: embeddings,
  [graphRag.id]: graphRag,
  [hallucinations.id]: hallucinations,
  [humanInLoop.id]: humanInLoop,
  [hybridSearch.id]: hybridSearch,
  [jailbreaks.id]: jailbreaks,
  [leastPrivilege.id]: leastPrivilege,
  [mcp.id]: mcp,
  [memory.id]: memory,
  [multiAgent.id]: multiAgent,
  [multimodalRag.id]: multimodalRag,
  [nextToken.id]: nextToken,
  [planning.id]: planning,
  [promptInjection.id]: promptInjection,
  [prompting.id]: prompting,
  [queryTransform.id]: queryTransform,
  [ragArchitectures.id]: ragArchitectures,
  [ragEval.id]: ragEval,
  [ragFailures.id]: ragFailures,
  [reasoning.id]: reasoning,
  [redTeaming.id]: redTeaming,
  [reranking.id]: reranking,
  [selfRag.id]: selfRag,
  [simpleRag.id]: simpleRag,
  [tokensContext.id]: tokensContext,
  [toolCalling.id]: toolCalling,
  [training.id]: training,
  [vectorSearch.id]: vectorSearch,
  [whatIsAgent.id]: whatIsAgent,
  [whatIsLlm.id]: whatIsLlm,
  [whatIsRag.id]: whatIsRag,
  [workflowsVsAgents.id]: workflowsVsAgents,
};

export const MODULES: Module[] = [
  { id: "foundations", num: "01", title: "Foundations", tone: "blue", icon: "chip", blurb: "How LLMs read, think and fail.", lessons: [
    { id: "what-is-llm", title: "What is an LLM?", ready: true },
    { id: "tokens-context", title: "Tokens & the Context Window", ready: true },
    { id: "embeddings", title: "Embeddings", ready: true },
    { id: "attention", title: "Attention, in One Picture", ready: true },
    { id: "next-token", title: "Next-Token Prediction & Sampling", ready: true },
    { id: "training", title: "From Pretraining to Chat", ready: true },
    { id: "prompting", title: "Prompting Basics", ready: true },
    { id: "reasoning", title: "Reasoning Models", ready: true },
    { id: "hallucinations", title: "Hallucinations & Limits", ready: true },
    { id: "ai-architectures", title: "AI Architectures at a Glance", ready: true },
  ] },
  { id: "retrieval", num: "02", title: "Retrieval & RAG", tone: "green", icon: "docs", blurb: "Give a model your own facts so it stops guessing.", lessons: [
    { id: "what-is-rag", title: "What is RAG?", ready: true },
    { id: "simple-rag", title: "Simple RAG", ready: true },
    { id: "chunking", title: "Chunking Strategies", ready: true },
    { id: "vector-search", title: "Vector Search at Scale", ready: true },
    { id: "query-transform", title: "Query Transformation", ready: true },
    { id: "hybrid-search", title: "Hybrid Search", ready: true },
    { id: "reranking", title: "Reranking", ready: true },
    { id: "advanced-retrieval", title: "Advanced Retrieval", ready: true },
    { id: "graph-rag", title: "Graph RAG", ready: true },
    { id: "self-rag", title: "Self-RAG & Corrective RAG", ready: true },
    { id: "agentic-rag", title: "Agentic RAG", ready: true },
    { id: "multimodal-rag", title: "Multimodal RAG", ready: true },
    { id: "rag-architectures", title: "RAG Architectures Compared", ready: true },
    { id: "rag-eval", title: "Evaluating RAG", ready: true },
    { id: "rag-failures", title: "RAG Failure Modes", ready: true },
  ] },
  { id: "agents", num: "03", title: "Agents", tone: "violet", icon: "laptop", blurb: "Loops, tools and memory. Models that act.", lessons: [
    { id: "what-is-agent", title: "What is an Agent?", ready: true },
    { id: "workflows-vs-agents", title: "Workflows vs Agents", ready: true },
    { id: "agent-loop", title: "The Agent Loop", ready: true },
    { id: "tool-calling", title: "Tool Calling", ready: true },
    { id: "mcp", title: "MCP: Tools as a Protocol", ready: true },
    { id: "planning", title: "Planning & ReAct", ready: true },
    { id: "memory", title: "Memory & Compaction", ready: true },
    { id: "multi-agent", title: "Subagents & Multi-Agent Patterns", ready: true },
    { id: "a2a", title: "Agent-to-Agent (A2A)", ready: true },
    { id: "computer-use", title: "Computer Use & Browser Agents", ready: true },
    { id: "human-in-loop", title: "Human in the Loop", ready: true },
  ] },
  { id: "safety", num: "04", title: "Safety", tone: "rose", icon: "rack", blurb: "What can go wrong and how to stop it.", lessons: [
    { id: "prompt-injection", title: "Prompt Injection", ready: true },
    { id: "jailbreaks", title: "Jailbreaks & Guardrails", ready: true },
    { id: "least-privilege", title: "Sandboxing & Least Privilege", ready: true },
    { id: "data-leakage", title: "Data Leakage & Privacy", ready: true },
    { id: "red-teaming", title: "Red-Teaming Your App", ready: true },
  ] },
  { id: "models", num: "05", title: "Models in Practice", tone: "blue", icon: "tower", blurb: "Choose, adapt and run the right model.", lessons: [
    { id: "choosing-model", title: "Choosing a Model" },
    { id: "multimodal-models", title: "Vision, Audio & Image Models" },
    { id: "fine-tuning", title: "Fine-Tuning & LoRA" },
    { id: "local-models", title: "Running Models Locally" },
  ] },
  { id: "production", num: "06", title: "Shipping", tone: "orange", icon: "layers", blurb: "Make it reliable, fast and affordable.", lessons: [
    { id: "structured-output", title: "Structured Outputs" },
    { id: "evals", title: "Evals & LLM-as-Judge" },
    { id: "observability", title: "Tracing & Observability" },
    { id: "cost-latency", title: "Cost, Latency & Caching" },
  ] },
  { id: "cases", num: "07", title: "Case Studies", tone: "ink", icon: "docs", blurb: "Real systems, assembled from the lessons.", lessons: [
    { id: "case-support-bot", title: "A Support Copilot" },
    { id: "case-coding-agent", title: "How a Coding Agent Works" },
    { id: "case-deep-research", title: "A Deep-Research Agent" },
  ] },
  { id: "play", num: "08", title: "Play", tone: "gray", icon: "tower", blurb: "Games that make the ideas stick.", lessons: [
    { id: "context-packer", title: "Context Packer (game)", ready: true },
    { id: "chunk-cutter", title: "Chunk Cutter (game)" },
    { id: "injection-defence", title: "Injection Defence (game)" },
    { id: "agent-maze", title: "Agent Maze (game)" },
  ] },
];

/** One-line summaries for lessons without a full lesson object yet (games, upcoming). */
export const SUMMARIES: Record<string, string> = {
  "context-packer": "Pack a token budget so the model answers well. Avoid noise and poisoned text.",
  "chunk-cutter": "Cut a document so the answer survives. Beat the size-and-overlap puzzle.",
  "injection-defence": "Place guardrails to stop hidden instructions from hijacking an agent.",
  "agent-maze": "Guide a robot to its goal with tools. Plan, act, observe, recover.",
  // Foundations
  "ai-architectures": "LLM call, RAG, agent, multi-agent: what each adds and when to pick it.",
  "what-is-llm": "A next-word predictor trained on huge text. What that does and does not mean.",
  "next-token": "How a model picks each word: probabilities, temperature, top-p.",
  attention: "How each word looks at the others to decide what matters.",
  training: "Pretraining, instruction tuning and RLHF: how a text predictor becomes a chat assistant.",
  prompting: "Roles, instructions, examples and format: the small changes that matter most.",
  reasoning: "Models that think before answering, and when that is worth the cost.",
  hallucinations: "Why models state false things confidently, and how to reduce it.",
  // Retrieval
  "vector-search": "Find nearest neighbours across millions of vectors fast: ANN, HNSW, trade-offs.",
  "query-transform": "Rewrite, expand and split the question; HyDE searches with a draft answer.",
  "hybrid-search": "Combine keyword and vector search to catch what each one misses.",
  reranking: "Fetch 20, re-score with a stronger model, keep the best 3.",
  "advanced-retrieval": "Parent-document, multi-vector, metadata filters and diversity (MMR).",
  "graph-rag": "Link entities in a knowledge graph to answer multi-hop questions.",
  "self-rag": "The model decides when to retrieve, grades the results and retries.",
  "agentic-rag": "An agent picks sources and tools, and loops until it has enough.",
  "multimodal-rag": "Retrieve over images, tables and PDFs, not just text.",
  "rag-architectures": "Naive, advanced, modular, graph, self and agentic RAG, side by side.",
  "rag-eval": "Measure retrieval and answer quality instead of guessing.",
  "rag-failures": "Lost in the middle, stale data, conflicting sources, poisoned documents.",
  // Agents
  "what-is-agent": "A model in a loop with tools and a goal. What makes it an agent.",
  "agent-loop": "Think, call a tool, observe, repeat: the loop behind every agent.",
  "tool-calling": "What a tool call really looks like on the wire.",
  mcp: "A standard way to plug tools into any agent: tools/list and tools/call.",
  planning: "Plan first or think as you go: ReAct, plan-and-execute, reflection.",
  "workflows-vs-agents": "Fixed steps or a model that decides? Chaining, routing and when to use each.",
  memory: "What to keep, summarise or store across turns and sessions, and what compaction loses.",
  "multi-agent": "How a parent hands work to subagents, and the patterns where more agents help.",
  a2a: "How separate agents discover each other and exchange tasks.",
  "computer-use": "Agents that see a screen and click: how they work and where they break.",
  "human-in-loop": "Approvals, permissions and checkpoints: keeping people in control.",
  // Safety
  "prompt-injection": "How untrusted text reaches an agent and what actually stops it.",
  jailbreaks: "How safety rules get bypassed and the layers that defend against it.",
  "least-privilege": "Limit what an agent can touch: sandboxes, scopes, allow-lists.",
  "data-leakage": "How secrets and personal data escape through prompts, tools and logs.",
  "red-teaming": "Attack your own app on purpose before someone else does.",
  // Shipping
  "structured-output": "Make the model return valid JSON you can rely on.",
  evals: "Test sets, LLM-as-judge and agent evals: know if a change made things better.",
  "choosing-model": "Size, context, price, speed and quality: pick a model on evidence, not hype.",
  "multimodal-models": "How models read images and audio, and generate them. What each can and cannot do.",
  "fine-tuning": "Teach a model a style or skill with examples. LoRA makes it cheap. Not for facts.",
  "local-models": "Open weights, quantization and running on your own machine: the trade-offs.",
  "case-support-bot": "Prompting, RAG, tools and guardrails assembled into one customer-support copilot.",
  "case-coding-agent": "Tools, loop, context and permissions: what is inside an agent that edits code.",
  "case-deep-research": "Plan, search, read, cite and write: a multi-step research agent end to end.",
  observability: "Trace every step of a run so you can debug what the model did.",
  "cost-latency": "Token costs, caching, batching and model routing without losing quality.",
};

export const lessonSummary = (id: string) => LESSONS[id]?.summary ?? SUMMARIES[id] ?? "";
