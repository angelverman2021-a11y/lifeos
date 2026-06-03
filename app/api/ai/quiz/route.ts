import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const LEVEL_PROMPTS: Record<number, string> = {
  1: `Generate 5 EASY multiple choice questions. Focus on basic definitions, simple facts, and straightforward concepts. Questions should be answerable by a beginner.`,
  2: `Generate 5 MEDIUM multiple choice questions. Focus on understanding, application, and connections between concepts. Requires some deeper knowledge.`,
  3: `Generate 5 HARD multiple choice questions. Focus on analysis, edge cases, tricky distinctions, and advanced concepts. Should challenge even someone who studied well.`,
};

const FLASHCARD_LEVEL_PROMPTS: Record<number, string> = {
  1: `Generate 6 BASIC flashcards. Focus on key terms, definitions, and simple facts. Easy to remember.`,
  2: `Generate 6 INTERMEDIATE flashcards. Focus on how things work, comparisons, and applications.`,
  3: `Generate 6 ADVANCED flashcards. Focus on complex relationships, edge cases, and deep understanding.`,
};

export async function POST(req: NextRequest) {
  const { notes, level = 1, type = "quiz" } = await req.json();

  const levelPrompt = type === "flashcard"
    ? FLASHCARD_LEVEL_PROMPTS[level]
    : LEVEL_PROMPTS[level];

  const prompt = type === "flashcard"
    ? `${levelPrompt}

Notes:
"${notes}"

Return ONLY a valid JSON array, no extra text, no markdown:
[{"front": "question", "back": "answer"}]`
    : `${levelPrompt}

Notes:
"${notes}"

Return ONLY a valid JSON array, no extra text, no markdown:
[{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]

"correct" is the index (0-3) of the right answer.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\[[\s\S]*\]/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    const items = JSON.parse(json);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Groq error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
