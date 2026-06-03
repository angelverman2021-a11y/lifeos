import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { topic, mode } = await req.json();

  const prompts: Record<string, string> = {
    normal: `Explain "${topic}" in a clear, structured way. Include:
## What is ${topic}?
A proper explanation paragraph.

## Key Concepts
- Bullet points of important ideas

## How it Works
Step by step explanation

## Real World Example
A concrete example

## Summary
A closing paragraph

Be detailed, educational and accurate.`,

    eli5: `Explain "${topic}" like I'm 5 years old. Use a fun real-world analogy, very simple words, short sentences. Make it engaging and easy to understand. Give at least 3-4 paragraphs.`,

    summary: `Give a detailed summary of "${topic}" covering:
- What it is
- Why it matters
- Key components or ideas
- How it is used
- One interesting fact

Be informative and specific, not generic.`,
  };

  const prompt = prompts[mode] || prompts.normal;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    });
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Groq error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
