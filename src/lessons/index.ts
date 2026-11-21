import type { Lesson, Module } from "../types";
import { simpleRag } from "./simple-rag";
import { tokensContext } from "./tokens-context";
import { embeddings } from "./embeddings";

export const LESSONS: Record<string, Lesson> = { [simpleRag.id]: simpleRag, [tokensContext.id]: tokensContext, [embeddings.id]: embeddings };

export const MODULES: Module[] = [
  { id: "foundations", num: "01", title: "Foundations", tone: "ink", lessons: [
    { id: "tokens-context", title: "Tokens & the Context Window", ready: true },
    { id: "embeddings", title: "Embeddings", ready: true },
  ] },
  { id: "retrieval", num: "02", title: "Retrieval & RAG", tone: "green", lessons: [
    { id: "simple-rag", title: "Simple RAG", ready: true },
    { id: "chunking", title: "Chunking Strategies" },
    { id: "hybrid-search", title: "Hybrid Search" },
    { id: "reranking", title: "Reranking" },
    { id: "rag-eval", title: "Evaluating RAG" },
  ] },
  { id: "agents", num: "03", title: "Agents", tone: "violet", lessons: [
    { id: "agent-loop", title: "The Agent Loop" },
    { id: "tool-calling", title: "Tool Calling & MCP" },
    { id: "compaction", title: "Context Compaction" },
    { id: "subagents", title: "Subagents" },
  ] },
  { id: "play", num: "★", title: "Play", tone: "orange", lessons: [
    { id: "context-packer", title: "Context Packer (game)", ready: true },
  ] },
  { id: "safety", num: "04", title: "Safety", tone: "rose", lessons: [
    { id: "prompt-injection", title: "Prompt Injection" },
  ] },
];
