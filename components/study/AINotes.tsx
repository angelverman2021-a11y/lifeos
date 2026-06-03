"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Save } from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { NotePage, Widget } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

const MODES = [
  { id: "normal", label: "Structured", icon: "📋" },
  { id: "eli5", label: "ELI5", icon: "🧒" },
  { id: "summary", label: "Summary", icon: "⚡" },
];

// Convert plain text/markdown to simple HTML for tiptap
function markdownToHtml(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) return `<h2>${line.replace("## ", "")}</h2>`;
      if (line.startsWith("### ")) return `<h3>${line.replace("### ", "")}</h3>`;
      if (line.startsWith("- ")) return `<li>${line.replace("- ", "")}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p>${line}</p>`;
    })
    .join("");
}

export default function AINotes() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("normal");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const { widgets, addWidget, updateWidget } = useCanvasStore();
  const { noteCreated } = usePlanetEnergy();

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode }),
      });
      const data = await res.json();
      if (data.error) setResult(`❌ Error: ${data.error}`);
      else setResult(data.text);
    } catch {
      setResult("❌ Failed to connect to AI.");
    }
    setLoading(false);
  }

  function saveToCanvas() {
    if (!result) return;
    const html = markdownToHtml(result);
    const newPage: NotePage = {
      id: uuidv4(),
      title: topic,
      content: html,
      createdAt: new Date().toISOString(),
    };

    // Find existing notes widget to add page to, or create new one
    const existingNotes = widgets.find((w) => w.type === "notes");
    if (existingNotes) {
      const pages = existingNotes.pages || [];
      updateWidget(existingNotes.id, {
        pages: [...pages, newPage],
        activePageId: newPage.id,
      });
    } else {
      const newWidget: Widget = {
        id: uuidv4(),
        type: "notes",
        x: 100,
        y: 100,
        width: 340,
        height: 280,
        title: "My Notes",
        pages: [newPage],
        activePageId: newPage.id,
      };
      addWidget(newWidget);
    }

    setSavedMsg("Saved to canvas! ✨");
    noteCreated();
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" /> AI Notes Generator
        </h2>

        <div className="flex gap-2 mb-4">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                mode === m.id ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Enter any topic (e.g. Photosynthesis, React Hooks...)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button onClick={generate} disabled={loading || !topic.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-2">
            <Sparkles size={16} />
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(loading || result) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {loading ? (
              <div className="flex items-center gap-3 text-white/50">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                AI is thinking...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{topic}</h3>
                  <button onClick={saveToCanvas}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      savedMsg ? "bg-green-500/20 text-green-300" : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-300"
                    }`}>
                    <Save size={12} />
                    {savedMsg || "Save to Canvas"}
                  </button>
                </div>
                <div className="text-white/70 text-sm leading-relaxed">
                  {result.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h2 key={i} className="text-white font-bold text-lg mt-4 mb-2">{line.replace("## ", "")}</h2>;
                    if (line.startsWith("### ")) return <h3 key={i} className="text-purple-300 font-semibold mt-3 mb-1">{line.replace("### ", "")}</h3>;
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
