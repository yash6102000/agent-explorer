import type { Lesson } from "../types";

export const multimodalModels: Lesson = {
  id: "multimodal-models",
  title: "Vision, Audio & Image Models",
  summary: "How models read pictures, hear speech and draw images.",
  goals: ["How an image becomes tokens", "What vision models read well and badly", "Speech in and speech out as model skills", "How image generation works, roughly"],
  nodes: [
    { id: "input", icon: "docs", label: "Image or audio", sub: "pixels, sound", x: 90, y: 150, tone: "blue" },
    { id: "encoder", icon: "chunker", label: "Encoder", sub: "cuts into pieces", x: 340, y: 150, tone: "violet" },
    { id: "model", icon: "tower", label: "Model", sub: "reads the tokens", x: 540, y: 150, tone: "orange" },
    { id: "output", icon: "laptop", label: "Output", sub: "text, image, audio", x: 720, y: 150, tone: "rose" },
  ],
  links: [{ a: "input", b: "encoder" }, { a: "encoder", b: "model" }, { a: "model", b: "output" }],
  steps: [
    {
      short: "Modalities", chapter: "problem", title: "Text is only one kind of input",
      body: [
        "A **modality** is a type of data: text, images, audio, video. A **multimodal** model accepts or produces more than text.",
        "The trick is turning everything into the same thing a model already handles: sequences of tokens.",
      ],
      show: ["input", "model", "output"], focus: ["input"],
      flows: [{ from: "input", to: "model", label: "?" }],
      panel: { kind: "cards", cards: [
        { title: "Image in", text: "Describe a photo, read a chart, extract fields from a receipt.", tone: "blue" },
        { title: "Audio in", text: "Turn speech into a text transcript.", tone: "green" },
        { title: "Audio out", text: "Turn text into natural-sounding speech.", tone: "orange" },
        { title: "Image out", text: "Create a picture from a text description.", tone: "rose" },
      ] },
    },
    {
      short: "Patches", chapter: "solution", title: "An image is cut into patches",
      body: [
        "An **encoder** splits the image into a grid of small squares called **patches**. Each patch becomes a vector, like a token for pixels.",
        "The model then reads patches alongside your text, using the same attention as before.",
      ],
      show: ["input", "encoder", "model", "output"], focus: ["encoder"],
      flows: [{ from: "input", to: "encoder", label: "pixels" }, { from: "encoder", to: "model", label: "patches" }],
      data: { title: "Image to patches (illustrative sizes)", data: { image: "224 x 224 pixels", patchSize: "16 x 16 pixels", grid: "14 x 14", patches: 196, eachPatchBecomes: "one vector, like a token", note: "Bigger images give more patches, so more tokens." } },
    },
    {
      short: "Vision", chapter: "technique", title: "What vision models do well, and badly",
      body: [
        "They are good at describing scenes, reading clear text, and turning screenshots, charts and forms into structured data.",
        "They are weaker at tiny text, exact counting and spatial detail. Check those with your own examples.",
      ],
      callout: { kind: "warn", text: "A confident description can still be wrong. Verify anything that matters." },
      show: ["input", "encoder", "model", "output"], focus: ["model", "output"],
      panel: { kind: "cards", cards: [
        { title: "Usually good", text: "Scene descriptions, clear printed text, layout of a form or chart.", tone: "green" },
        { title: "Often shaky", text: "Small or blurry text, counting many objects, left/right and distances.", tone: "rose" },
      ] },
    },
    {
      short: "Audio", chapter: "technique", title: "Hearing and speaking are model skills",
      body: [
        "**Speech-to-text (STT, also called ASR)** turns audio into text, often with timestamps. **Text-to-speech (TTS)** does the reverse, turning text into a voice.",
        "Here they are model abilities. How a live call chains them is in Voice AI Architecture.",
      ],
      show: ["input", "encoder", "model", "output"], focus: ["input", "output"],
      flows: [{ from: "input", to: "encoder", label: "audio" }, { from: "model", to: "output", label: "text" }],
      data: { title: "Speech recognition output (simplified)", data: { audio: "meeting.wav", segments: [{ start: "0:00.0", end: "0:03.2", text: "Thanks everyone for joining." }, { start: "0:03.2", end: "0:07.8", text: "Let's start with the launch date." }], note: "Accents, noise and names are common error sources." } },
    },
    {
      short: "Generate", chapter: "insight", title: "Image generation starts from noise",
      body: [
        "A **diffusion** model begins with random noise and removes it step by step, nudged each time toward your text prompt.",
        "Early steps set rough shapes and colour. Later steps add detail. It is sculpting from static, not copying a stored picture.",
      ],
      show: ["input", "encoder", "model", "output"], focus: ["output"],
      panel: { kind: "cards", cards: [
        { title: "Start", text: "Pure random noise. Nothing recognisable.", tone: "gray" },
        { title: "Middle", text: "Blurry shapes that match the prompt appear.", tone: "violet" },
        { title: "End", text: "Fine detail is filled in. The image is done.", tone: "rose" },
      ] },
    },
    {
      short: "Limits", chapter: "recap", title: "Richer input costs more",
      body: [
        "Images and audio use many tokens, so they raise cost and delay. Providers also cap image size and count. Resize before sending when detail allows.",
      ],
      callout: { kind: "next", text: "Next: teaching a model your own style with fine-tuning." },
      show: ["input", "encoder", "model", "output"],
      panel: { kind: "cards", cards: [
        { title: "Cost", text: "More patches or audio seconds means more tokens to pay for.", tone: "orange" },
        { title: "Limits", text: "Caps on image size, file length and items per request.", tone: "blue" },
        { title: "Test", text: "Try your real images and recordings, not clean samples.", tone: "green" },
      ] },
    },
  ],
};
