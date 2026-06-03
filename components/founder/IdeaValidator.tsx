"use client";
import { useState } from "react";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface ValidationResult {
  verdict: string;
  score: number;
  marketSize: string;
  targetAudience: string;
  competitors: string[];
  uniqueAngle: string;
  risks: string[];
  greenFlags: string[];
  redFlags: string[];
  suggestion: string;
}

export default function IdeaValidator() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { ideaValidated } = usePlanetEnergy();

  async function validate() {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, mode: "validate" }),
      });
      const data = await res.json();
      setResult(data);
      ideaValidated();
    } catch { /* ignore */ }
    setLoading(false);
  }

  const verdictColor = result?.verdict === "Strong" ? "text-green-400" :
    result?.verdict === "Moderate" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea... e.g. An app that helps students find study partners using AI matching"
          rows={3}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
        <button onClick={validate} disabled={loading || !idea.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
          {loading ? "Analyzing market..." : "Validate Idea"}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Verdict */}
          <div className="bg-black/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs mb-1">Market Verdict</p>
              <p className={`text-2xl font-bold ${verdictColor}`}>{result.verdict}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-1">Score</p>
              <p className="text-4xl font-bold text-white">{result.score}<span className="text-white/30 text-lg">/10</span></p>
            </div>
          </div>

          {/* Market + Audience */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-blue-400 text-xs mb-1">Market Size</p>
              <p className="text-white/70 text-sm">{result.marketSize}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
              <p className="text-purple-400 text-xs mb-1">Target Audience</p>
              <p className="text-white/70 text-sm">{result.targetAudience}</p>
            </div>
          </div>

          {/* Unique angle */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <p className="text-green-400 text-xs mb-1">✨ Unique Angle</p>
            <p className="text-white/70 text-sm">{result.uniqueAngle}</p>
          </div>

          {/* Green / Red flags */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-xl p-3 space-y-1">
              <p className="text-green-400 text-xs mb-2 flex items-center gap-1"><CheckCircle size={10} /> Green Flags</p>
              {result.greenFlags?.map((f, i) => <p key={i} className="text-white/60 text-xs">• {f}</p>)}
            </div>
            <div className="bg-black/20 rounded-xl p-3 space-y-1">
              <p className="text-red-400 text-xs mb-2 flex items-center gap-1"><AlertTriangle size={10} /> Red Flags</p>
              {result.redFlags?.map((f, i) => <p key={i} className="text-white/60 text-xs">• {f}</p>)}
            </div>
          </div>

          {/* Competitors */}
          {result.competitors?.length > 0 && (
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs mb-2">Competitors</p>
              <div className="flex flex-wrap gap-2">
                {result.competitors.map((c, i) => (
                  <span key={i} className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-lg">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-yellow-400 text-xs mb-1">💡 Key Suggestion</p>
            <p className="text-white/70 text-sm">{result.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
