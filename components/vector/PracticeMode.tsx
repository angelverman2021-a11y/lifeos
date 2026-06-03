"use client";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

type Level = "basic" | "intermediate" | "advanced";

interface Problem {
  question: string;
  answer: string;
  hint: string;
}

const TOPICS = ["Algebra", "Calculus", "Trigonometry", "Vectors", "Statistics"];

const SEED_PROBLEMS: Record<Level, string> = {
  basic: "simple linear equations like 2x + 3 = 7",
  intermediate: "quadratic equations and basic calculus derivatives",
  advanced: "integration, vector operations, and complex algebra",
};

export default function PracticeMode() {
  const [topic, setTopic] = useState("Algebra");
  const [level, setLevel] = useState<Level>("basic");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const { quizCompleted, flashcardDone } = usePlanetEnergy();

  async function loadProblems() {
    setLoading(true);
    setProblems([]);
    setCurrent(0);
    setScore({ correct: 0, total: 0 });
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equation: `${topic} — ${SEED_PROBLEMS[level]}`,
          mode: "practice",
        }),
      });
      const data = await res.json();
      if (data.problems) setProblems(data.problems);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function checkAnswer() {
    if (!userAnswer.trim() || !problems[current]) return;
    const correct = problems[current].answer.toLowerCase().replace(/\s/g, "");
    const given = userAnswer.toLowerCase().replace(/\s/g, "");
    const isCorrect = correct.includes(given) || given.includes(correct);
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    if (isCorrect) quizCompleted(); else flashcardDone();
  }

  function next() {
    if (current < problems.length - 1) {
      setCurrent((c) => c + 1);
      setUserAnswer("");
      setFeedback(null);
      setShowHint(false);
    }
  }

  const prob = problems[current];

  return (
    <div className="space-y-4">
      {/* Config */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                topic === t ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["basic", "intermediate", "advanced"] as Level[]).map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${
                level === l ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}>{l}</button>
          ))}
        </div>
        <button onClick={loadProblems} disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {loading ? "Generating..." : "Generate Problems"}
        </button>
      </div>

      {/* Score */}
      {score.total > 0 && (
        <div className="flex gap-3">
          <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <p className="text-green-400 text-xl font-bold">{score.correct}</p>
            <p className="text-white/40 text-xs">Correct</p>
          </div>
          <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-red-400 text-xl font-bold">{score.total - score.correct}</p>
            <p className="text-white/40 text-xs">Wrong</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
            <p className="text-white text-xl font-bold">{problems.length}</p>
            <p className="text-white/40 text-xs">Total</p>
          </div>
        </div>
      )}

      {/* Problem */}
      {prob && (
        <div className="space-y-3">
          <div className="bg-black/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/30 text-xs">Problem {current + 1} of {problems.length}</span>
              <span className="text-white/30 text-xs capitalize">{level}</span>
            </div>
            <p className="text-white font-medium">{prob.question}</p>
          </div>

          {showHint && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-yellow-400 text-xs mb-1">Hint</p>
              <p className="text-white/70 text-sm">{prob.hint}</p>
            </div>
          )}

          {feedback === null ? (
            <div className="space-y-2">
              <input value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Your answer..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-mono placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
              <div className="flex gap-2">
                <button onClick={() => setShowHint(true)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 text-sm transition-all">
                  💡 Hint
                </button>
                <button onClick={checkAnswer}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm transition-all">
                  Check
                </button>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl p-4 space-y-2 ${
              feedback === "correct" ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
            }`}>
              <div className="flex items-center gap-2">
                {feedback === "correct"
                  ? <CheckCircle size={18} className="text-green-400" />
                  : <XCircle size={18} className="text-red-400" />}
                <p className={`font-medium ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
                  {feedback === "correct" ? "Correct!" : "Not quite"}
                </p>
              </div>
              <p className="text-white/60 text-sm">Answer: <span className="text-white font-mono">{prob.answer}</span></p>
              {current < problems.length - 1 && (
                <button onClick={next}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all mt-2">
                  Next Problem →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
