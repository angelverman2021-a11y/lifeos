"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, ChevronRight, ChevronLeft, User, Briefcase, GraduationCap, Code, FolderOpen } from "lucide-react";

interface ResumeData {
  name: string; role: string; email: string; phone: string; linkedin: string;
  summary: string; experience: string; education: string; skills: string; projects: string;
}

interface GeneratedResume {
  summary: string;
  experience: { title: string; company: string; duration: string; bullets: string[] }[];
  education: { degree: string; institution: string; year: string; gpa?: string }[];
  skills: { technical: string[]; soft: string[] };
  projects: { name: string; description: string; tech: string[] }[];
}

const STEPS = [
  { id: "personal", label: "Personal Info", icon: User, emoji: "👤" },
  { id: "experience", label: "Experience", icon: Briefcase, emoji: "💼" },
  { id: "education", label: "Education", icon: GraduationCap, emoji: "🎓" },
  { id: "skills", label: "Skills", icon: Code, emoji: "⚡" },
  { id: "projects", label: "Projects", icon: FolderOpen, emoji: "🚀" },
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>({ name: "", role: "", email: "", phone: "", linkedin: "", summary: "", experience: "", education: "", skills: "", projects: "" });
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [loading, setLoading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  function update(field: keyof ResumeData, value: string) {
    setData((d) => ({ ...d, [field]: value }));
  }

  async function generate() {
    setLoading(true); setGenerated(null);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate", resumeData: data }),
      });
      const result = await res.json();
      if (result.error) { alert(result.error); setLoading(false); return; }
      setGenerated(result.resume);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  function downloadResume() {
    if (!generated) return;
    const content = buildResumeText(data, generated);
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${data.name.replace(/\s+/g, "_")}_Resume.txt`;
    a.click();
  }

  function downloadHTML() {
    if (!generated) return;
    const html = buildResumeHTML(data, generated);
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${data.name.replace(/\s+/g, "_")}_Resume.html`;
    a.click();
  }

  if (generated) return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setGenerated(null)}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all">
          <ChevronLeft size={14} /> Edit
        </button>
        <button onClick={downloadResume}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all">
          <Download size={14} /> .TXT
        </button>
        <button onClick={downloadHTML}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all ml-auto">
          <Download size={14} /> Download HTML
        </button>
      </div>

      {/* Resume Preview */}
      <div ref={resumeRef} className="bg-white rounded-2xl p-6 text-gray-900 text-sm space-y-4">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-purple-700 font-semibold text-base">{data.role}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-gray-600 text-xs">
            {data.email && <span>📧 {data.email}</span>}
            {data.phone && <span>📱 {data.phone}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{generated.summary}</p>
        </div>

        {/* Experience */}
        {generated.experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Experience</h2>
            {generated.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-purple-700 text-xs">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{exp.duration}</span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {exp.bullets.map((b, j) => <li key={j} className="text-gray-700 text-xs flex gap-1.5"><span>•</span>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {generated.education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Education</h2>
            {generated.education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-600 text-xs">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                </div>
                <span className="text-gray-500 text-xs">{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Skills</h2>
          <div className="space-y-1">
            <p className="text-xs"><span className="font-semibold text-gray-800">Technical: </span><span className="text-gray-700">{generated.skills.technical.join(", ")}</span></p>
            <p className="text-xs"><span className="font-semibold text-gray-800">Soft Skills: </span><span className="text-gray-700">{generated.skills.soft.join(", ")}</span></p>
          </div>
        </div>

        {/* Projects */}
        {generated.projects.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Projects</h2>
            {generated.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold text-gray-900">{p.name} <span className="text-gray-500 font-normal text-xs">· {p.tech.join(", ")}</span></p>
                <p className="text-gray-700 text-xs">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            className={`flex-1 py-2 rounded-xl text-xs transition-all flex flex-col items-center gap-1 ${
              step === i ? "bg-purple-600 text-white" : i < step ? "bg-purple-600/20 text-purple-300" : "bg-white/5 text-white/30"
            }`}>
            <span>{s.emoji}</span>
            <span className="hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">

          <h3 className="text-white font-semibold flex items-center gap-2">
            {STEPS[step].emoji} {STEPS[step].label}
          </h3>

          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Full Name *"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 col-span-2" />
                <input value={data.role} onChange={(e) => update("role", e.target.value)} placeholder="Target Role *"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 col-span-2" />
                <input value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="Email *"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
                <input value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
                <input value={data.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="LinkedIn URL"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 col-span-2" />
              </div>
              <textarea value={data.summary} onChange={(e) => update("summary", e.target.value)}
                placeholder="Brief summary (optional — AI will generate if empty)"
                rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
            </>
          )}

          {step === 1 && (
            <textarea value={data.experience} onChange={(e) => update("experience", e.target.value)}
              placeholder={`Describe your work experience:\n\nSoftware Engineer at Google (2022-2024)\n- Built React dashboard used by 10k users\n- Reduced load time by 40%\n\nIntern at Startup (2021)\n- Developed REST APIs`}
              rows={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
          )}

          {step === 2 && (
            <textarea value={data.education} onChange={(e) => update("education", e.target.value)}
              placeholder={`Your education:\n\nB.Tech Computer Science\nIIT Delhi, 2022\nGPA: 8.5/10\n\n12th Grade - 95%\nDPS School, 2018`}
              rows={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
          )}

          {step === 3 && (
            <textarea value={data.skills} onChange={(e) => update("skills", e.target.value)}
              placeholder={`Your skills (AI will organize them):\n\nReact, Next.js, TypeScript, Node.js, Python\nSQL, MongoDB, AWS, Docker\nTeam leadership, Communication, Problem solving`}
              rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
          )}

          {step === 4 && (
            <textarea value={data.projects} onChange={(e) => update("projects", e.target.value)}
              placeholder={`Your projects:\n\nLife OS - AI productivity app\nBuilt with Next.js, Tailwind, Groq AI\nPersonal creative workspace with canvas system\n\nE-commerce Platform\nReact + Node.js + MongoDB\nFull stack shopping app with payment integration`}
              rows={7} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm transition-all">
            <ChevronLeft size={14} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={generate} disabled={loading || !data.name || !data.role || !data.email}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            {loading ? "AI is building your resume..." : "Generate Resume ✨"}
          </button>
        )}
      </div>
    </div>
  );
}

function buildResumeText(data: ResumeData, r: GeneratedResume): string {
  return `${data.name.toUpperCase()}
${data.role}
${[data.email, data.phone, data.linkedin].filter(Boolean).join(" | ")}

PROFESSIONAL SUMMARY
${r.summary}

EXPERIENCE
${r.experience.map(e => `${e.title} | ${e.company} | ${e.duration}\n${e.bullets.map(b => `• ${b}`).join("\n")}`).join("\n\n")}

EDUCATION
${r.education.map(e => `${e.degree} | ${e.institution} | ${e.year}${e.gpa ? ` | GPA: ${e.gpa}` : ""}`).join("\n")}

SKILLS
Technical: ${r.skills.technical.join(", ")}
Soft Skills: ${r.skills.soft.join(", ")}

PROJECTS
${r.projects.map(p => `${p.name} (${p.tech.join(", ")})\n${p.description}`).join("\n\n")}`;
}

function buildResumeHTML(data: ResumeData, r: GeneratedResume): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${data.name} - Resume</title>
<style>
  body { font-family: 'Arial', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 28px; margin: 0; color: #1a1a1a; }
  .role { color: #7c3aed; font-size: 16px; font-weight: 600; margin: 4px 0; }
  .contact { color: #666; font-size: 13px; margin: 6px 0 16px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; margin: 20px 0 10px; }
  .exp-header { display: flex; justify-content: space-between; }
  .exp-title { font-weight: 700; }
  .exp-company { color: #7c3aed; font-size: 13px; }
  .exp-date { color: #888; font-size: 12px; }
  ul { margin: 4px 0; padding-left: 16px; }
  li { font-size: 13px; margin: 2px 0; }
  .skill-label { font-weight: 700; }
  .project-name { font-weight: 700; }
  .project-tech { color: #888; font-size: 12px; }
  p { font-size: 13px; margin: 4px 0; }
</style></head><body>
<h1>${data.name}</h1>
<div class="role">${data.role}</div>
<div class="contact">${[data.email, data.phone, data.linkedin].filter(Boolean).join(" &nbsp;|&nbsp; ")}</div>
<h2>Professional Summary</h2><p>${r.summary}</p>
<h2>Experience</h2>
${r.experience.map(e => `<div class="exp-header"><div><div class="exp-title">${e.title}</div><div class="exp-company">${e.company}</div></div><div class="exp-date">${e.duration}</div></div><ul>${e.bullets.map(b => `<li>${b}</li>`).join("")}</ul>`).join("")}
<h2>Education</h2>
${r.education.map(e => `<div class="exp-header"><div><div class="exp-title">${e.degree}</div><p>${e.institution}${e.gpa ? ` · GPA: ${e.gpa}` : ""}</p></div><div class="exp-date">${e.year}</div></div>`).join("")}
<h2>Skills</h2>
<p><span class="skill-label">Technical:</span> ${r.skills.technical.join(", ")}</p>
<p><span class="skill-label">Soft Skills:</span> ${r.skills.soft.join(", ")}</p>
<h2>Projects</h2>
${r.projects.map(p => `<div><span class="project-name">${p.name}</span> <span class="project-tech">· ${p.tech.join(", ")}</span><p>${p.description}</p></div>`).join("")}
</body></html>`;
}
