import type { Lesson } from "../types";

const graphNodes = [
  { id: "maria", label: "Maria", x: 60, y: 40, tone: "blue" as const },
  { id: "payments", label: "Payments team", x: 200, y: 40, tone: "violet" as const },
  { id: "checkout", label: "Checkout svc", x: 340, y: 40, tone: "green" as const },
  { id: "inc42", label: "Incident 42", x: 340, y: 130, tone: "rose" as const },
  { id: "db", label: "Orders DB", x: 200, y: 130, tone: "orange" as const },
  { id: "infra", label: "Infra team", x: 60, y: 130, tone: "violet" as const },
  { id: "raj", label: "Raj", x: 200, y: 182, tone: "blue" as const },
];
const graphEdges = [
  { a: "maria", b: "payments", label: "leads" },
  { a: "payments", b: "checkout", label: "owns" },
  { a: "checkout", b: "inc42", label: "failed in" },
  { a: "checkout", b: "db", label: "uses" },
  { a: "infra", b: "db", label: "owns" },
  { a: "raj", b: "infra", label: "on-call for" },
];

export const graphRag: Lesson = {
  id: "graph-rag",
  title: "Graph RAG",
  summary: "Store entities and links, so retrieval can follow connections.",
  goals: ["Why multi-hop questions defeat similarity search", "What a knowledge graph stores", "How retrieval follows links", "Communities for global questions, and the costs"],
  nodes: [
    { id: "docs", icon: "docs", label: "Documents", sub: "wikis, tickets, reports", x: 90, y: 80, tone: "green" },
    { id: "extractor", icon: "tower", label: "Entity extractor", sub: "an LLM reads each one", x: 90, y: 230, tone: "rose" },
    { id: "graph", icon: "rack", label: "Graph store", sub: "entities + relations", x: 340, y: 150, tone: "violet" },
    { id: "retriever", icon: "chip", label: "Retriever", sub: "follows the links", x: 540, y: 150, tone: "orange" },
    { id: "llm", icon: "laptop", label: "LLM", sub: "answers from facts", x: 730, y: 150, tone: "blue" },
  ],
  links: [{ a: "docs", b: "extractor" }, { a: "extractor", b: "graph" }, { a: "graph", b: "retriever" }, { a: "retriever", b: "llm" }],
  steps: [
    {
      short: "Multi-hop", chapter: "problem", title: "Facts live in different documents",
      body: [
        "\"Which team owns the service that failed?\" needs two facts: which service failed, and who owns it. They sit in different documents.",
        "Vector search returns passages **similar** to the question. It does not connect passages to each other. That is a **multi-hop** question: the answer takes several linked steps.",
      ],
      callout: { kind: "warn", text: "Similar text is not the same as related facts." },
      show: ["docs", "retriever", "llm"], focus: ["retriever"],
      flows: [{ from: "docs", to: "retriever", label: "similar" }],
      data: { title: "Plain top-k finds half the answer", data: { question: "Which team owns the service that failed?", retrieved: ["incident-42.md: Checkout service failed at 02:10 after a deploy.", "postmortem-template.md: List the team that owns the failed service."], missing: "ownership.md: Payments team owns Checkout service." } },
    },
    {
      short: "Graph", chapter: "setup", title: "A graph stores things and links",
      body: [
        "A **knowledge graph** stores **entities** (people, teams, services) as nodes and **relationships** (owns, uses, failed in) as labelled edges.",
        "Each fact is a small triple: subject, relation, object.",
      ],
      callout: { kind: "insight", text: "Links are explicit, so a connection no longer depends on wording." },
      show: ["docs", "graph", "retriever", "llm"], focus: ["graph"],
      panel: { kind: "graph", nodes: graphNodes, edges: graphEdges, questions: [] },
      data: { title: "Facts as triples", data: [["Payments team", "owns", "Checkout svc"], ["Checkout svc", "failed in", "Incident 42"], ["Checkout svc", "uses", "Orders DB"]] },
    },
    {
      short: "Extract", chapter: "technique", title: "An LLM builds the graph from text",
      body: [
        "Nobody types the graph by hand. An **entity extractor**, usually an LLM, reads each document and outputs the entities and relations it finds.",
        "The same entity gets merged across documents, so \"Checkout\" and \"Checkout svc\" become one node.",
      ],
      callout: { kind: "tip", text: "Merging names (entity resolution) is a hard part of the build." },
      show: ["docs", "extractor", "graph", "retriever", "llm"], focus: ["docs", "extractor", "graph"],
      flows: [{ from: "docs", to: "extractor", label: "text" }, { from: "extractor", to: "graph", label: "triples" }],
      data: { title: "Extractor input and output", data: { text: "The Payments team owns the Checkout service. Checkout failed during Incident 42.", entities: [{ name: "Payments team", type: "Team" }, { name: "Checkout svc", type: "Service" }, { name: "Incident 42", type: "Incident" }], relations: [["Payments team", "owns", "Checkout svc"], ["Checkout svc", "failed in", "Incident 42"]] } },
    },
    {
      short: "Traverse", chapter: "technique", title: "Retrieval follows the links",
      body: [
        "Find the entities in the question, then **traverse**: walk edges from them, hop by hop, and collect the facts on the path.",
        "Pick a question and compare. Dashed hits are what plain vector search returned.",
      ],
      show: ["docs", "extractor", "graph", "retriever", "llm"], focus: ["graph", "retriever"],
      flows: [{ from: "graph", to: "retriever", label: "path" }, { from: "retriever", to: "llm", label: "facts" }],
      panel: { kind: "graph", nodes: graphNodes, edges: graphEdges, questions: [
        { text: "Which team owns the service that failed?", path: ["inc42", "checkout", "payments"], answer: "The Payments team. Incident 42 hit Checkout, which Payments owns.", vectorHits: ["inc42"] },
        { text: "Who leads the team behind Incident 42?", path: ["inc42", "checkout", "payments", "maria"], answer: "Maria. Incident 42 hit Checkout, owned by Payments, which she leads.", vectorHits: ["inc42", "payments"] },
        { text: "Who is on call for the database Checkout uses?", path: ["checkout", "db", "infra", "raj"], answer: "Raj. Checkout uses Orders DB, owned by Infra, where he is on call.", vectorHits: ["db"] },
      ] },
    },
    {
      short: "Themes", chapter: "technique", title: "Communities answer big-picture questions",
      body: [
        "\"What are the main themes?\" has no single path. Graph systems group tightly linked nodes into **communities** and have an LLM write a summary of each.",
        "For global questions, the model reads those summaries instead of thousands of passages.",
      ],
      callout: { kind: "insight", text: "Plain RAG is good at looking up facts. Community summaries help with the whole corpus." },
      show: ["docs", "extractor", "graph", "retriever", "llm"], focus: ["graph"],
      data: { title: "Community summaries", data: { question: "What are the main themes this quarter?", communities: [{ id: "c1", nodes: ["Payments team", "Checkout svc", "Incident 42"], summary: "Checkout reliability after the March deploy." }, { id: "c2", nodes: ["Infra team", "Orders DB", "Raj"], summary: "Database capacity and on-call load." }] } },
    },
    {
      short: "Costs", chapter: "tradeoff", title: "A better answer, a bigger bill",
      body: [
        "Building the graph means an LLM reads every document. Updating it means re-extracting and re-merging whenever documents change.",
        "Extraction can also be wrong: a missed edge or a false merge quietly breaks a path.",
      ],
      callout: { kind: "warn", text: "Use a graph when questions truly need links. Otherwise it is expensive overhead." },
      show: ["docs", "extractor", "graph", "retriever", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Build cost", text: "Every document passes through an LLM before anyone asks a question.", tone: "orange" },
        { title: "Upkeep", text: "Changed documents mean re-extraction, merging and cleanup.", tone: "violet" },
        { title: "Extraction errors", text: "A wrong or missing edge gives a confident, wrong answer.", tone: "rose" },
        { title: "Best fit", text: "Rich relationships: org charts, systems, legal, research.", tone: "green" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Vectors find text, graphs follow links",
      body: [
        "Vector search matches meaning. A graph follows relationships. Many systems use both: vectors to find starting points, the graph to expand from them.",
      ],
      callout: { kind: "next", text: "Next: let the system check its own retrieval with Self-RAG." },
      show: ["docs", "extractor", "graph", "retriever", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Vector search", text: "Fast. Finds passages that sound like the question.", tone: "blue" },
        { title: "Graph traversal", text: "Follows owns, uses and failed-in links across documents.", tone: "violet" },
        { title: "Together", text: "Vector hit as the entry point, graph hops for the connected facts.", tone: "green" },
      ] },
    },
  ],
};
