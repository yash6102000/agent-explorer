import type { Lesson } from "../types";

export const voiceArchitecture: Lesson = {
  id: "voice-architecture",
  title: "Voice AI Architecture",
  summary: "Two designs for talking to an AI: a pipeline, or one audio model.",
  goals: ["The cascaded pipeline", "What each stage passes along", "The speech-to-speech shortcut", "How to choose"],
  nodes: [
    { id: "user", icon: "laptop", label: "User & mic", sub: "audio in", x: 90, y: 60, tone: "green" },
    { id: "stt", icon: "chip", label: "Speech to text", sub: "ASR", x: 310, y: 60, tone: "blue" },
    { id: "llm", icon: "tower", label: "LLM", sub: "reads and replies", x: 520, y: 60, tone: "violet" },
    { id: "tts", icon: "layers", label: "Text to speech", sub: "TTS", x: 720, y: 60, tone: "orange" },
    { id: "speaker", icon: "docs", label: "Speaker", sub: "audio out", x: 720, y: 220, tone: "green" },
    { id: "s2s", icon: "rack", label: "Audio model", sub: "audio in, audio out", x: 400, y: 220, tone: "rose" },
  ],
  links: [
    { a: "user", b: "stt" }, { a: "stt", b: "llm" }, { a: "llm", b: "tts" }, { a: "tts", b: "speaker" },
    { a: "user", b: "s2s" }, { a: "s2s", b: "speaker" },
  ],
  steps: [
    {
      short: "Audio path", chapter: "problem", title: "Voice starts with a microphone",
      body: [
        "Your voice is captured as audio, sent over the network to a server, and the reply travels back to play on a speaker.",
        "The question is what happens in the middle. A language model reads text, so something must bridge audio and text.",
      ],
      callout: { kind: "insight", text: "Voice AI is a design choice about the middle." },
      show: ["user", "speaker"], focus: ["user"], flows: [{ from: "user", to: "speaker", label: "audio" }],
      data: { title: "Audio in transit (simplified)", data: { source: "microphone", format: "small audio frames, sent continuously", destination: "server" } },
    },
    {
      short: "Cascade", chapter: "solution", title: "The cascade: three models in a row",
      body: [
        "**Speech-to-text** (ASR, automatic speech recognition) turns audio into words. A text **LLM** writes the reply. **Text-to-speech** (TTS) speaks it.",
        "Each stage is a separate model you can swap.",
      ],
      show: ["user", "stt", "llm", "tts", "speaker"], focus: ["stt", "llm", "tts"],
      flows: [{ from: "user", to: "stt", label: "audio" }, { from: "stt", to: "llm", label: "text" }, { from: "llm", to: "tts", label: "text" }],
      data: { title: "Cascade, one turn", data: { heard: "audio (2.1 s)", transcript: "Where is my order?", reply_text: "It shipped yesterday.", spoken: "audio (1.4 s)" } },
    },
    {
      short: "Handoffs", chapter: "technique", title: "What each stage passes along",
      body: [
        "Between stages sits plain **text**. You can log it, check it with guardrails, and let the LLM call tools.",
        "But tone, pauses and emotion are lost at the first step.",
      ],
      callout: { kind: "warn", text: "A transcript drops how something was said." },
      show: ["user", "stt", "llm", "tts", "speaker"], focus: ["stt", "llm"],
      panel: { kind: "trace", events: [
        { type: "user", label: "audio", text: "A frustrated voice: \"Where is my order?\" Sent as audio frames." },
        { type: "agent", label: "ASR", text: "Outputs transcript \"Where is my order\" and drops the frustrated tone." },
        { type: "think", label: "LLM", text: "Reads the text, may call a tool, writes the reply in text." },
        { type: "result", label: "tool", text: "Order status: shipped yesterday. Logged and checkable." },
        { type: "agent", label: "TTS", text: "Turns the reply text into audio in a chosen voice." },
      ] },
    },
    {
      short: "Trade-offs", chapter: "tradeoff", title: "Cascade: control, at a delay cost",
      body: [
        "You can mix the best ASR, LLM and voice, and see every step. The price: each stage adds delay, and the text hop discards tone.",
      ],
      callout: { kind: "tip", text: "Latency in detail comes in the next lesson." },
      show: ["user", "stt", "llm", "tts", "speaker"], focus: ["stt", "llm", "tts"],
      panel: { kind: "cards", cards: [
        { title: "Swappable", text: "Change the speech model or voice without touching the LLM.", tone: "green" },
        { title: "Visible", text: "A transcript to log, test and guard.", tone: "blue" },
        { title: "Tool friendly", text: "A text LLM uses tools as usual. See Tool Calling.", tone: "violet" },
        { title: "Delays add up", text: "Three stages, each waiting on the one before.", tone: "rose" },
        { title: "Tone lost", text: "Emotion and emphasis rarely survive the transcript.", tone: "orange" },
      ] },
    },
    {
      short: "Shortcut", chapter: "technique", title: "Speech-to-speech skips the text",
      body: [
        "A **speech-to-speech** model takes audio in and returns audio out in one step. It can hear tone and pauses and answer with natural timing.",
        "Fewer hops usually means lower latency.",
      ],
      show: ["user", "stt", "llm", "tts", "speaker", "s2s"], focus: ["s2s"],
      flows: [{ from: "user", to: "s2s", label: "audio" }, { from: "s2s", to: "speaker", label: "audio" }],
      panel: { kind: "cards", cards: [
        { title: "Keeps tone", text: "Hears emotion, pauses, emphasis, and can sound natural back.", tone: "green" },
        { title: "Faster", text: "One model, no text hop. Usually lower delay.", tone: "blue" },
        { title: "Less control", text: "Harder to see, guard and edit what it will say.", tone: "rose" },
        { title: "Fewer tool options", text: "Tool use and guardrails depend on the model's support.", tone: "orange" },
      ] },
      data: { title: "Speech-to-speech turn", data: { in: "audio (2.1 s)", out: "audio (1.4 s)", transcript: "optional, depends on the model" } },
    },
    {
      short: "Choose", chapter: "recap", title: "Choose by what you need most",
      body: [
        "Need audit trails, strict guardrails and many tools? Cascade. Need natural tone and the lowest delay? Speech-to-speech. Hybrids use each where it fits.",
      ],
      callout: { kind: "next", text: "Next: Latency & Turn-Taking, why delay hurts in speech." },
      show: ["user", "stt", "llm", "tts", "speaker", "s2s"], focus: ["stt", "s2s"],
      panel: { kind: "cards", cards: [
        { title: "Cascaded", text: "Regulated support line that must log and check every reply.", tone: "blue" },
        { title: "Speech-to-speech", text: "A casual companion where tone and timing matter most.", tone: "rose" },
        { title: "Hybrid", text: "Audio model talks, a text LLM handles tools behind it.", tone: "violet" },
      ] },
    },
  ],
};
