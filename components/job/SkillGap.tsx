"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target } from "lucide-react";

interface Analysis {
  missingSkills: { skill: string; priority: string; timeToLearn: string; resources: string[] }[];
  existingStrengths: string[];
  roadmap: string[];
  estimatedTime: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function SkillGap() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!currentRole.trim() || !targetRole.trim()) return;
    setLoading(true); setAnalysis(null);
    try {
      const res = await fetch("/api/ai/skillgap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, targetRole, currentSkills }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); setLoading(false); return; }
      setAnalysis(data.analysis);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Target size={18} className="text-green-400" /> Skill Gap Analyzer
        </h2>
        <p className="text-white/40 text-sm mb-4">Tell AI where you are and where you want to go — get a personalized roadmap.</p>

        <div className="space-y-3">
          <input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="Current role (e.g. Junior Developer, Student, Marketing Executive...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors" />
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role (e.g. Senior Full Stack Developer, Data Scientist...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors" />
          <textarea value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)}
            placeholder="Your current skills (optional — e.g. React, Python, Excel...)"
            rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 resize-none text-sm" />
          <button onClick={analyze} disabled={loading || !currentRole.trim() || !targetRole.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            {loading ? "Analyzing your gap..." : "Analyze Skill Gap"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-white/40 gap-3">
          <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          Building your personalized roadmap...
        </div>
      )}

      <AnimatePresence>
        {analysis && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Time estimate */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <p className="text-white font-bold">{currentRole} → {targetRole}</p>
                <p className="text-white/50 text-sm">Estimated time: <span className="text-purple-300 font-medium">{analysis.estimatedTime}</span></p>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-green-400 font-medium text-sm mb-3">✅ Your Existing Strengths</p>
              <div className="flex flex-wrap gap-2">
                {analysis.existingStrengths.map((s, i) => (
                  <span key={i} className="bg-green-500/10 border border-green-500/20 text-green-300 text-xs px-3 py-1.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-red-400 font-medium text-sm mb-3">📚 Skills to Learn</p>
              <div className="space-y-3">
                {analysis.missingSkills.map((skill, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${PRIORITY_COLORS[skill.priority] || PRIORITY_COLORS.medium}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">{skill.timeToLearn}</span>
                        <span className="text-xs capitalize opacity-70 border rounded-full px-2 py-0.5">{skill.priority}</span>
                      </div>
                    </div>
                    {skill.resources.length > 0 && (
                      <p className="text-xs opacity-60">📖 {skill.resources.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-purple-400 font-medium text-sm mb-3">🗺️ Your Roadmap</p>
              <div className="space-y-2">
                {analysis.roadmap.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-white/70 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
