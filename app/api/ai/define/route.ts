import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { node, parentTopic } = await req.json();

  const prompt = `Define "${node}" in the context of "${parentTopic}".
Give a clear, concise definition in 2-3 sentences. Be specific and educational.
Just return the definition text, no headings, no bullet points.`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    return NextResponse.json({ definition: text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
