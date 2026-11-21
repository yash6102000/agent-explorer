import type { Lesson } from "../types";

export const ragEval: Lesson = {
  id: "rag-eval",
  title: "Evaluating RAG",
  summary: "Measure retrieval and generation separately, then fix what is broken.",
  goals: ["Build a small test set", "Measure retrieval with recall@k", "Measure answers with faithfulness", "Triage failures to the right fix"],
  nodes: [
    { id: "tests", icon: "docs", label: "Test set", sub: "questions + sources", x: 90, y: 150, tone: "green" },
    { id: "pipeline", icon: "chip", label: "RAG pipeline", sub: "retrieve + generate", x: 300, y: 150, tone: "violet" },
    { id: "judge", icon: "tower", label: "Judge", sub: "code or LLM", x: 510, y: 150, tone: "orange" },
    { id: "scores", icon: "rack", label: "Scores", sub: "per question, overall", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "tests", b: "pipeline" }, { a: "pipeline", b: "judge" }, { a: "tests", b: "judge" }, { a: "judge", b: "scores" }],
  steps: [
    {
      short: "Why", chapter: "problem", title: "\"It looks right\" is not a test",
      body: [
        "Trying a few questions by hand hides regressions. Change the chunk size and one answer improves while three others quietly break.",
        "A RAG system has two parts that fail differently: **retrieval** (finding passages) and **generation** (writing the answer). Score them separately.",
      ],
      callout: { kind: "insight", text: "If you cannot tell which part failed, you cannot fix it." },
      show: ["pipeline"], focus: ["pipeline"],
      panel: { kind: "cards", cards: [
        { title: "Retrieval", text: "Did the right passage reach the model?", tone: "violet" },
        { title: "Generation", text: "Given the passages, was the answer good?", tone: "rose" },
      ] },
    },
    {
      short: "Test set", chapter: "setup", title: "Build a small test set first",
      body: [
        "Write 30 to 100 real questions. For each, record the **source passage** that holds the answer and a short reference answer.",
        "Start with questions users actually ask, plus a few hard ones.",
      ],
      callout: { kind: "tip", text: "Twenty good questions beat a thousand synthetic ones you never read." },
      show: ["tests", "pipeline"], focus: ["tests"], flows: [{ from: "tests", to: "pipeline", label: "question" }],
      data: { title: "One test case", data: { id: "q07", question: "What is the refund window for annual plans?", gold_passage: "billing-faq#chunk-12", reference_answer: "30 days from purchase" } },
    },
    {
      short: "Retrieval", chapter: "technique", title: "Retrieval: was the right passage found?",
      body: [
        "**Recall@k**: is the gold passage in the top k results? **Precision@k**: what share of the top k is relevant? **MRR** (mean reciprocal rank): average of 1 divided by the rank of the first right hit.",
        "Recall matters most. A passage that is not retrieved cannot be used.",
      ],
      show: ["tests", "pipeline", "judge"], focus: ["judge"],
      flows: [{ from: "pipeline", to: "judge", label: "top 3" }],
      metrics: [{ label: "recall@3", value: "0.80" }, { label: "MRR", value: "0.57" }],
      data: { title: "Retrieval scores, 5 questions, k = 3", data: { gold_rank: { q1: 1, q2: 2, q3: 3, q4: "not in top 3", q5: 1 }, recall_at_3: "4 of 5 = 0.80", mrr: "(1 + 0.5 + 0.33 + 0 + 1) / 5 = 0.57", precision_at_3_for_q2: "1 relevant of 3 = 0.33" } },
    },
    {
      short: "Generation", chapter: "technique", title: "Generation: is the answer grounded?",
      body: [
        "**Faithfulness**: is every claim in the answer supported by the retrieved context? **Answer relevance**: does it address the question? **Context relevance**: is the retrieved text on topic, or mostly noise?",
        "Faithfulness is the hallucination check.",
      ],
      show: ["tests", "pipeline", "judge", "scores"], focus: ["judge", "scores"],
      flows: [{ from: "judge", to: "scores", label: "scores" }],
      metrics: [{ label: "faithfulness", value: "0.75" }, { label: "answer relevance", value: "high" }],
      data: { title: "Faithfulness on one answer", data: { answer_claims: 4, supported_by_context: 3, unsupported: ["Refunds are issued within 24 hours"], faithfulness: "3 / 4 = 0.75" } },
    },
    {
      short: "Judge", chapter: "tradeoff", title: "Using an LLM as the judge",
      body: [
        "Checking claims by hand does not scale, so a second model scores each answer against the context and a rubric. This is **LLM-as-judge**.",
        "Judges are useful, not perfect. Spot-check their verdicts against your own.",
      ],
      callout: { kind: "warn", text: "Judges can favour long answers and their own writing style." },
      show: ["tests", "pipeline", "judge", "scores"], focus: ["judge"],
      panel: { kind: "cards", cards: [
        { title: "Use a clear rubric", text: "Ask one narrow question per score, with examples of pass and fail.", tone: "green" },
        { title: "Calibrate", text: "Hand-label 20 cases and check the judge agrees with you.", tone: "blue" },
        { title: "Known biases", text: "Verbosity, position in the prompt, and preferring similar models.", tone: "rose" },
      ] },
    },
    {
      short: "Triage", chapter: "insight", title: "Triage failures to the right fix",
      body: [
        "Read the failed cases and sort them. The scores tell you where to spend effort.",
      ],
      show: ["tests", "pipeline", "judge", "scores"], focus: ["pipeline"],
      panel: { kind: "cards", cards: [
        { title: "Right chunk not retrieved", text: "Low recall. Fix retrieval: chunking, embeddings, hybrid search, query rewrite.", tone: "violet" },
        { title: "Retrieved but ignored", text: "Recall fine, answer wrong. Fix prompt or reranking; send fewer, better chunks.", tone: "orange" },
        { title: "Unsupported claim", text: "Low faithfulness. Tighten the prompt, require citations, add a grader.", tone: "rose" },
      ] },
    },
    {
      short: "Loop", chapter: "recap", title: "Evaluate on every change",
      body: [
        "Keep the test set in version control and rerun it after each change. A number that moves tells you whether the change helped.",
      ],
      callout: { kind: "next", text: "Next: a field guide to the ways RAG fails in production." },
      show: ["tests", "pipeline", "judge", "scores"],
      panel: { kind: "cards", cards: [
        { title: "Before", text: "Recall@3 0.80, faithfulness 0.75 (toy numbers).", tone: "gray" },
        { title: "Change one thing", text: "Add a reranker, nothing else.", tone: "blue" },
        { title: "After", text: "Rerun the same set. Keep the change only if scores improve.", tone: "green" },
      ] },
    },
  ],
};
