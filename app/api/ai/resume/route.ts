import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { type, resumeData } = await req.json();

  if (type === "generate") {
    const { name, role, email, phone, linkedin, summary, experience, education, skills, projects } = resumeData;

    const prompt = `Generate a professional, ATS-friendly resume for:
Name: ${name}
Target Role: ${role}
Email: ${email}
Phone: ${phone || ""}
LinkedIn: ${linkedin || ""}
Summary: ${summary || "generate a compelling summary"}
Experience: ${experience || "not provided"}
Education: ${education || "not provided"}
Skills: ${skills || "not provided"}
Projects: ${projects || "not provided"}

Return ONLY valid JSON:
{
  "summary": "3-4 sentence professional summary",
  "experience": [{"title": "Job Title", "company": "Company", "duration": "2022-2024", "bullets": ["achievement 1", "achievement 2", "achievement 3"]}],
  "education": [{"degree": "Degree", "institution": "University", "year": "2022", "gpa": "optional"}],
  "skills": {"technical": ["skill1", "skill2"], "soft": ["skill1", "skill2"]},
  "projects": [{"name": "Project", "description": "what it does", "tech": ["React", "Node"]}]
}`;

    try {
      const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt });
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      if (!json) return NextResponse.json({ error: "Invalid format" }, { status: 500 });
      return NextResponse.json({ resume: JSON.parse(json) });
    } catch (err: unknown) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
    }
  }

  // Section improvement (old functionality)
  const body = await req.json();
  const { section, content, role } = body as { section: string; content: string; role: string };
  const prompts: Record<string, string> = {
    summary: `Write a compelling professional summary for a resume. Role: "${role}". Current draft: "${content}". Make it 3-4 sentences, achievement-focused, and ATS-friendly.`,
    experience: `Improve this work experience bullet point for a "${role}" resume: "${content}". Make it start with a strong action verb, include metrics if possible. Give 3 improved versions.`,
    skills: `Suggest the top 10 most relevant technical and soft skills for a "${role}" position. Return as a simple comma-separated list.`,
  };

  try {
    const { text } = await generateText({ model: groq("llama-3.3-70b-versatile"), prompt: prompts[section] || prompts.summary });
    return NextResponse.json({ suggestion: text });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
