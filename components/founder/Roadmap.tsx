"use client";
import { useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface Phase {
  month: string;
  title: string;
  tasks: string[];
  milestone: string;
}

export default function Roadmap() {
  const [idea, setIdea] = useState("");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const { roadmapGenerated } = usePlanetEnergy();

  async function generate() {
    if (!idea.trim()) return;
    setLoading(true);
    setPhases([]);
    setDone({});
    try {
      const res = await fetch("/api/ai/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, mode: "roadmap" }),
      });
      const data = await res.json();
      if (data.phases) setPhases(data.phases);
      roadmapGenerated();
    } catch { /* ignore */ }
    setLoading(false);
  }

  function toggleTask(key: string) {
    setDone((d) => ({ ...d, [key]: !d[key] }));
  }

  const PHASE_COLORS = ["from-purple-600 to-blue-600", "from-blue-600 to-cyan-600", "from-cyan-600 to-green-600"];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea..."
          rows={2}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
        <button onClick={generate} disabled={loading || !idea.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "🗺️"}
          {loading ? "Building roadmap..." : "Generate Roadmap"}
        </button>
      </div>

      {phases.length > 0 && (
        <div className="space-y-4">
          {phases.map((phase, pi) => {
            const completedTasks = phase.tasks.filter((_, ti) => done[`${pi}-${ti}`]).length;
            const progress = Math.round((completedTasks / phase.tasks.length) * 100);
            return (
              <div key={pi} className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
                {/* Phase header */}
                <div className={`bg-gradient-to-r ${PHASE_COLORS[pi % PHASE_COLORS.length]} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs">{phase.month}</p>
                      <p className="text-white font-bold">{phase.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-xs">{progress}%</p>
                      <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-4 space-y-2">
                  {phase.tasks.map((task, ti) => {
                    const key = `${pi}-${ti}`;
                    return (
                      <button key={ti} onClick={() => toggleTask(key)}
                        className="w-full flex items-start gap-3 text-left group">
                        {done[key]
                          ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                          : <Circle size={16} className="text-white/20 group-hover:text-white/40 flex-shrink-0 mt-0.5 transition-colors" />}
                        <span className={`text-sm transition-all ${done[key] ? "text-white/30 line-through" : "text-white/70"}`}>
                          {task}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Milestone */}
                <div className="px-4 pb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/30 text-xs mb-1">🏁 Milestone</p>
                    <p className="text-white/60 text-sm">{phase.milestone}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
