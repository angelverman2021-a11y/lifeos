import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { equation, mode } = await req.json();

  const prompts: Record<string, string> = {
    solve: `Solve this equation step by step: ${equation}\nReturn JSON only (no markdown): { "steps": ["step1", "step2"], "answer": "final answer", "explanation": "brief explanation" }`,
    simplify: `Simplify this expression: ${equation}\nReturn JSON only (no markdown): { "steps": ["step1", "step2"], "answer": "simplified form", "explanation": "brief explanation" }`,
    vector: `Perform this vector operation: ${equation}\nReturn JSON only (no markdown): { "steps": ["step1", "step2"], "answer": "result", "explanation": "brief explanation" }`,
    practice: `Generate 3 math practice problems for: ${equation}\nReturn JSON only (no markdown): { "problems": [{ "question": "...", "answer": "...", "hint": "..." }] }`,
  };

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: "You are a math tutor. Return valid JSON only, no markdown fences.",
      prompt: prompts[mode] || prompts.solve,
    });
    const clean = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
