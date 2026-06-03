import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  const prompt = `Create a detailed mind map for the topic: "${topic}"

Return ONLY valid JSON, no extra text, no markdown code blocks:
{
  "center": "${topic}",
  "branches": [
    {
      "label": "branch name",
      "color": "#a855f7",
      "nodes": ["specific node 1", "specific node 2", "specific node 3"]
    }
  ]
}

Create exactly 4 branches. Each branch should have exactly 3 specific, accurate nodes about "${topic}".
Use these colors: "#a855f7", "#ec4899", "#3b82f6", "#10b981"
Make the content specific and educational about the actual topic.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    const mindmap = JSON.parse(json);
    return NextResponse.json({ mindmap });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Groq error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
