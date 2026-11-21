import type { Lesson } from "../types";

export const whatIsRag: Lesson = {
  id: "what-is-rag",
  title: "What is RAG?",
  summary: "Why models guess, and the open-book idea that fixes it.",
  goals: ["Why a model can't answer from your private data", "What Retrieval-Augmented Generation means", "RAG vs fine-tuning vs a long context", "When RAG is and isn't a good fit"],
  nodes: [
    { id: "docs", icon: "docs", label: "Your documents", sub: "wiki, PDFs, tickets", x: 90, y: 70, tone: "green" },
    { id: "user", icon: "laptop", label: "Question", sub: "from the user", x: 90, y: 230, tone: "blue" },
    { id: "retriever", icon: "chip", label: "Retriever", sub: "finds the passages", x: 340, y: 150, tone: "violet" },
    { id: "prompt", icon: "layers", label: "Prompt", sub: "question + passages", x: 540, y: 150, tone: "orange" },
    { id: "llm", icon: "tower", label: "LLM", sub: "writes the answer", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "docs", b: "retriever" }, { a: "user", b: "retriever" }, { a: "retriever", b: "prompt" }, { a: "user", b: "prompt" }, { a: "prompt", b: "llm" }],
  steps: [
    {
      short: "The gap", chapter: "problem", title: "A model knows the internet, not your business",
      body: [
        "A model learns from public text, once, in the past. It has never seen your wiki, your tickets or today's prices.",
        "Ask about them and it **guesses**, fluently.",
      ],
      callout: { kind: "warn", text: "Fluent is not the same as true." },
      show: ["user", "llm"], focus: ["llm"], flows: [{ from: "user", to: "llm", label: "question" }],
      panel: { kind: "cards", cards: [
        { title: "Private data", text: "Your documents were never in its training set.", tone: "rose" },
        { title: "Fresh data", text: "It knows nothing after its cutoff date.", tone: "orange" },
        { title: "Exact facts", text: "Policies and numbers get paraphrased or invented.", tone: "violet" },
      ] },
      data: { title: "Model with no documents", data: { question: "What is our refund window?", answer: "Most stores allow 14 days, but check your receipt.", problem: "Sounds right. Wrong for your company." } },
    },
    {
      short: "Open book", chapter: "setup", title: "Hand it the right pages",
      body: [
        "Don't retrain the model. At question time, give it the **relevant pages** to read.",
        "Same model, better inputs.",
      ],
      callout: { kind: "insight", text: "Think open-book exam: the model reads, then answers." },
      show: ["user", "llm", "docs"], focus: ["docs"], flows: [{ from: "docs", to: "llm", label: "pages" }],
      data: { title: "Model with the pages", data: { pages: ["Refunds: customers can request a refund within 30 days of purchase."], question: "What is our refund window?", answer: "30 days from purchase." } },
    },
    {
      short: "R · A · G", chapter: "technique", title: "Three words, three jobs",
      body: [
        "**Retrieval-Augmented Generation** is the whole recipe in three verbs. Find the passages, add them to the prompt, let the model write.",
      ],
      show: ["user", "llm", "docs", "retriever", "prompt"], focus: ["retriever", "prompt", "llm"],
      flows: [{ from: "retriever", to: "prompt", label: "passages" }, { from: "prompt", to: "llm", label: "prompt" }],
      panel: { kind: "cards", cards: [
        { title: "1 · Retrieve", text: "Search your documents for the few passages that matter.", tone: "violet" },
        { title: "2 · Augment", text: "Add those passages to the prompt next to the question.", tone: "orange" },
        { title: "3 · Generate", text: "The model answers using them, and can cite them.", tone: "rose" },
      ] },
      data: { title: "The augmented prompt", data: { system: "Answer only from the context.", context: ["[refunds.md] Customers can request a refund within 30 days of purchase."], question: "What is our refund window?" } },
    },
    {
      short: "Compare", chapter: "insight", title: "RAG, fine-tuning or a long prompt?",
      body: [
        "Rule of thumb: **facts go in retrieval, behaviour goes in fine-tuning**.",
      ],
      show: ["user", "llm", "docs", "retriever", "prompt"], focus: ["retriever"],
      panel: { kind: "cards", cards: [
        { title: "Just prompt it", text: "A few small, stable facts. Cheapest. Start here.", tone: "blue" },
        { title: "Long context", text: "A handful of documents, one-off. Cost grows with every question.", tone: "orange" },
        { title: "RAG", text: "Large or changing documents. Needs sources. Updates are instant.", tone: "green" },
        { title: "Fine-tuning", text: "Teach a style, format or skill. A poor way to store facts.", tone: "violet" },
      ] },
    },
    {
      short: "Fit", chapter: "recap", title: "When RAG is a good fit",
      body: [
        "RAG shines when answers live in documents that are **too big, too private or too fresh** for the model to know.",
      ],
      callout: { kind: "next", text: "Next: build the simplest version, one step at a time." },
      show: ["user", "llm", "docs", "retriever", "prompt"],
      panel: { kind: "cards", cards: [
        { title: "Good fit", text: "Support bots, docs search, internal Q&A, anything that must cite sources.", tone: "green" },
        { title: "Poor fit", text: "Summarising a whole corpus, pure reasoning, or data that already fits in the prompt.", tone: "rose" },
      ] },
    },
  ],
};
