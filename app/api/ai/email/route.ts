import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { type, yourName, yourRole, targetName, targetCompany, purpose, tone } = await req.json();

  const tones: Record<string, string> = {
    professional: "professional and formal",
    friendly: "friendly and conversational",
    bold: "confident and bold",
  };

  const prompt = `Write a ${type === "email" ? "cold email" : "LinkedIn/DM message"} for networking.

Sender: ${yourName}, ${yourRole}
Target: ${targetName || "Hiring Manager"} at ${targetCompany || "the company"}
Purpose: ${purpose}
Tone: ${tones[tone] || "professional"}

Write a compelling, personalized message that:
- Is concise (${type === "email" ? "under 150 words" : "under 100 words"})
- Has a clear ask or CTA
- Doesn't sound generic or spammy
- Feels human and genuine

Just write the message, no extra explanation.`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    return NextResponse.json({ message: text });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
