# Agent Explorer

Interactive, step-by-step lessons on how LLMs, RAG and AI agents work, in the style of Protocol Explorer and designed-to-scale. Scripted and simulated: no backend, no API keys.

## Run
```
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What's built
- **Tokens & the Context Window** (7 steps): live toy tokenizer, context-window fill meter with a turns slider, why every turn resends the history, overflow options.
- **Embeddings** (7 steps): clickable word map with live cosine similarity, text to vector, dimensions, uses, pitfalls.
- **Simple RAG** (11 steps): chunk, embed, store, embed question, top-k search (adjustable k), prompt, grounded answer, failure modes.
- App shell: collapsible lesson sidebar with per-step navigation and progress, centre stage with isometric SVG diagrams, interactive panels, always-visible explanation, inspector and trace, ⌘K search, light/dark, hash routes (`#/simple-rag/4`).

## Structure
- `src/lessons/*.ts`: lessons are data (scene nodes, steps, panels, payloads). Add a lesson by adding a file and listing it in `src/lessons/index.ts`.
- `src/components/`: Stage (animated diagram), Panels (chunks, vector map, prompt, answer), Inspector, Sidebar, Search.
- `prototype/agent-loop.html`: the first single-file prototype (agent loop, context window, tool call), to be ported.

## Roadmap
RAG (chunking, hybrid search, reranking, evals) · Agents (loop, tool calling/MCP, compaction, subagents) · Safety (prompt injection).

See [docs/idea.md](docs/idea.md).
