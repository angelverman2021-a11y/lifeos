"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Plus, Sparkles, Trash2, ChevronDown } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  period: string;
  description: string;
  emoji: string;
  color: string;
  memories: string[];
  createdAt: string;
}

const CHAPTER_COLORS = [
  "from-purple-600 to-pink-600",
  "from-blue-600 to-cyan-600",
  "from-green-600 to-emerald-600",
  "from-orange-500 to-yellow-500",
  "from-red-600 to-pink-600",
  "from-indigo-600 to-purple-600",
];

const CHAPTER_EMOJIS = ["🌱", "🔥", "⭐", "🌊", "🎯", "💫", "🏆", "🌸", "🚀", "💎"];
const STORAGE_KEY = "life-os-chapters";

function getChapters(): Chapter[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export default function LifeTimeline() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", period: "", description: "", emoji: "🌱", color: CHAPTER_COLORS[0], memories: "" });

  useEffect(() => { setChapters(getChapters()); }, []);

  function save(updated: Chapter[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setChapters(updated);
  }

  function addChapter() {
    if (!form.title.trim()) return;
    const chapter: Chapter = {
      id: uuidv4(), title: form.title, period: form.period,
      description: form.description, emoji: form.emoji, color: form.color,
      memories: form.memories.split("\n").filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    save([...chapters, chapter]);
    setForm({ title: "", period: "", description: "", emoji: "🌱", color: CHAPTER_COLORS[0], memories: "" });
    setShowAdd(false);
  }

  function deleteChapter(id: string) {
    save(chapters.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold">🗓️ Life Chapters</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
          + Add Chapter
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-medium text-sm">New Life Chapter</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Chapter title *" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
                <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                  placeholder="Period (e.g. 2020-2022)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this chapter of your life..." rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
              <textarea value={form.memories} onChange={(e) => setForm({ ...form, memories: e.target.value })}
                placeholder="Key memories (one per line)..." rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />

              {/* Emoji picker */}
              <div>
                <p className="text-white/30 text-xs mb-2">Chapter Emoji</p>
                <div className="flex gap-2 flex-wrap">
                  {CHAPTER_EMOJIS.map((e) => (
                    <button key={e} onClick={() => setForm({ ...form, emoji: e })}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === e ? "bg-purple-600 scale-110" : "bg-white/5 hover:bg-white/10"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-white/30 text-xs mb-2">Chapter Color</p>
                <div className="flex gap-2">
                  {CHAPTER_COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} border-2 transition-all ${form.color === c ? "border-white scale-110" : "border-transparent"}`} />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 py-2.5 rounded-xl text-sm transition-all">Cancel</button>
                <button onClick={addChapter} disabled={!form.title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40">
                  Add Chapter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {chapters.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-white/40">No chapters yet</p>
          <p className="text-white/20 text-sm mt-1">Document the chapters of your life journey</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

          <div className="space-y-4">
            {chapters.map((chapter, i) => (
              <motion.div key={chapter.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="relative pl-14">
                {/* Timeline dot */}
                <div className={`absolute left-3.5 top-4 w-5 h-5 rounded-full bg-gradient-to-br ${chapter.color} flex items-center justify-center text-xs shadow-lg`}>
                  {chapter.emoji}
                </div>

                <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all">
                  <button className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setExpanded(expanded === chapter.id ? null : chapter.id)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{chapter.title}</p>
                        {chapter.period && <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">{chapter.period}</span>}
                      </div>
                      {chapter.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{chapter.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/20 text-xs">{chapter.memories.length} memories</span>
                      <ChevronDown size={14} className={`text-white/30 transition-transform ${expanded === chapter.id ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded === chapter.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5">
                        <div className="p-4 space-y-3">
                          {chapter.description && (
                            <p className="text-white/60 text-sm">{chapter.description}</p>
                          )}
                          {chapter.memories.length > 0 && (
                            <div>
                              <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Key Memories</p>
                              {chapter.memories.map((m, j) => (
                                <div key={j} className="flex items-start gap-2 mb-1.5">
                                  <span className="text-purple-400 text-xs mt-1">✦</span>
                                  <p className="text-white/60 text-sm">{m}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <button onClick={() => deleteChapter(chapter.id)}
                            className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-xs transition-colors">
                            <Trash2 size={12} /> Delete Chapter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
