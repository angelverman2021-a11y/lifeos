import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const TONE_PROMPTS: Record<string, string> = {
  deep: `Write a deep, reflective, and emotionally rich journal entry. Use introspective language, explore feelings and meaning. Make it feel like a personal diary entry that captures the soul of the moment.`,
  aesthetic: `Write a beautifully aesthetic journal entry with poetic language, vivid imagery, and a dreamy tone. Use metaphors and sensory details. Make it feel like a page from a beautiful journal.`,
  funny: `Write a funny, lighthearted, and witty journal entry. Use humor, sarcasm, and relatable observations. Make it entertaining while still capturing the memory.`,
  minimal: `Write a clean, minimal, and honest journal entry. Short sentences, no fluff. Just the raw truth of the moment in simple words.`,
};

export async function POST(req: NextRequest) {
  const { description, tone, imageContext } = await req.json();

  const prompt = `${TONE_PROMPTS[tone] || TONE_PROMPTS.deep}

The user wants to journal about: "${description}"
${imageContext ? `Additional context from their photo: ${imageContext}` : ""}

Write a journal entry of 3-4 paragraphs. Make it personal, vivid, and true to the tone. Start directly with the entry, no titles or headers.`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    return NextResponse.json({ entry: text });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
