import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { dump } = await req.json();

  const prompt = `The user has done a brain dump. Here is their raw, chaotic text:

"${dump}"

Your job:
1. Read everything carefully
2. Identify the main topics and ideas
3. Organize into clean structured notes with proper headings and bullet points
4. Remove repetition, fix grammar
5. Add any missing context that would help understanding
6. Format nicely with ## headings and - bullet points

Be thorough and actually use the content from the brain dump.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Groq error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
