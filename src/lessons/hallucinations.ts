import type { Lesson } from "../types";

export const hallucinations: Lesson = {
  id: "hallucinations",
  title: "Hallucinations & Limits",
  summary: "Models write plausible text, not verified truth. Know when to check.",
  goals: ["Why models state false things confidently", "What makes it more likely", "What reduces it", "Honest limits of LLMs"],
  nodes: [
    { id: "question", icon: "laptop", label: "Question", sub: "what you ask", x: 90, y: 150, tone: "ink" },
    { id: "sources", icon: "docs", label: "Sources", sub: "retrieved evidence", x: 310, y: 60, tone: "green" },
    { id: "llm", icon: "chip", label: "LLM", sub: "predicts plausible text", x: 310, y: 240, tone: "violet" },
    { id: "answer", icon: "tower", label: "Answer", sub: "fluent, maybe wrong", x: 620, y: 150, tone: "orange" },
  ],
  links: [{ a: "question", b: "llm" }, { a: "question", b: "sources" }, { a: "sources", b: "llm" }, { a: "llm", b: "answer" }],
  steps: [
    {
      short: "Confident", chapter: "problem", title: "Fluent does not mean true",
      body: [
        "A **hallucination** is output that sounds right but is false or made up: a fake citation, a wrong date, an invented function.",
        "The tone stays just as confident when the model is wrong.",
      ],
      callout: { kind: "warn", text: "Confidence in the wording tells you nothing about accuracy." },
      show: ["question", "llm", "answer"], focus: ["answer"], flows: [{ from: "question", to: "llm", label: "question" }, { from: "llm", to: "answer", label: "fluent text" }],
      data: { title: "A confident miss (made-up example)", data: { question: "Who wrote the 2019 paper 'Quantum Gardens of Lisbon'?", answer: "It was written by Dr. Elena Marques in 2019.", note: "No such paper is known to exist." } },
    },
    {
      short: "Why", chapter: "setup", title: "It predicts plausible text, not facts",
      body: [
        "The model was trained to pick likely next tokens. A likely-sounding name or number can beat \"I don't know\", even when it is wrong.",
        "There is no built-in fact checker. Here the wrong token has real probability.",
      ],
      callout: { kind: "insight", text: "The model optimises for plausible, not verified." },
      show: ["question", "llm", "answer"], focus: ["llm"],
      panel: { kind: "sampler", prompt: "The first person to walk on the Moon was Neil", tokens: [
        { t: " Armstrong", p: 0.9 }, { t: " Aldrin", p: 0.05 }, { t: " Young", p: 0.02 }, { t: " Gaiman", p: 0.02 }, { t: " Diamond", p: 0.01 },
      ] },
      data: { title: "Next-token odds (illustrative)", data: { note: "Well-known facts get one dominant token. Obscure facts spread the odds across many plausible-sounding guesses." } },
    },
    {
      short: "Triggers", chapter: "insight", title: "What makes it more likely",
      body: [
        "Some situations push models toward guessing. Knowing them tells you when to be careful.",
      ],
      show: ["question", "llm", "answer"], focus: ["question", "llm"],
      panel: { kind: "cards", cards: [
        { title: "Obscure facts", text: "Rare people, papers or numbers the model barely saw in training.", tone: "rose" },
        { title: "No source given", text: "Without text to lean on, it fills gaps from memory.", tone: "orange" },
        { title: "Long outputs", text: "Small slips early can snowball into larger errors later.", tone: "violet" },
        { title: "Leading questions", text: "\"Why is X true?\" can make it agree with a false premise.", tone: "blue" },
      ] },
    },
    {
      short: "Reduce it", chapter: "solution", title: "Ground it in real sources",
      body: [
        "**Grounding** means giving the model trusted text to answer from, usually by retrieving it (**RAG**). It then reads the evidence instead of recalling from memory.",
        "Ask it to cite which passage it used, so you can check.",
      ],
      callout: { kind: "tip", text: "Grounding lowers hallucination a lot. It does not remove it." },
      show: ["question", "sources", "llm", "answer"], focus: ["sources"], flows: [{ from: "question", to: "sources", label: "search" }, { from: "sources", to: "llm", label: "evidence" }],
      data: { title: "Grounded prompt", data: { instruction: "Answer only from the sources. Cite the source id. If the answer is not there, say you don't know.", sources: [{ id: "s1", text: "Refunds are available within 30 days of purchase." }], question: "What is the refund window?" } },
    },
    {
      short: "More fixes", chapter: "technique", title: "More ways to cut the risk",
      body: [
        "No single fix is enough. Combine a few that fit the stakes.",
      ],
      show: ["question", "sources", "llm", "answer"], focus: ["llm", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Allow \"I don't know\"", text: "Say explicitly that declining is fine when evidence is missing.", tone: "green" },
        { title: "Lower temperature", text: "Fewer odd picks. It helps consistency, but not truth.", tone: "blue" },
        { title: "Ask for sources", text: "Quotes and links give you something to verify.", tone: "violet" },
        { title: "Verify", text: "Check key facts, run the code, or add a second review step.", tone: "orange" },
      ] },
    },
    {
      short: "Limits", chapter: "recap", title: "Honest limits to remember",
      body: [
        "Even a good setup has limits. Plan around them instead of hoping.",
      ],
      callout: { kind: "next", text: "Next: AI architectures, the different ways apps wrap a model to fix these limits." },
      show: ["question", "sources", "llm", "answer"],
      panel: { kind: "cards", cards: [
        { title: "Knowledge cutoff", text: "It knows nothing after its training data ends.", tone: "gray" },
        { title: "Arithmetic", text: "Big calculations can go wrong. Use a calculator tool.", tone: "rose" },
        { title: "No live data", text: "Prices, weather and news need a search or API.", tone: "blue" },
        { title: "High stakes", text: "Medical, legal and money decisions need human review.", tone: "orange" },
      ] },
    },
  ],
};
