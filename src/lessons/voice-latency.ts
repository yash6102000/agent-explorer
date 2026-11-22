import type { Lesson } from "../types";

const stages = [
  { label: "Capture and network", ms: 150, fastMs: 100, fix: "Run servers near the user" },
  { label: "Speech to text", ms: 200, fastMs: 90, fix: "Stream partial results while they talk" },
  { label: "LLM first token", ms: 400, fastMs: 180, fix: "Use a smaller, faster model" },
  { label: "Text to speech", ms: 200, fastMs: 80, fix: "Speak the first sentence as soon as it exists" },
  { label: "Playback", ms: 60, fastMs: 40, fix: "Use small audio buffers" },
];

export const voiceLatency: Lesson = {
  id: "voice-latency",
  title: "Latency & Turn-Taking",
  summary: "Speech feels broken when replies are slow or turns collide.",
  goals: ["Why delay hurts more in speech", "The latency budget and streaming", "Endpointing and barge-in", "Filler phrases for slow work"],
  nodes: [
    { id: "mic", icon: "laptop", label: "Microphone", sub: "user speaks", x: 90, y: 90, tone: "blue" },
    { id: "vad", icon: "layers", label: "Voice detection", sub: "is anyone talking?", x: 400, y: 90, tone: "orange" },
    { id: "stt", icon: "docs", label: "Speech to text", sub: "audio → words", x: 710, y: 90, tone: "green" },
    { id: "llm", icon: "chip", label: "LLM", sub: "decides the reply", x: 710, y: 220, tone: "violet" },
    { id: "tts", icon: "tower", label: "Text to speech", sub: "words → audio", x: 400, y: 220, tone: "green" },
    { id: "speaker", icon: "rack", label: "Speaker", sub: "user hears", x: 90, y: 220, tone: "blue" },
  ],
  links: [
    { a: "mic", b: "vad" }, { a: "vad", b: "stt" }, { a: "stt", b: "llm" },
    { a: "llm", b: "tts" }, { a: "tts", b: "speaker" }, { a: "vad", b: "tts" },
  ],
  steps: [
    {
      short: "Why it hurts", chapter: "problem", title: "A pause that feels like a dropped call",
      body: [
        "In conversation, people usually answer within a fraction of a second. A silence much longer than that feels like confusion, or a bad line.",
        "Chat can take seconds. **Voice cannot.** Every stage between the mic and the speaker adds delay.",
      ],
      callout: { kind: "insight", text: "Users judge a voice agent by the gap before it speaks." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["mic", "speaker"],
      flows: [{ from: "mic", to: "vad", label: "audio" }],
      panel: { kind: "cards", cards: [
        { title: "Chat", text: "A 3 second wait is fine. The user watches text appear.", tone: "green" },
        { title: "Voice", text: "A 3 second silence feels broken. The user asks \"hello?\"", tone: "rose" },
      ] },
      data: { title: "One turn, end to end (illustrative)", data: { user_stops_talking: "t = 0 ms", agent_starts_speaking: "t = ?", goal: "about 800 ms" } },
    },
    {
      short: "The budget", chapter: "setup", title: "Spend a latency budget",
      body: [
        "The **latency budget** adds up every stage: capture and network, speech recognition, the model's first token, speech synthesis, playback.",
        "Aim for about 800 ms from the end of speech to the first sound. Tap a stage to apply its fix.",
      ],
      callout: { kind: "tip", text: "All numbers here are illustrative. Measure your own pipeline." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["stt", "llm", "tts"],
      flows: [{ from: "stt", to: "llm", label: "text" }],
      panel: { kind: "budget", target: 800, unit: "ms", stages },
      data: { title: "Latency budget (illustrative)", data: { capture_and_network: "150 ms", speech_to_text: "200 ms", llm_first_token: "400 ms", text_to_speech: "200 ms", playback: "60 ms", total: "1010 ms", target: "800 ms" } },
    },
    {
      short: "Streaming", chapter: "technique", title: "Stream every stage, wait for none",
      body: [
        "Waiting for each stage to finish makes delays add up. **Streaming** passes partial results onward: words while the user speaks, tokens as the model writes, audio as sentences complete.",
        "The stages overlap, so the total drops.",
      ],
      callout: { kind: "insight", text: "Speak the first sentence while the model writes the second." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["stt", "llm", "tts"],
      flows: [{ from: "llm", to: "tts", label: "tokens" }, { from: "tts", to: "speaker", label: "audio" }],
      panel: { kind: "budget", target: 800, unit: "ms", stages },
      data: { title: "Streaming handoff (simplified)", data: { stt_partial: "I'd like to chan", stt_final: "I'd like to change my flight", llm_stream: ["Sure", ", I can", " help with that."], tts_first_audio: "after the first phrase" } },
    },
    {
      short: "Endpointing", chapter: "technique", title: "Knowing when the user is done",
      body: [
        "**Voice activity detection** finds speech in audio. **Endpointing** decides the turn is over, usually after some silence.",
        "Wait too little and you cut people off mid-thought. Wait too long and the agent feels sluggish.",
      ],
      callout: { kind: "tip", text: "Tune the silence timeout on real callers. Pauses to think or read a number are normal." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["vad"],
      flows: [{ from: "mic", to: "vad", label: "audio" }],
      panel: { kind: "cards", cards: [
        { title: "Too eager", text: "\"My number is 555...\" cut off. The agent answers half a thought.", tone: "rose" },
        { title: "Too slow", text: "The user finishes, then waits an extra second of dead air.", tone: "orange" },
        { title: "Smarter", text: "Use the words too: \"and...\" or a half number means keep waiting.", tone: "green" },
      ] },
      data: { title: "Endpointing settings (illustrative)", data: { silence_ms: 600, rule: "end turn after silence, unless the sentence is clearly unfinished" } },
    },
    {
      short: "Barge-in", chapter: "technique", title: "Let people interrupt",
      body: [
        "In real talk, people cut in. **Barge-in** means the agent stops speaking the moment the user starts, then listens.",
        "That needs the voice detector running while the agent talks, and a way to stop playback fast.",
      ],
      callout: { kind: "warn", text: "Echo of the agent's own voice can trigger false interruptions. Use echo cancellation." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["vad", "tts", "speaker"],
      flows: [{ from: "vad", to: "tts", label: "interrupt" }],
      panel: { kind: "trace", events: [
        { type: "agent", text: "Your flight departs at 9:40 and arrives in Denver at 12:15, with one stop in..." },
        { type: "user", text: "Wait, I need the earlier one." },
        { type: "warn", label: "barge-in", text: "Voice detection hears speech while the agent is talking." },
        { type: "agent", label: "stop audio", text: "Text to speech halts and the unplayed audio is discarded." },
        { type: "agent", text: "Sure. Looking at earlier flights." },
      ] },
      data: { title: "Interrupt event (simplified)", data: { event: "user_speech_started", agent_state: "speaking", actions: ["stop_playback", "cancel_tts", "keep_spoken_text_in_history"] } },
    },
    {
      short: "Filler", chapter: "insight", title: "Cover slow work with a phrase",
      body: [
        "Some replies take longer: a database lookup or a slow tool. A short **filler phrase** like \"Let me check that\" fills the silence honestly.",
        "Start it right away, then speak the real answer when the result arrives.",
      ],
      callout: { kind: "tip", text: "Vary the fillers. The same phrase on every turn sounds robotic." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"], focus: ["llm", "tts"],
      flows: [{ from: "llm", to: "tts", label: "filler" }],
      panel: { kind: "cards", cards: [
        { title: "Acknowledge", text: "\"Got it.\" Say it instantly while the model thinks.", tone: "green" },
        { title: "Narrate", text: "\"Checking your order now.\" Covers a tool call of a few seconds.", tone: "blue" },
        { title: "Avoid", text: "Long scripted stalling. If it takes 10 seconds, say so and offer a callback.", tone: "rose" },
      ] },
      data: { title: "Slow tool, spoken filler (simplified)", data: { user: "Where is my order?", spoken_now: "Let me look that up.", tool: "check_order", tool_ms: 1800, spoken_after: "It shipped yesterday and arrives Friday." } },
    },
    {
      short: "Recap", chapter: "recap", title: "Fast, and polite about turns",
      body: ["Shrink the budget with streaming, a smaller model and nearby servers. Then tune who speaks when."],
      callout: { kind: "next", text: "Next: Building a Voice Agent, with phone lines, tools and handoffs." },
      show: ["mic", "vad", "stt", "llm", "tts", "speaker"],
      panel: { kind: "cards", cards: [
        { title: "Budget", text: "Target about 800 ms. Measure every stage.", tone: "orange" },
        { title: "Streaming", text: "Pass partial results forward at every stage.", tone: "green" },
        { title: "Endpointing", text: "Not too eager, not too slow.", tone: "blue" },
        { title: "Barge-in", text: "Stop talking when the user starts.", tone: "violet" },
        { title: "Fillers", text: "Cover slow tools with a short phrase.", tone: "rose" },
      ] },
    },
  ],
};
