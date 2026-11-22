import type { Lesson } from "../types";

export const localModels: Lesson = {
  id: "local-models",
  title: "Running Models Locally",
  summary: "Open weights, quantization and when your own machine beats an API.",
  goals: ["What open weights are", "Memory = parameters x bytes", "How quantization shrinks a model", "Local versus hosted"],
  nodes: [
    { id: "weights", icon: "docs", label: "Open weights", sub: "a file of numbers", x: 90, y: 150, tone: "green" },
    { id: "quant", icon: "chunker", label: "Quantizer", sub: "fewer bits per weight", x: 310, y: 150, tone: "orange" },
    { id: "runtime", icon: "chip", label: "Runtime", sub: "loads and runs it", x: 520, y: 150, tone: "violet" },
    { id: "machine", icon: "laptop", label: "Your machine", sub: "CPU, GPU or both", x: 720, y: 150, tone: "blue" },
  ],
  links: [{ a: "weights", b: "quant" }, { a: "quant", b: "runtime" }, { a: "runtime", b: "machine" }],
  steps: [
    {
      short: "Open weights", chapter: "problem", title: "A model is just a big file",
      body: [
        "A model is a huge list of numbers called **weights**. **Open weights** means the maker publishes that file, so you can download and run it yourself.",
        "Hosted models keep the file on their servers. You only send text.",
      ],
      callout: { kind: "insight", text: "Open weights is not always open source. Check the licence for what you may do." },
      show: ["weights"], focus: ["weights"],
      data: { title: "What you download (simplified)", data: { files: ["model.weights", "tokenizer", "config"], parameters: "7 billion (a small model)", size_on_disk: "about 14 GB at 16-bit" } },
    },
    {
      short: "Memory math", chapter: "setup", title: "Memory = parameters x bytes",
      body: [
        "Each weight takes space. At **16-bit** that is 2 bytes. A 7-billion-parameter model needs about 14 GB just to load.",
        "Drag the size. Watch which devices can hold it.",
      ],
      callout: { kind: "tip", text: "Add some headroom: running the model also needs memory for the context." },
      show: ["weights", "machine"], focus: ["machine"], flows: [{ from: "weights", to: "machine", label: "14 GB" }],
      panel: { kind: "quant", params: 7, bits: 16, controls: ["size"] },
    },
    {
      short: "Quantize", chapter: "solution", title: "Quantization: fewer bits per weight",
      body: [
        "**Quantization** stores each weight with fewer bits, say 8 or 4 instead of 16. Same model, smaller file.",
        "It rounds the numbers, so quality dips a little.",
      ],
      show: ["weights", "quant", "machine"], focus: ["quant"], flows: [{ from: "weights", to: "quant", label: "16-bit" }, { from: "quant", to: "machine", label: "4-bit" }],
      panel: { kind: "quant", params: 7, controls: ["bits"] },
      data: { title: "Same weight, fewer bits (toy)", data: { original_16bit: 0.4372, rounded_8bit: 0.437, rounded_4bit: 0.44, note: "Fewer bits means coarser rounding." } },
    },
    {
      short: "Trade-off", chapter: "tradeoff", title: "What you give up",
      body: [
        "Going from 16 to 8 bit usually costs little. 4-bit often still works well. Below that, quality drops faster, especially on hard reasoning and code.",
        "A bigger model at 4-bit often beats a smaller one at 16-bit in the same memory.",
      ],
      callout: { kind: "warn", text: "Do not trust a rule of thumb. Test the quantized model on your own task." },
      show: ["weights", "quant", "runtime", "machine"], focus: ["quant"],
      panel: { kind: "cards", cards: [
        { title: "16-bit", text: "Best quality. Needs the most memory.", tone: "green" },
        { title: "8-bit", text: "Half the memory. Usually a very small loss.", tone: "blue" },
        { title: "4-bit", text: "Quarter of the memory. Small to moderate loss.", tone: "orange" },
        { title: "Below 4-bit", text: "Fits anywhere, but quality can fall sharply.", tone: "rose" },
      ] },
    },
    {
      short: "Runtimes", chapter: "technique", title: "A runtime does the running",
      body: [
        "A **runtime** is the program that loads the weights and generates tokens. It picks the hardware: **CPU** (works anywhere, slow), **GPU** (fast, limited memory) or **unified memory** (CPU and GPU share one pool).",
        "Speed depends mostly on memory bandwidth, not just raw compute.",
      ],
      callout: { kind: "tip", text: "Many runtimes expose a local server that looks like a hosted API." },
      show: ["weights", "quant", "runtime", "machine"], focus: ["runtime", "machine"], flows: [{ from: "runtime", to: "machine", label: "tokens" }],
      data: { title: "Local request (simplified)", data: { to: "localhost, a port on your machine", model: "my-model-4bit", messages: [{ role: "user", content: "Summarise this note." }], leaves_your_machine: false } },
    },
    {
      short: "Local vs hosted", chapter: "recap", title: "When local wins, when hosted wins",
      body: ["Pick by your constraints, not by habit. Many teams use both."],
      callout: { kind: "next", text: "Next: Voice AI Architecture, putting speech models to work in a live conversation." },
      show: ["weights", "quant", "runtime", "machine"],
      panel: { kind: "cards", cards: [
        { title: "Local wins", text: "Private data, offline use, steady high volume, full control.", tone: "green" },
        { title: "Hosted wins", text: "Top quality, no operations, bursty or low volume.", tone: "violet" },
        { title: "Honest limits", text: "Smaller models, you handle updates, hardware cost, and speed.", tone: "orange" },
      ] },
    },
  ],
};
