import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { role, question, answer } = await req.json();

  if (!answer) {
    const prompt = `Generate 5 realistic interview questions for a "${role}" position. Mix behavioral, technical, and situational questions.
Return ONLY a valid JSON array, no extra text:
["question 1", "question 2", "question 3", "question 4", "question 5"]`;
    try {
      const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
      const json = text.match(/\[[\s\S]*\]/)?.[0];
      return NextResponse.json({ questions: json ? JSON.parse(json) : [] });
    } catch (err: unknown) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
    }
  }

  const prompt = `You are an expert interviewer evaluating a candidate for "${role}".

Question: "${question}"
Candidate's answer: "${answer}"

Evaluate the answer and return ONLY valid JSON, no extra text:
{
  "rating": 7,
  "ratingLabel": "Good",
  "whatWasGood": "2-3 specific things done well",
  "improvements": "2-3 specific things to improve",
  "betterAnswer": "A stronger version of the answer in 3-4 sentences",
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Rating scale: 1-3 Poor, 4-5 Average, 6-7 Good, 8-9 Excellent, 10 Perfect
Be honest, specific, and constructive.`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid format" }, { status: 500 });
    return NextResponse.json({ feedback: JSON.parse(json) });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
