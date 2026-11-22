import type { Lesson } from "../types";

export const voiceAgents: Lesson = {
  id: "voice-agents",
  title: "Building a Voice Agent",
  summary: "Phone lines, tools, handoffs and consent turn a demo into a service.",
  goals: ["How calls reach the agent", "Tools and confirmations during a call", "Human handoff with context", "Consent, disclosure and testing"],
  nodes: [
    { id: "caller", icon: "laptop", label: "Caller", sub: "phone or browser", x: 90, y: 150, tone: "blue" },
    { id: "transport", icon: "tower", label: "Telephony / web", sub: "SIP or WebRTC", x: 300, y: 150, tone: "orange" },
    { id: "agent", icon: "chip", label: "Voice agent", sub: "listens, thinks, speaks", x: 510, y: 150, tone: "violet" },
    { id: "tools", icon: "rack", label: "Tools", sub: "orders, calendar", x: 720, y: 70, tone: "green" },
    { id: "human", icon: "docs", label: "Human agent", sub: "takes over", x: 720, y: 240, tone: "rose" },
  ],
  links: [{ a: "caller", b: "transport" }, { a: "transport", b: "agent" }, { a: "agent", b: "tools" }, { a: "agent", b: "human" }],
  steps: [
    {
      short: "Transports", chapter: "setup", title: "How a call reaches your agent",
      body: [
        "A browser or app usually sends audio over **WebRTC**, a real-time protocol built for low delay. A phone call arrives through **telephony**, often over SIP, the standard for internet phone calls.",
        "Either way, your agent receives an audio stream and sends one back.",
      ],
      callout: { kind: "insight", text: "The transport is plumbing. The agent logic can stay the same." },
      show: ["caller", "transport", "agent"], focus: ["transport"],
      flows: [{ from: "caller", to: "transport", label: "audio" }, { from: "transport", to: "agent", label: "stream" }],
      panel: { kind: "cards", cards: [
        { title: "Web or app", text: "WebRTC. Wideband audio, easy to add a screen or buttons. Examples: LiveKit, Daily.", tone: "blue" },
        { title: "Phone", text: "Telephony or SIP. Reaches anyone, no app needed. Examples: Twilio, Telnyx.", tone: "orange" },
        { title: "Framework", text: "Pipecat and LiveKit Agents wire STT, the LLM and TTS together for you. Examples as of writing.", tone: "violet" },
      ] },
      data: { title: "Incoming call (simplified)", data: { channel: "phone", protocol: "SIP", audio: "8 kHz", caller_id: "+1-555-0100" } },
    },
    {
      short: "Phone audio", chapter: "problem", title: "Phone audio is worse audio",
      body: [
        "Traditional phone audio is narrow and compressed, so consonants blur and speech-to-text (STT) makes more mistakes. Add traffic or a bad connection and it gets harder.",
        "Choose an STT model that handles phone audio, and expect errors on names and numbers.",
      ],
      callout: { kind: "warn", text: "A demo that works on a laptop mic can struggle on a real phone line." },
      show: ["caller", "transport", "agent"], focus: ["caller", "transport"],
      panel: { kind: "cards", cards: [
        { title: "Caller said", text: "\"Change my flight to the fifteenth.\"", tone: "gray" },
        { title: "Agent heard", text: "\"Change my flight to the fifth.\"", tone: "rose" },
        { title: "Fix", text: "Read key details back and let the caller correct them.", tone: "green" },
      ] },
      data: { title: "Transcript confidence (illustrative)", data: { text: "change my flight to fifteenth", words_low_confidence: ["fifteenth"] } },
    },
    {
      short: "Tools", chapter: "technique", title: "Tools during a live call",
      body: [
        "A voice agent can look up an order or book a slot, just like a text agent. See Tool Calling for the format.",
        "On a call, the caller hears dead air while a tool runs. Say a short phrase first, then the result.",
      ],
      callout: { kind: "tip", text: "Keep tools fast and few. Each one costs seconds of silence." },
      show: ["caller", "transport", "agent", "tools"], focus: ["agent", "tools"],
      flows: [{ from: "agent", to: "tools", label: "lookup" }],
      panel: { kind: "trace", events: [
        { type: "agent", text: "Hi, thanks for calling Northwind. This call is handled by an AI assistant. How can I help?" },
        { type: "user", text: "Where is my order? It's number 4821." },
        { type: "agent", label: "filler", text: "Let me look that up." },
        { type: "tool", label: "check_order", text: "order_id: 4821" },
        { type: "result", text: "status: shipped, arrives Friday" },
        { type: "agent", text: "It shipped yesterday and arrives Friday." },
      ] },
      data: { title: "Tool call during a call (simplified)", data: { name: "check_order", arguments: { order_id: "4821" }, spoken_while_waiting: "Let me look that up." } },
    },
    {
      short: "Confirm", chapter: "technique", title: "Read it back before you act",
      body: [
        "Speech-to-text mishears names, digits and codes. Before something irreversible, **read it back**: \"That's 4-8-2-1, correct?\"",
        "Say numbers in small groups with pauses. Spell names letter by letter if asked.",
      ],
      callout: { kind: "warn", text: "Confirm before charging, cancelling or booking, not after." },
      show: ["caller", "transport", "agent", "tools"], focus: ["agent"],
      panel: { kind: "trace", events: [
        { type: "user", text: "Change it to the fifteenth, confirmation B as in boy, K, 7, 2, 9." },
        { type: "agent", label: "read-back", text: "I heard the fifteenth, confirmation B, K, 7, 2, 9. Is that right?" },
        { type: "user", text: "No, the fifth." },
        { type: "agent", text: "Thanks. The fifth, confirmation B, K, 7, 2, 9. Correct?" },
        { type: "user", text: "Yes." },
        { type: "tool", label: "change_date", text: "date: the 5th, code: BK729" },
      ] },
      data: { title: "Confirmed slots (simplified)", data: { date: { value: "the 5th", confirmed: true }, code: { value: "BK729", confirmed: true }, action: "change_date" } },
    },
    {
      short: "Handoff", chapter: "technique", title: "Hand off to a human, with context",
      body: [
        "Some calls need a person: anger, a hard case, a request to speak to someone. Offer it plainly and always honour it.",
        "Pass a short summary and the caller's details, so they never repeat themselves.",
      ],
      callout: { kind: "tip", text: "A cold transfer that makes the caller start over is a failed handoff." },
      show: ["caller", "transport", "agent", "tools", "human"], focus: ["agent", "human"],
      flows: [{ from: "agent", to: "human", label: "summary" }],
      panel: { kind: "trace", events: [
        { type: "user", text: "This is the third time I've called. I want to speak to a person." },
        { type: "agent", text: "I understand. I'll connect you now and share what we've covered." },
        { type: "tool", label: "transfer", text: "queue: billing, summary attached" },
        { type: "agent", label: "human", text: "Hi, I see you were charged twice for order 4821. Let me fix that." },
      ] },
      data: { title: "Handoff packet (simplified)", data: { reason: "caller asked for a person", summary: "Double charge on order 4821, tried refund once", verified: true, transcript_link: "available to the human agent" } },
    },
    {
      short: "Trust", chapter: "insight", title: "Consent, disclosure and real testing",
      body: [
        "Tell callers they are talking to an AI, and say if the call is recorded. Rules on recording and disclosure vary by place, so check with legal advice.",
        "Test with real audio: accents, noise, interruptions, bad lines. Text-only tests miss most voice failures.",
      ],
      callout: { kind: "next", text: "Next: ship it safely. See Structured Outputs for reliable tool inputs, and Evals for testing." },
      show: ["caller", "transport", "agent", "tools", "human"],
      panel: { kind: "cards", cards: [
        { title: "Disclose", text: "\"You're speaking with an AI assistant. This call may be recorded.\"", tone: "blue" },
        { title: "Respect consent", text: "Record or store only what you are allowed to, and for how long.", tone: "orange" },
        { title: "Test with audio", text: "Accents, background noise, talking over the agent, poor signal.", tone: "green" },
        { title: "Common failures", text: "Mishears digits, cuts people off, loops on filler, no way out to a human.", tone: "rose" },
      ] },
    },
  ],
};
