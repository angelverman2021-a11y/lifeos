"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";

interface Question { question: string; options: string[]; correct: number; }

const LEVELS = [
  { id: 1, label: "Level 1", sublabel: "Easy", emoji: "🌱", color: "from-green-600 to-emerald-600", border: "border-green-500/30", bg: "bg-green-500/10", textColor: "text-green-400", desc: "Basic recall & definitions" },
  { id: 2, label: "Level 2", sublabel: "Medium", emoji: "🔥", color: "from-orange-500 to-yellow-500", border: "border-orange-500/30", bg: "bg-orange-500/10", textColor: "text-orange-400", desc: "Understanding & application" },
  { id: 3, label: "Level 3", sublabel: "Hard", emoji: "⚡", color: "from-purple-600 to-pink-600", border: "border-purple-500/30", bg: "bg-purple-500/10", textColor: "text-purple-400", desc: "Analysis & advanced concepts" },
];

export default function QuizMode() {
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completedLevels, setCompletedLevels] = useState<{ [key: number]: number }>({});
  const [activeLevel, setActiveLevel] = useState(1);

  const currentLevel = LEVELS.find((l) => l.id === activeLevel)!;

  async function generate(lvl: number) {
    if (!notes.trim()) return;
    setLoading(true);
    setActiveLevel(lvl);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, level: lvl, type: "quiz" }),
      });
      const data = await res.json();
      if (data.error) { alert("AI Error: " + data.error); setLoading(false); return; }
      setQuestions(data.items);
      setCurrent(0); setSelected(null); setScore(0); setDone(false); setAnswers([]);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  function selectAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, idx]);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setCompletedLevels((prev) => ({ ...prev, [activeLevel]: score + (selected === questions[current].correct ? 1 : 0) }));
      setDone(true);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
  }

  function reset() { setQuestions([]); setDone(false); }

  // Results screen
  if (done) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="space-y-4">
        {/* Score card */}
        <div className={`${currentLevel.bg} border ${currentLevel.border} rounded-2xl p-8 text-center`}>
          <div className="text-6xl mb-3">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}</div>
          <h2 className="text-white text-2xl font-bold mb-1">{currentLevel.emoji} {currentLevel.label} Complete!</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-4xl font-bold ${currentLevel.textColor}`}>{finalScore}</span>
            <span className="text-white/30 text-2xl">/ {questions.length}</span>
          </div>
          <p className="text-white/40 text-sm">{pct}% correct</p>

          {/* Score bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mt-4 mb-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
              className={`h-full bg-gradient-to-r ${currentLevel.color} rounded-full`} />
          </div>
          <p className="text-white/30 text-xs">{pct >= 80 ? "Excellent! Ready for next level 🚀" : pct >= 60 ? "Good job! Try again to improve" : "Keep studying and retry 💪"}</p>
        </div>

        {/* Level progress */}
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((l) => {
            const lvlScore = completedLevels[l.id];
            const isDone = lvlScore !== undefined;
            const lvlPct = isDone ? Math.round((lvlScore / questions.length) * 100) : 0;
            return (
              <div key={l.id} className={`p-4 rounded-2xl border text-center transition-all ${isDone ? `${l.bg} ${l.border}` : "bg-white/5 border-white/10 opacity-40"}`}>
                <div className="text-2xl mb-1">{l.emoji}</div>
                <p className="text-white text-xs font-semibold">{l.label}</p>
                <p className="text-white/40 text-xs">{l.sublabel}</p>
                {isDone && <p className={`${l.textColor} text-sm font-bold mt-1`}>{lvlPct}%</p>}
              </div>
            );
          })}
        </div>

        {/* Answer review */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Review Answers</p>
          {questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${answers[i] === q.correct ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${answers[i] === q.correct ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {answers[i] === q.correct ? "✓" : "✗"}
              </span>
              <div>
                <p className="text-white/80">{q.question}</p>
                {answers[i] !== q.correct && (
                  <p className="text-green-400 text-xs mt-1">✓ {q.options[q.correct]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => generate(activeLevel)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10">
            <RotateCcw size={14} /> Retry Level
          </button>
          {activeLevel < 3 && (
            <button onClick={() => generate(activeLevel + 1)}
              className={`flex items-center gap-2 bg-gradient-to-r ${LEVELS[activeLevel].color} text-white px-4 py-2.5 rounded-xl text-sm font-medium`}>
              {LEVELS[activeLevel].emoji} Try {LEVELS[activeLevel].label}
            </button>
          )}
          <button onClick={reset}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10">
            New Topic
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      {questions.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" /> Quiz Mode
          </h2>
          <p className="text-white/40 text-sm mb-5">Paste your notes, pick a difficulty level, and test yourself.</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your notes here..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/50 resize-none text-sm mb-5"
          />

          {/* Level selector */}
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Choose Difficulty</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {LEVELS.map((l) => {
              const isDone = completedLevels[l.id] !== undefined;
              return (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                    level === l.id ? `${l.bg} ${l.border} scale-[1.02]` : "bg-white/5 border-white/10"
                  }`}>
                  {isDone && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="text-2xl mb-2">{l.emoji}</div>
                  <p className="text-white font-semibold text-sm">{l.label}</p>
                  <p className="text-white/40 text-xs">{l.sublabel}</p>
                  <p className="text-white/30 text-xs mt-1">{l.desc}</p>
                  {isDone && <p className={`${l.textColor} text-xs mt-1 font-medium`}>{Math.round((completedLevels[l.id] / 5) * 100)}% last time</p>}
                </button>
              );
            })}
          </div>

          <button onClick={() => generate(level)} disabled={loading || !notes.trim()}
            className={`w-full bg-gradient-to-r ${LEVELS.find(l => l.id === level)!.color} text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2`}>
            <Trophy size={16} />
            {loading ? "Generating quiz..." : `Start ${LEVELS.find(l => l.id === level)!.label} Quiz ${LEVELS.find(l => l.id === level)!.emoji}`}
          </button>
        </div>
      )}

      {/* Quiz */}
      {questions.length > 0 && !done && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${currentLevel.color} text-white`}>
                {currentLevel.emoji} {currentLevel.label}
              </div>
              <span className="text-white/40 text-sm">Q{current + 1} of {questions.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`${currentLevel.textColor} font-bold`}>{score} pts</span>
              <button onClick={reset} className="text-white/30 hover:text-white text-xs transition-colors">Exit</button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                i < current ? (answers[i] === questions[i].correct ? "bg-green-500" : "bg-red-500/60") :
                i === current ? `bg-gradient-to-r ${currentLevel.color}` : "bg-white/10"
              }`} />
            ))}
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className={`bg-white/5 border ${currentLevel.border} rounded-2xl p-6`}>

              <div className="flex items-start gap-3 mb-6">
                <span className={`flex-shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {current + 1}
                </span>
                <p className="text-white font-medium text-base leading-relaxed">{questions[current]?.question}</p>
              </div>

              <div className="space-y-2.5">
                {questions[current]?.options.map((opt, i) => {
                  let cls = "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 cursor-pointer";
                  if (selected !== null) {
                    if (i === questions[current].correct) cls = "bg-green-500/20 border-green-500/50 text-green-300 cursor-default";
                    else if (i === selected) cls = "bg-red-500/20 border-red-500/50 text-red-300 cursor-default";
                    else cls = "bg-white/3 border-white/5 text-white/20 cursor-default";
                  }
                  return (
                    <button key={i} onClick={() => selectAnswer(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${cls}`}>
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selected !== null && i === questions[current].correct ? "bg-green-500 text-white" :
                        selected !== null && i === selected ? "bg-red-500 text-white" :
                        "bg-white/10 text-white/50"
                      }`}>
                        {["A", "B", "C", "D"][i]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-between">
                    <p className={`text-sm font-medium ${selected === questions[current].correct ? "text-green-400" : "text-red-400"}`}>
                      {selected === questions[current].correct ? "✓ Correct! +1 point" : "✗ Incorrect"}
                    </p>
                    <button onClick={next}
                      className={`bg-gradient-to-r ${currentLevel.color} text-white px-5 py-2 rounded-xl text-sm font-medium`}>
                      {current + 1 >= questions.length ? "See Results 🏆" : "Next →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
