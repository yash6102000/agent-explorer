import type { Lesson } from "../types";

export const embeddings: Lesson = {
  id: "embeddings",
  title: "Embeddings",
  summary: "Turning text into coordinates so that similar meanings sit close together.",
  goals: ["What an embedding is", "How similarity is measured", "What embeddings are used for", "Where they go wrong"],
  nodes: [
    { id: "text", icon: "docs", label: "Text", sub: "word, sentence, chunk", x: 90, y: 70, tone: "green" },
    { id: "query", icon: "laptop", label: "Query", sub: "another text", x: 90, y: 250, tone: "blue" },
    { id: "model", icon: "chip", label: "Embedding model", sub: "text → vector", x: 320, y: 160, tone: "violet" },
    { id: "space", icon: "rack", label: "Vector space", sub: "meaning as position", x: 570, y: 160, tone: "orange" },
  ],
  links: [{ a: "text", b: "model" }, { a: "query", b: "model" }, { a: "model", b: "space" }],
  words: [
    { id: "cat", text: "cat", angle: 20, radius: 0.8 }, { id: "kitten", text: "kitten", angle: 28, radius: 0.65 },
    { id: "dog", text: "dog", angle: 38, radius: 0.85 }, { id: "puppy", text: "puppy", angle: 46, radius: 0.7 },
    { id: "car", text: "car", angle: 122, radius: 0.8 }, { id: "truck", text: "truck", angle: 134, radius: 0.9 }, { id: "bus", text: "bus", angle: 146, radius: 0.7 },
    { id: "apple", text: "apple", angle: 214, radius: 0.8 }, { id: "banana", text: "banana", angle: 230, radius: 0.9 }, { id: "orange", text: "orange", angle: 246, radius: 0.7 },
  ],
  steps: [
    {
      short: "Meaning as place", chapter: "problem", title: "Computers can't compare meaning. They can compare numbers.",
      body: [
        "“Cat” and “kitten” mean nearly the same, while “cat” and “truck” don't. But to a program they are just different strings.",
        "An **embedding** gives every piece of text a position, a list of numbers, so that **similar meanings land close together**. Click a word on the map.",
      ],
      callout: { kind: "insight", text: "This map has 2 dimensions so you can see it. Real embeddings use hundreds or thousands." },
      show: ["text", "model", "space"], focus: ["space"], flows: [{ from: "model", to: "space", label: "positions" }],
      panel: { kind: "wordmap" },
    },
    {
      short: "Text → vector", chapter: "technique", title: "An embedding model maps text to a vector",
      body: [
        "An **embedding model** is a neural network trained so that texts used in similar contexts get similar vectors. You send text in and get a fixed-length list of numbers back.",
        "The length is the same whether you embed one word or a paragraph.",
      ],
      callout: { kind: "tip", text: "Embedding models are separate from chat models. They are smaller, cheaper and only output vectors." },
      show: ["text", "model", "space"], focus: ["model"], flows: [{ from: "text", to: "model", label: "text" }, { from: "model", to: "space", label: "vector" }],
      panel: { kind: "wordmap" },
      data: { title: "Embedding API (truncated)", data: { request: { model: "embed-example", input: "cat" }, response: { dimensions: 1024, embedding: [0.021, -0.113, 0.347, 0.008, "… 1020 more"] } } },
    },
    {
      short: "Similarity", chapter: "technique", title: "Closeness is measured by the angle between vectors",
      body: [
        "To compare two texts, compare their vectors. The standard measure is **cosine similarity**: the cosine of the angle between them.",
        "Same direction gives **1.0**. Unrelated texts land near **0**. Opposite meanings can go negative. Click different words and watch the bars.",
      ],
      callout: { kind: "insight", text: "Only direction matters, not vector length. That is why a short and a long text about the same topic can still match." },
      show: ["text", "query", "model", "space"], focus: ["query", "space"], flows: [{ from: "query", to: "model", label: "query" }, { from: "model", to: "space", label: "compare" }],
      panel: { kind: "wordmap" },
      data: { title: "Cosine similarity", data: { formula: "cos(θ) = (a · b) / (‖a‖ ‖b‖)", examples: { "cat vs kitten": 0.99, "cat vs dog": 0.95, "cat vs truck": -0.41 } } },
    },
    {
      short: "Dimensions", chapter: "insight", title: "Why hundreds of dimensions?",
      body: ["Two numbers can't capture everything about a word. More dimensions let the model separate more kinds of similarity at once."],
      show: ["text", "model", "space"],
      panel: { kind: "cards", cards: [
        { title: "2-D (this demo)", text: "Enough to draw, enough to show clusters. Far too few for real language.", tone: "gray" },
        { title: "384 to 1536", text: "Typical sizes. Each dimension has no human meaning on its own; the pattern across them does.", tone: "violet" },
        { title: "Trade-off", text: "More dimensions can capture more nuance but cost more to store and search.", tone: "orange" },
      ] },
    },
    {
      short: "Uses", chapter: "technique", title: "What embeddings are used for",
      body: ["Once text is a vector, a whole family of tasks becomes simple geometry."],
      show: ["text", "query", "model", "space"],
      panel: { kind: "cards", cards: [
        { title: "Semantic search", text: "Find documents by meaning, not matching words. This is the heart of RAG.", tone: "green" },
        { title: "Clustering", text: "Group similar items, such as support tickets by topic.", tone: "violet" },
        { title: "Deduplication", text: "Detect near-identical texts even when reworded.", tone: "orange" },
        { title: "Recommendations", text: "Suggest items whose vectors are near what a user liked.", tone: "blue" },
        { title: "Classification", text: "Train a tiny classifier on top of embeddings.", tone: "rose" },
      ] },
    },
    {
      short: "Pitfalls", chapter: "tradeoff", title: "Where embeddings go wrong",
      body: ["Embeddings capture topical similarity well, but they are not understanding."],
      show: ["text", "query", "model", "space"],
      panel: { kind: "cards", cards: [
        { title: "Mixed models", text: "Vectors from different models live in different spaces. Never compare them.", tone: "rose" },
        { title: "Negation", text: "“Refunds are allowed” and “refunds are not allowed” can land very close.", tone: "rose" },
        { title: "Domain gap", text: "A general model may blur jargon from medicine, law or your own product names.", tone: "orange" },
        { title: "Exact matches", text: "IDs, codes and rare names are hard to match by meaning. Hybrid search helps.", tone: "orange" },
      ] },
    },
    {
      short: "Recap", chapter: "recap", title: "Recap",
      body: [
        "An **embedding** is a vector that places text by meaning.",
        "**Cosine similarity** compares two vectors by their angle.",
        "That makes semantic search possible, and it is the engine inside RAG.",
      ],
      callout: { kind: "next", text: "Next: Simple RAG puts tokens, windows and embeddings to work." },
      show: ["text", "query", "model", "space"],
      panel: { kind: "cards", cards: [
        { title: "Embed", text: "Text in, fixed-length vector out.", tone: "violet" },
        { title: "Compare", text: "Cosine similarity of two vectors.", tone: "green" },
        { title: "Use", text: "Search, cluster, dedupe, recommend, RAG.", tone: "orange" },
      ] },
    },
  ],
};
