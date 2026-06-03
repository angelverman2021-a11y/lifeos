import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  const prompt = `Generate exactly 6 flashcards from these notes. Each flashcard should test a specific concept from the notes.

Notes:
"${notes}"

Return ONLY a valid JSON array, no extra text, no markdown code blocks:
[
  {"front": "specific question about the notes", "back": "accurate answer from the notes"}
]`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\[[\s\S]*\]/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    const flashcards = JSON.parse(json);
    return NextResponse.json({ flashcards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Groq error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
