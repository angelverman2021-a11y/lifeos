import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { mood, previousEntries } = await req.json();

  const prompt = `Generate 3 unique, thoughtful gratitude journal prompts for someone feeling "${mood || "neutral"}".
${previousEntries ? `They've previously written about: ${previousEntries}. Avoid similar topics.` : ""}

Return ONLY a valid JSON array:
["prompt 1", "prompt 2", "prompt 3"]

Make prompts specific, reflective, and emotionally engaging. Not generic like "what are you grateful for today".`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\[[\s\S]*\]/)?.[0];
    return NextResponse.json({ prompts: json ? JSON.parse(json) : [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
