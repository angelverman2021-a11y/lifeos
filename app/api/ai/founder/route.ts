import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { idea, mode } = await req.json();

  const prompts: Record<string, string> = {
    validate: `Validate this startup idea: "${idea}"
Return JSON only (no markdown): {
  "verdict": "Strong",
  "score": 7,
  "marketSize": "description",
  "targetAudience": "description",
  "competitors": ["comp1", "comp2"],
  "uniqueAngle": "what makes it different",
  "risks": ["risk1", "risk2"],
  "greenFlags": ["flag1", "flag2"],
  "redFlags": ["flag1", "flag2"],
  "suggestion": "one key improvement"
}`,
    pitch: `Create a concise pitch for this startup idea: "${idea}"
Return JSON only (no markdown): {
  "tagline": "one line pitch",
  "problem": "problem statement",
  "solution": "solution description",
  "market": "market opportunity",
  "businessModel": "how it makes money",
  "traction": "what to show investors",
  "ask": "what you need"
}`,
    roadmap: `Create a 6-month startup roadmap for: "${idea}"
Return JSON only (no markdown): {
  "phases": [
    { "month": "Month 1-2", "title": "Validation", "tasks": ["task1", "task2"], "milestone": "milestone" },
    { "month": "Month 3-4", "title": "Build", "tasks": ["task1", "task2"], "milestone": "milestone" },
    { "month": "Month 5-6", "title": "Launch", "tasks": ["task1", "task2"], "milestone": "milestone" }
  ]
}`,
  };

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: "You are a startup advisor. Return valid JSON only, no markdown fences.",
      prompt: prompts[mode] || prompts.validate,
    });
    const clean = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
