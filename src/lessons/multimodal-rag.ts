import type { Lesson } from "../types";

export const multimodalRag: Lesson = {
  id: "multimodal-rag",
  title: "Multimodal RAG",
  summary: "Search tables, charts and scans, not just clean text.",
  goals: ["Why text-only RAG misses real documents", "Parse everything to text", "Embed images and text together", "Retrieve whole page images"],
  nodes: [
    { id: "pdf", icon: "docs", label: "PDF", sub: "text, tables, charts", x: 90, y: 150, tone: "green" },
    { id: "parser", icon: "chunker", label: "Parser / vision", sub: "OCR, captions", x: 280, y: 70, tone: "blue" },
    { id: "embedder", icon: "chip", label: "Embedder", sub: "text or image", x: 280, y: 230, tone: "violet" },
    { id: "index", icon: "rack", label: "Index", sub: "searchable vectors", x: 500, y: 150, tone: "orange" },
    { id: "llm", icon: "tower", label: "LLM", sub: "reads text or pages", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "pdf", b: "parser" }, { a: "pdf", b: "embedder" }, { a: "parser", b: "embedder" }, { a: "embedder", b: "index" }, { a: "index", b: "llm" }],
  steps: [
    {
      short: "The gap", chapter: "problem", title: "Real documents are not just text",
      body: [
        "Reports hold tables, charts, diagrams and scanned pages. A plain text extractor drops the chart, scrambles the table and returns nothing for a scan.",
        "If it never becomes searchable, the answer is **invisible** to retrieval.",
      ],
      callout: { kind: "warn", text: "Garbage in the index means garbage in the answer." },
      show: ["pdf", "index"], focus: ["pdf"], flows: [{ from: "pdf", to: "index", label: "plain text" }],
      panel: { kind: "cards", cards: [
        { title: "Tables", text: "Rows and columns flatten into a jumble of numbers.", tone: "orange" },
        { title: "Charts", text: "The trend lives in pixels, not in any text layer.", tone: "rose" },
        { title: "Scans", text: "A photo of a page has no text at all.", tone: "violet" },
      ] },
      data: { title: "Naive text extraction", data: { page: "Q3 revenue", extracted: "Region Q2 Q3 EMEA 4.1 4.8 APAC 2.2 2.0", chart: "(lost)", problem: "Which number belongs to which column?" } },
    },
    {
      short: "Parse", chapter: "solution", title: "Option 1: turn everything into text",
      body: [
        "**Parsing** converts each element into text first. OCR (optical character recognition, reading text from pixels) handles scans. A layout-aware parser keeps tables intact.",
        "Then a **vision model** (an LLM that accepts images) writes a caption for each chart. Embed that text as usual.",
      ],
      callout: { kind: "insight", text: "Once it is text, your whole existing RAG pipeline just works." },
      show: ["pdf", "parser", "embedder", "index"], focus: ["parser"],
      flows: [{ from: "pdf", to: "parser", label: "page" }, { from: "parser", to: "embedder", label: "text" }],
      data: { title: "An indexed table chunk", data: { source: "q3-report.pdf p.4", type: "table", text: "| Region | Q2 | Q3 |\n|---|---|---|\n| EMEA | 4.1 | 4.8 |\n| APAC | 2.2 | 2.0 |", note: "Table kept as markdown" } },
    },
    {
      short: "Captions", chapter: "technique", title: "Charts and images become captions",
      body: [
        "A vision model describes the picture in words, and that description is what you embed. Keep a link to the original image so you can show it later.",
        "Quality depends on the caption. A vague caption is a vague search target.",
      ],
      callout: { kind: "tip", text: "Ask the captioner for numbers, axis labels and the takeaway." },
      show: ["pdf", "parser", "embedder", "index"], focus: ["parser", "embedder"],
      flows: [{ from: "parser", to: "embedder", label: "caption" }],
      data: { title: "A captioned image record", data: { source: "q3-report.pdf p.7", type: "image", image_ref: "p7_fig2.png", caption: "Bar chart of revenue by region. EMEA rises from 4.1 to 4.8; APAC dips from 2.2 to 2.0.", embedded: "caption text" } },
    },
    {
      short: "Shared space", chapter: "technique", title: "Option 2: one space for images and text",
      body: [
        "A **multimodal embedding model** maps images and text into the same vector space. A picture of a dog and the words \"a dog\" land close together.",
        "So you can search images with words, with no captions needed.",
      ],
      callout: { kind: "insight", text: "Great for photos and diagrams. Weaker at reading small print or exact numbers." },
      show: ["pdf", "parser", "embedder", "index"], focus: ["embedder", "index"],
      flows: [{ from: "pdf", to: "embedder", label: "image" }, { from: "embedder", to: "index", label: "vector" }],
      data: { title: "Text query, image hit", data: { query: "wiring diagram for the pump", query_vector: "[0.12, -0.40, 0.77, ...]", top_hit: { image: "manual_p23.png", score: 0.81 } } },
    },
    {
      short: "Page images", chapter: "technique", title: "Option 3: retrieve the whole page",
      body: [
        "Skip parsing. Embed a **screenshot of each page**, retrieve the best pages, and hand those images to a vision-capable LLM to read.",
        "Layout, tables and charts stay exactly as the author drew them.",
      ],
      callout: { kind: "warn", text: "Images cost more tokens than text, and the LLM must read them well." },
      show: ["pdf", "parser", "embedder", "index", "llm"], focus: ["index", "llm"],
      flows: [{ from: "index", to: "llm", label: "page images" }],
      data: { title: "Prompt with page images", data: { question: "Which region shrank in Q3?", attachments: ["q3-report_p4.png", "q3-report_p7.png"], answer: "APAC, from 2.2 to 2.0 (p.4)." } },
    },
    {
      short: "Trade-offs", chapter: "recap", title: "Choose by the documents you have",
      body: [
        "Mostly clean text with a few tables? Parse. Photos and diagrams? Multimodal embeddings. Layout-heavy pages? Page images.",
        "You can also mix them in one index.",
      ],
      callout: { kind: "next", text: "Next: compare whole RAG architectures, from naive to agentic." },
      show: ["pdf", "parser", "embedder", "index", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Parse to text", text: "Cheap, searchable, easy to debug. Parsing errors silently lose content.", tone: "blue" },
        { title: "Multimodal embeddings", text: "Search images with words. Fuzzy on exact figures and small text.", tone: "violet" },
        { title: "Page images", text: "Keeps full layout. Higher storage and LLM cost per query.", tone: "orange" },
      ] },
    },
  ],
};
