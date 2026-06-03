"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

export default function BrainDump() {
  const [dump, setDump] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function organize() {
    if (!dump.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/braindump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dump }),
      });
      const data = await res.json();
      if (data.error) setResult(`❌ Error: ${data.error}`);
      else setResult(data.text);
    } catch {
      setResult("❌ Failed to connect to AI.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Brain Dump → Organize
        </h2>
        <p className="text-white/40 text-sm mb-4">Type everything in your head — chaotic, messy, random. AI will organize it.</p>

        <textarea
          value={dump}
          onChange={(e) => setDump(e.target.value)}
          placeholder="just dump everything here... like i need to study react hooks also need to remember useEffect runs after render and useState is for local state also i have exam tomorrow and need to cover context api and also redux maybe and dont forget about custom hooks they are just functions..."
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none text-sm"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-white/20 text-xs">{dump.length} characters</span>
          <button
            onClick={organize}
            disabled={loading || !dump.trim()}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 text-sm"
          >
            <Zap size={14} />
            {loading ? "Organizing..." : "Organize It"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(loading || result) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            {loading ? (
              <div className="flex items-center gap-3 text-white/50">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                Organizing your thoughts...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">✨ Organized Notes</h3>
                  <button
                    onClick={() => { setDump(""); setResult(""); }}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-sm leading-relaxed">
                  {result.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h2 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace("## ", "")}</h2>;
                    if (line.startsWith("### ")) return <h3 key={i} className="text-yellow-300 font-semibold mt-3 mb-1">{line.replace("### ", "")}</h3>;
                    if (line.startsWith("- ")) return <li key={i} className="ml-4 text-white/70 list-disc">{line.replace("- ", "")}</li>;
                    if (line.trim() === "") return <br key={i} />;
                    return <p key={i} className="text-white/70">{line}</p>;
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
