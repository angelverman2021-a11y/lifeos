import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { node, parentTopic } = await req.json();

  const prompt = `Expand the subtopic "${node}" from the topic "${parentTopic}" into 4 more specific sub-points.

Return ONLY a valid JSON array, no extra text:
["sub-point 1", "sub-point 2", "sub-point 3", "sub-point 4"]

Make each sub-point specific, concise (max 5 words), and directly related to "${node}".`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\[[\s\S]*\]/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid format" }, { status: 500 });
    const nodes = JSON.parse(json);
    return NextResponse.json({ nodes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
