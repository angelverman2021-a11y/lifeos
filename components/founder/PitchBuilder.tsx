"use client";
import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface Pitch {
  tagline: string;
  problem: string;
  solution: string;
  market: string;
  businessModel: string;
  traction: string;
  ask: string;
}

const SECTIONS = [
  { key: "tagline", label: "Tagline", emoji: "⚡", color: "purple" },
  { key: "problem", label: "Problem", emoji: "🔥", color: "red" },
  { key: "solution", label: "Solution", emoji: "💡", color: "yellow" },
  { key: "market", label: "Market", emoji: "📈", color: "blue" },
  { key: "businessModel", label: "Business Model", emoji: "💰", color: "green" },
  { key: "traction", label: "Traction", emoji: "🚀", color: "orange" },
  { key: "ask", label: "The Ask", emoji: "🤝", color: "pink" },
] as const;

export default function PitchBuilder() {
  const [idea, setIdea] = useState("");
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { pitchBuilt } = usePlanetEnergy();

  async function generate() {
    if (!idea.trim()) return;
    setLoading(true);
    setPitch(null);
    try {
      const res = await fetch("/api/ai/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, mode: "pitch" }),
      });
      const data = await res.json();
      setPitch(data);
      pitchBuilt();
    } catch { /* ignore */ }
    setLoading(false);
  }

  function copyAll() {
    if (!pitch) return;
    const text = SECTIONS.map((s) => `${s.emoji} ${s.label}\n${pitch[s.key]}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea..."
          rows={3}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
        <button onClick={generate} disabled={loading || !idea.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-40 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "🎯"}
          {loading ? "Building pitch..." : "Build Pitch Deck"}
        </button>
      </div>

      {pitch && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">Your Pitch Deck</p>
            <button onClick={copyAll}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.key} className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-2">{s.emoji} {s.label}</p>
              <p className="text-white/80 text-sm leading-relaxed">{pitch[s.key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
