"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, RotateCcw, ChevronLeft, ChevronRight, Lock } from "lucide-react";

interface Flashcard { front: string; back: string; }

const LEVELS = [
  { id: 1, label: "Level 1", sublabel: "Basic", emoji: "🌱", color: "from-green-600 to-emerald-600", border: "border-green-500/30", bg: "bg-green-500/10", desc: "Key terms & definitions" },
  { id: 2, label: "Level 2", sublabel: "Intermediate", emoji: "🔥", color: "from-orange-500 to-yellow-500", border: "border-orange-500/30", bg: "bg-orange-500/10", desc: "How things work & apply" },
  { id: 3, label: "Level 3", sublabel: "Advanced", emoji: "⚡", color: "from-purple-600 to-pink-600", border: "border-purple-500/30", bg: "bg-purple-500/10", desc: "Deep understanding & edge cases" },
];

export default function Flashcards() {
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [activeLevel, setActiveLevel] = useState(1);

  const currentLevel = LEVELS.find((l) => l.id === activeLevel)!;

  async function generate(lvl: number) {
    if (!notes.trim()) return;
    setLoading(true);
    setCards([]); setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]);
    setActiveLevel(lvl);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, level: lvl, type: "flashcard" }),
      });
      const data = await res.json();
      if (data.error) { alert("AI Error: " + data.error); }
      else setCards(data.items);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  function next() {
    setFlipped(false);
    setTimeout(() => {
      if (current + 1 >= cards.length) {
        setCompletedLevels((prev) => [...new Set([...prev, activeLevel])]);
      } else {
        setCurrent((c) => Math.min(c + 1, cards.length - 1));
      }
    }, 150);
  }

  function prev() { setFlipped(false); setTimeout(() => setCurrent((c) => Math.max(c - 1, 0)), 150); }

  function markKnown() { setKnown((k) => [...new Set([...k, current])]); next(); }
  function markUnknown() { setUnknown((u) => [...new Set([...u, current])]); next(); }

  const isComplete = current >= cards.length - 1 && cards.length > 0;

  return (
    <div className="space-y-6">
      {/* Input section */}
      {cards.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Layers size={18} className="text-blue-400" /> Flashcard Generator
          </h2>
          <p className="text-white/40 text-sm mb-5">Paste your notes, pick a level, and start learning.</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your notes here..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-sm mb-5"
          />

          {/* Level selector */}
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Choose Difficulty</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {LEVELS.map((l) => {
              const isCompleted = completedLevels.includes(l.id);
              const isLocked = l.id > 1 && !completedLevels.includes(l.id - 1) && notes.trim() === "";
              return (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                    level === l.id ? `${l.bg} ${l.border} scale-[1.02]` : "bg-white/5 border-white/10"
                  }`}>
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="text-2xl mb-2">{l.emoji}</div>
                  <p className="text-white font-semibold text-sm">{l.label}</p>
                  <p className="text-white/40 text-xs">{l.sublabel}</p>
                  <p className="text-white/30 text-xs mt-1">{l.desc}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => generate(level)}
            disabled={loading || !notes.trim()}
            className={`w-full bg-gradient-to-r ${currentLevel.color} text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2`}
          >
            <Layers size={16} />
            {loading ? "Generating cards..." : `Generate ${currentLevel.label} Cards ${currentLevel.emoji}`}
          </button>
        </div>
      )}

      {/* Cards view */}
      {cards.length > 0 && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${currentLevel.color} text-white`}>
                {currentLevel.emoji} {currentLevel.label}
              </div>
              <span className="text-white/40 text-sm">{Math.min(current + 1, cards.length)} / {cards.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm">✓ {known.length}</span>
              <span className="text-red-400 text-sm">✗ {unknown.length}</span>
              <button onClick={() => { setCards([]); setNotes(""); }}
                className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
            {cards.map((_, i) => (
              <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${
                known.includes(i) ? "bg-green-500" :
                unknown.includes(i) ? "bg-red-500/50" :
                i === current ? `bg-gradient-to-r ${currentLevel.color}` : "bg-white/10"
              }`} />
            ))}
          </div>

          {/* Completion screen */}
          {isComplete && known.length + unknown.length >= cards.length ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">
                {known.length >= cards.length * 0.8 ? "🏆" : known.length >= cards.length * 0.5 ? "👍" : "📚"}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{currentLevel.label} Complete!</h3>
              <p className="text-white/50 text-sm mb-6">
                You knew <span className="text-green-400 font-bold">{known.length}</span> out of {cards.length} cards
              </p>

              {/* Level progression */}
              <div className="flex gap-3 justify-center mb-6">
                {LEVELS.map((l) => (
                  <div key={l.id} className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                    completedLevels.includes(l.id) ? `${l.bg} ${l.border}` : "bg-white/5 border-white/10 opacity-50"
                  }`}>
                    <span className="text-xl">{l.emoji}</span>
                    <span className="text-white text-xs font-medium">{l.label}</span>
                    {completedLevels.includes(l.id) && <span className="text-green-400 text-xs">✓ Done</span>}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => generate(activeLevel)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all">
                  <RotateCcw size={14} /> Retry Level
                </button>
                {activeLevel < 3 && (
                  <button onClick={() => generate(activeLevel + 1)}
                    className={`bg-gradient-to-r ${LEVELS[activeLevel].color} text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2`}>
                    Next: {LEVELS[activeLevel].label} {LEVELS[activeLevel].emoji}
                  </button>
                )}
                <button onClick={() => { setCards([]); setNotes(""); }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all">
                  New Topic
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Flip card */}
              <div style={{ perspective: "1000px" }} onClick={() => setFlipped(!flipped)}>
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.45, type: "spring", stiffness: 100 }}
                  className="relative w-full h-60 cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border ${currentLevel.border} rounded-2xl flex flex-col items-center justify-center p-8`}
                    style={{ backfaceVisibility: "hidden" }}>
                    <span className={`text-xs uppercase tracking-widest mb-4 font-medium bg-gradient-to-r ${currentLevel.color} bg-clip-text text-transparent`}>
                      {currentLevel.emoji} {currentLevel.label} — Question
                    </span>
                    <p className="text-white text-center text-lg font-medium leading-relaxed">{cards[current]?.front}</p>
                    <p className="text-white/20 text-xs mt-6 flex items-center gap-1">
                      <span>👆</span> Click to flip
                    </p>
                  </div>
                  {/* Back */}
                  <div className={`absolute inset-0 ${currentLevel.bg} border ${currentLevel.border} rounded-2xl flex flex-col items-center justify-center p-8`}
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                    <span className="text-xs uppercase tracking-widest mb-4 text-white/40 font-medium">Answer</span>
                    <p className="text-white text-center text-lg leading-relaxed">{cards[current]?.back}</p>
                  </div>
                </motion.div>
              </div>

              {/* Controls */}
              {flipped ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3">
                  <button onClick={markUnknown}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
                    ✗ Still Learning
                  </button>
                  <button onClick={markKnown}
                    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
                    ✓ Got It!
                  </button>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between">
                  <button onClick={prev} disabled={current === 0}
                    className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-2.5 flex items-center gap-1 text-sm disabled:opacity-30 transition-all border border-white/10">
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <p className="text-white/20 text-xs">Flip to rate</p>
                  <button onClick={next} disabled={current === cards.length - 1}
                    className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-2.5 flex items-center gap-1 text-sm disabled:opacity-30 transition-all border border-white/10">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
