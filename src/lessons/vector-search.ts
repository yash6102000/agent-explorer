import type { Lesson } from "../types";

export const vectorSearch: Lesson = {
  id: "vector-search",
  title: "Vector Search at Scale",
  summary: "Finding nearest vectors fast when you have millions of them.",
  goals: ["Why exact search gets slow", "Approximate search and its tradeoff", "HNSW and IVF in one idea each", "What a vector database adds"],
  nodes: [
    { id: "embedder", icon: "chip", label: "Embedder", sub: "text to vector", x: 90, y: 150, tone: "violet" },
    { id: "index", icon: "rack", label: "Vector index", sub: "graph or clusters", x: 400, y: 150, tone: "orange" },
    { id: "results", icon: "docs", label: "Top results", sub: "ids and scores", x: 720, y: 150, tone: "green" },
  ],
  links: [{ a: "embedder", b: "index" }, { a: "index", b: "results" }],
  steps: [
    {
      short: "Brute force", chapter: "problem", title: "Exact search checks everything",
      body: [
        "**Exact nearest-neighbour search** compares the query vector with every stored vector, then sorts. It is always correct.",
        "Fine for thousands of vectors. Cost grows in step with the count, so millions get slow.",
      ],
      callout: { kind: "warn", text: "Twice the data means roughly twice the work per query." },
      show: ["embedder", "index"], focus: ["index"], flows: [{ from: "embedder", to: "index", label: "query" }],
      data: { title: "Exact search (illustrative)", data: { method: "brute_force", vectors_scanned: "all of them", per_query_cost: "grows with N", accuracy: "exact" } },
    },
    {
      short: "ANN", chapter: "setup", title: "Approximate search trades a little accuracy",
      body: [
        "**Approximate nearest neighbour (ANN)** search builds an index ahead of time, then looks at only a small part of the data per query.",
        "It may miss a true neighbour now and then. In return it is much faster.",
      ],
      callout: { kind: "insight", text: "For retrieval, \"very close\" is usually good enough." },
      show: ["embedder", "index", "results"], focus: ["index", "results"],
      flows: [{ from: "index", to: "results", label: "top_k" }],
      panel: { kind: "cards", cards: [
        { title: "Exact", text: "Scans every vector. Perfect results. Slow at scale.", tone: "blue" },
        { title: "Approximate", text: "Scans a small slice. Fast. Occasionally misses one.", tone: "orange" },
      ] },
    },
    {
      short: "HNSW", chapter: "technique", title: "HNSW: hop through a layered graph",
      body: [
        "**HNSW** links each vector to near neighbours, in layers. Top layers have few long links, like a skip list. Bottom layers have all vectors.",
        "A query starts at the top, hops greedily toward the query, then drops a layer and repeats.",
      ],
      callout: { kind: "tip", text: "A larger ef_search explores more candidates: better recall, slower." },
      show: ["embedder", "index", "results"], focus: ["index"],
      panel: { kind: "cards", cards: [
        { title: "Top layer", text: "Few nodes, long jumps. Gets you to the right region quickly.", tone: "violet" },
        { title: "Middle layers", text: "More nodes, shorter hops. Narrows in.", tone: "blue" },
        { title: "Bottom layer", text: "Every vector. Final careful search near the query.", tone: "green" },
      ] },
      data: { title: "An HNSW query (illustrative)", data: { index: "hnsw", query_vector: "[0.12, -0.40, ...]", top_k: 3, ef_search: 64, results: [{ id: "doc_481", score: 0.91 }, { id: "doc_077", score: 0.88 }, { id: "doc_912", score: 0.84 }] } },
    },
    {
      short: "IVF", chapter: "technique", title: "IVF: cluster, then search nearby",
      body: [
        "**IVF** (inverted file) groups vectors into clusters ahead of time. At query time, find the few closest cluster centres and search only inside them.",
        "The knob is how many clusters to visit, often called `nprobe`.",
      ],
      callout: { kind: "insight", text: "Visit more clusters for better recall. Visit fewer for speed." },
      show: ["embedder", "index", "results"], focus: ["index"],
      panel: { kind: "cards", cards: [
        { title: "Build", text: "Group all vectors around cluster centres.", tone: "violet" },
        { title: "Probe", text: "Find the closest centres to the query.", tone: "orange" },
        { title: "Scan", text: "Compare only vectors in those clusters.", tone: "green" },
      ] },
      data: { title: "An IVF query (illustrative)", data: { index: "ivf", clusters: 1024, nprobe: 8, note: "scans about 8 of 1024 clusters", top_k: 3 } },
    },
    {
      short: "Tradeoffs", chapter: "tradeoff", title: "Recall, speed and memory",
      body: [
        "**Recall** is the share of true nearest neighbours the search finds. You tune it against latency and memory.",
        "Graph indexes like HNSW usually give fast queries but use more memory. Compression helps memory at some cost in accuracy.",
      ],
      metrics: [{ label: "Recall", value: "tunable" }, { label: "Speed", value: "tunable" }, { label: "Memory", value: "cost" }],
      show: ["embedder", "index", "results"], focus: ["index"],
      panel: { kind: "cards", cards: [
        { title: "Higher recall", text: "Search more of the index. Slower queries.", tone: "green" },
        { title: "Lower latency", text: "Search less. Some neighbours get missed.", tone: "orange" },
        { title: "Less memory", text: "Compress vectors. Scores get slightly rougher.", tone: "violet" },
      ] },
    },
    {
      short: "Filters", chapter: "technique", title: "Metadata filters narrow the hunt",
      body: [
        "Real queries add rules: only this customer, only 2024, only English. These are **metadata filters**, applied alongside similarity.",
        "Filtering well inside an ANN index is a hard part, so check how your database handles it.",
      ],
      callout: { kind: "tip", text: "Test with your real filters. Tight ones can hurt recall or speed." },
      show: ["embedder", "index", "results"], focus: ["index", "results"],
      data: { title: "A filtered query (illustrative)", data: { top_k: 3, ef_search: 64, filter: { tenant: "acme", year: { gte: 2024 } }, results: [{ id: "kb_204", score: 0.89, tenant: "acme" }, { id: "kb_031", score: 0.85, tenant: "acme" }, { id: "kb_118", score: 0.81, tenant: "acme" }] } },
    },
    {
      short: "Database", chapter: "recap", title: "What a vector database adds",
      body: [
        "An index is one data structure. A **vector database** wraps it with the rest: storage, updates, filtering and scaling.",
        "Pick one when your data is large or changes often.",
      ],
      callout: { kind: "next", text: "Next: query transformation, fixing the question before you search." },
      show: ["embedder", "index", "results"],
      panel: { kind: "cards", cards: [
        { title: "Storage", text: "Vectors saved on disk with their text and ids.", tone: "blue" },
        { title: "Updates", text: "Add, change and delete without a full rebuild.", tone: "green" },
        { title: "Filtering", text: "Metadata rules combined with similarity.", tone: "orange" },
        { title: "Scale", text: "Sharding and replicas as data and traffic grow.", tone: "violet" },
      ] },
    },
  ],
};
