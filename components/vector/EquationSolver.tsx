"use client";
import { useState } from "react";
import { Loader2, Sparkles, ChevronRight } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

type Mode = "solve" | "simplify" | "vector";

interface Result {
  steps: string[];
  answer: string;
  explanation: string;
}

const EXAMPLES = {
  solve: ["2x + 5 = 13", "x² - 4x + 4 = 0", "3x/2 - 7 = 11"],
  simplify: ["(x+2)(x-3)", "2x² + 4x / 2x", "sin²θ + cos²θ"],
  vector: ["magnitude of (3, 4)", "dot product (1,2,3) · (4,5,6)", "cross product (1,0,0) × (0,1,0)"],
};

export default function EquationSolver() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("solve");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const { equationSolved } = usePlanetEnergy();

  async function solve() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation: input, mode }),
      });
      const data = await res.json();
      setResult(data);
      equationSolved();
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {(["solve", "simplify", "vector"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              mode === m ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}>
            {m === "vector" ? "⃗ Vector" : m === "solve" ? "= Solve" : "∑ Simplify"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && solve()}
          placeholder={`e.g. ${EXAMPLES[mode][0]}`}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 font-mono focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES[mode].map((ex) => (
          <button key={ex} onClick={() => setInput(ex)}
            className="text-xs bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-all">
            {ex}
          </button>
        ))}
      </div>

      <button onClick={solve} disabled={loading || !input.trim()}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? "Solving..." : "Solve with AI"}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Answer */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <p className="text-green-400 text-xs mb-1">Answer</p>
            <p className="text-white font-mono text-lg">{result.answer}</p>
          </div>

          {/* Steps */}
          {result.steps?.length > 0 && (
            <div className="bg-black/20 rounded-2xl p-4 space-y-2">
              <p className="text-white/50 text-xs mb-3">Step-by-step</p>
              {result.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-white/70 text-sm font-mono leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-blue-400 text-xs mb-1 flex items-center gap-1"><ChevronRight size={12} /> Explanation</p>
              <p className="text-white/70 text-sm">{result.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
