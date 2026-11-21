import type { Lesson, Module } from "../types";
import { simpleRag } from "./simple-rag";
import { tokensContext } from "./tokens-context";
import { embeddings } from "./embeddings";
import { whatIsRag } from "./what-is-rag";
import { chunking } from "./chunking";
import { whatIsLlm } from "./what-is-llm";
import { aiArchitectures } from "./ai-architectures";
import { training } from "./training";
import { ragFailures } from "./rag-failures";
import { ragEval } from "./rag-eval";
import { ragArchitectures } from "./rag-architectures";
import { multimodalRag } from "./multimodal-rag";
import { agenticRag } from "./agentic-rag";
import { selfRag } from "./self-rag";
import { graphRag } from "./graph-rag";
import { advancedRetrieval } from "./advanced-retrieval";
import { hallucinations } from "./hallucinations";
import { attention } from "./attention";
import { nextToken } from "./next-token";
import { reranking } from "./reranking";
import { hybridSearch } from "./hybrid-search";
import { queryTransform } from "./query-transform";
import { vectorSearch } from "./vector-search";
import { reasoning } from "./reasoning";
import { prompting } from "./prompting";

export const LESSONS: Record<string, Lesson> = {
  [simpleRag.id]: simpleRag,
  [tokensContext.id]: tokensContext,
  [embeddings.id]: embeddings,
  [whatIsRag.id]: whatIsRag,
  [chunking.id]: chunking,
  [whatIsLlm.id]: whatIsLlm,
  [aiArchitectures.id]: aiArchitectures,
  [training.id]: training,
  [ragFailures.id]: ragFailures,
  [ragEval.id]: ragEval,
  [ragArchitectures.id]: ragArchitectures,
  [multimodalRag.id]: multimodalRag,
  [agenticRag.id]: agenticRag,
  [selfRag.id]: selfRag,
  [graphRag.id]: graphRag,
  [advancedRetrieval.id]: advancedRetrieval,
  [hallucinations.id]: hallucinations,
  [attention.id]: attention,
  [nextToken.id]: nextToken,
  [reranking.id]: reranking,
  [hybridSearch.id]: hybridSearch,
  [queryTransform.id]: queryTransform,
  [vectorSearch.id]: vectorSearch,
  [reasoning.id]: reasoning,
  [prompting.id]: prompting,
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
    { id: "what-is-agent", title: "What is an Agent?" },
    { id: "agent-loop", title: "The Agent Loop" },
    { id: "tool-calling", title: "Tool Calling" },
    { id: "mcp", title: "MCP: Tools as a Protocol" },
    { id: "planning", title: "Planning & ReAct" },
    { id: "memory", title: "Agent Memory" },
    { id: "compaction", title: "Context Compaction" },
    { id: "subagents", title: "Subagents" },
    { id: "multi-agent", title: "Multi-Agent Patterns" },
    { id: "a2a", title: "Agent-to-Agent (A2A)" },
    { id: "computer-use", title: "Computer Use & Browser Agents" },
    { id: "human-in-loop", title: "Human in the Loop" },
  ] },
  { id: "safety", num: "04", title: "Safety", tone: "rose", icon: "rack", blurb: "What can go wrong and how to stop it.", lessons: [
    { id: "prompt-injection", title: "Prompt Injection" },
    { id: "jailbreaks", title: "Jailbreaks & Guardrails" },
    { id: "least-privilege", title: "Sandboxing & Least Privilege" },
    { id: "data-leakage", title: "Data Leakage & Privacy" },
    { id: "red-teaming", title: "Red-Teaming Your App" },
  ] },
  { id: "production", num: "05", title: "Shipping", tone: "orange", icon: "layers", blurb: "Make it reliable, fast and affordable.", lessons: [
    { id: "structured-output", title: "Structured Outputs" },
    { id: "rag-vs-finetune", title: "RAG vs Fine-Tuning" },
    { id: "evals", title: "Evals & LLM-as-Judge" },
    { id: "observability", title: "Tracing & Observability" },
    { id: "cost-latency", title: "Cost, Latency & Caching" },
  ] },
  { id: "play", num: "06", title: "Play", tone: "gray", icon: "tower", blurb: "Games that make the ideas stick.", lessons: [
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
  memory: "Short-term, long-term and scratchpad memory, and what to store.",
  compaction: "What gets summarised when the context fills up, and what is lost.",
  subagents: "How a parent hands work to a child agent and gets a result back.",
  "multi-agent": "Orchestrator-worker, handoffs and debate: when more agents help.",
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
  "rag-vs-finetune": "Facts go in retrieval, behaviour goes in fine-tuning. How to choose.",
  evals: "Test sets, metrics and LLM-as-judge: know if a change made things better.",
  observability: "Trace every step of a run so you can debug what the model did.",
  "cost-latency": "Token costs, caching, batching and model routing without losing quality.",
};

export const lessonSummary = (id: string) => LESSONS[id]?.summary ?? SUMMARIES[id] ?? "";
