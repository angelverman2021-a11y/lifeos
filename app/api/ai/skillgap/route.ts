import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { currentRole, targetRole, currentSkills } = await req.json();

  const prompt = `Analyze the skill gap between current role "${currentRole}" and target role "${targetRole}".
Current skills: ${currentSkills || "not specified"}.

Return ONLY valid JSON, no extra text:
{
  "missingSkills": [
    { "skill": "skill name", "priority": "high/medium/low", "timeToLearn": "e.g. 2 weeks", "resources": ["resource 1", "resource 2"] }
  ],
  "existingStrengths": ["strength 1", "strength 2", "strength 3"],
  "roadmap": ["step 1", "step 2", "step 3", "step 4"],
  "estimatedTime": "e.g. 3 months"
}`;

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return NextResponse.json({ error: "Invalid format" }, { status: 500 });
    return NextResponse.json({ analysis: JSON.parse(json) });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
