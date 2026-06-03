"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ChevronRight, RotateCcw, Star } from "lucide-react";

interface Feedback {
  rating: number;
  ratingLabel: string;
  whatWasGood: string;
  improvements: string;
  betterAnswer: string;
  tips: string[];
}

interface AnswerRecord {
  question: string;
  answer: string;
  feedback: Feedback;
}

function RatingBar({ rating }: { rating: number }) {
  const color = rating >= 8 ? "from-green-500 to-emerald-400" : rating >= 6 ? "from-yellow-500 to-orange-400" : rating >= 4 ? "from-orange-500 to-red-400" : "from-red-600 to-red-400";
  const label = rating >= 8 ? "text-green-400" : rating >= 6 ? "text-yellow-400" : rating >= 4 ? "text-orange-400" : "text-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${rating * 10}%` }} transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`} />
      </div>
      <span className={`font-bold text-lg w-8 ${label}`}>{rating}</span>
    </div>
  );
}

export default function InterviewPrep() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);

  async function startInterview() {
    if (!role.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); setLoading(false); return; }
      setQuestions(data.questions);
      setCurrent(0); setAnswer(""); setFeedback(null); setDone(false); setRecords([]);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  async function getFeedback() {
    if (!answer.trim()) return;
    setFeedbackLoading(true); setFeedback(null);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question: questions[current], answer }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); setFeedbackLoading(false); return; }
      setFeedback(data.feedback);
      setRecords((r) => [...r, { question: questions[current], answer, feedback: data.feedback }]);
    } catch { alert("Failed to get feedback."); }
    setFeedbackLoading(false);
  }

  function next() {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent((c) => c + 1);
    setAnswer(""); setFeedback(null);
  }

  function reset() { setQuestions([]); setRole(""); setDone(false); setRecords([]); }

  const avgRating = records.length ? Math.round(records.reduce((s, r) => s + r.feedback.rating, 0) / records.length) : 0;

  // Results screen
  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Overall score */}
      <div className={`rounded-2xl p-6 text-center border ${
        avgRating >= 8 ? "bg-green-500/10 border-green-500/20" :
        avgRating >= 6 ? "bg-yellow-500/10 border-yellow-500/20" :
        "bg-red-500/10 border-red-500/20"
      }`}>
        <div className="text-5xl mb-3">{avgRating >= 8 ? "🏆" : avgRating >= 6 ? "👍" : "📚"}</div>
        <h3 className="text-white font-bold text-xl mb-1">Interview Complete!</h3>
        <p className="text-white/50 text-sm mb-4">{role} · {questions.length} questions</p>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-white/40 text-sm">Overall Rating</span>
          <span className={`text-4xl font-bold ${avgRating >= 8 ? "text-green-400" : avgRating >= 6 ? "text-yellow-400" : "text-red-400"}`}>
            {avgRating}/10
          </span>
        </div>
        <RatingBar rating={avgRating} />
        <p className="text-white/40 text-xs mt-3">
          {avgRating >= 8 ? "Excellent performance! You're ready for real interviews 🚀" :
           avgRating >= 6 ? "Good job! A bit more practice and you'll nail it 💪" :
           "Keep practicing! Review the feedback below to improve 📖"}
        </p>
      </div>

      {/* Per question breakdown */}
      <div className="space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-wider">Question Breakdown</p>
        {records.map((r, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-white/70 text-sm flex-1">{r.question}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star size={12} className={r.feedback.rating >= 7 ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                <span className={`text-sm font-bold ${r.feedback.rating >= 8 ? "text-green-400" : r.feedback.rating >= 6 ? "text-yellow-400" : "text-red-400"}`}>
                  {r.feedback.rating}/10
                </span>
              </div>
            </div>
            <RatingBar rating={r.feedback.rating} />
            <p className="text-white/40 text-xs mt-2">{r.feedback.ratingLabel}</p>
          </div>
        ))}
      </div>

      <button onClick={reset}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <RotateCcw size={14} /> Practice Again
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      {questions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Mic size={18} className="text-purple-400" /> Mock Interview
          </h2>
          <p className="text-white/40 text-sm mb-4">AI asks role-specific questions, rates your answers 1-10, and gives detailed feedback + better answer suggestions.</p>
          <input value={role} onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startInterview()}
            placeholder="Target role (e.g. Software Engineer, Product Manager...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 mb-4" />
          <button onClick={startInterview} disabled={loading || !role.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
            <Mic size={16} />
            {loading ? "Preparing questions..." : "Start Mock Interview"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Q{current + 1} of {questions.length}</span>
            <span className="text-purple-300 text-sm font-medium">{role}</span>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                i < records.length ? (records[i]?.feedback.rating >= 7 ? "bg-green-500" : records[i]?.feedback.rating >= 5 ? "bg-yellow-500" : "bg-red-500") :
                i === current ? "bg-purple-500" : "bg-white/10"
              }`} />
            ))}
          </div>

          {/* Question */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Question {current + 1}</p>
            <p className="text-white font-medium text-base leading-relaxed">{questions[current]}</p>
          </div>

          {/* Answer */}
          {!feedback && (
            <>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Take your time, think it through."
                rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none text-sm" />
              <button onClick={getFeedback} disabled={feedbackLoading || !answer.trim()}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
                {feedbackLoading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" /> Evaluating your answer...</>
                  : "✨ Get AI Rating & Feedback"}
              </button>
            </>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Rating */}
                <div className={`rounded-2xl p-4 border ${
                  feedback.rating >= 8 ? "bg-green-500/10 border-green-500/20" :
                  feedback.rating >= 6 ? "bg-yellow-500/10 border-yellow-500/20" :
                  "bg-red-500/10 border-red-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Your Rating</span>
                    <span className={`text-2xl font-bold ${feedback.rating >= 8 ? "text-green-400" : feedback.rating >= 6 ? "text-yellow-400" : "text-red-400"}`}>
                      {feedback.rating}/10
                    </span>
                  </div>
                  <RatingBar rating={feedback.rating} />
                  <p className={`text-xs mt-1 font-medium ${feedback.rating >= 8 ? "text-green-400" : feedback.rating >= 6 ? "text-yellow-400" : "text-red-400"}`}>
                    {feedback.ratingLabel}
                  </p>
                </div>

                {/* What was good */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <p className="text-green-400 font-medium text-xs mb-1">✅ What was good</p>
                  <p className="text-white/70 text-sm">{feedback.whatWasGood}</p>
                </div>

                {/* Improvements */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                  <p className="text-orange-400 font-medium text-xs mb-1">⚡ Improvements</p>
                  <p className="text-white/70 text-sm">{feedback.improvements}</p>
                </div>

                {/* Better answer */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <p className="text-purple-400 font-medium text-xs mb-1">💡 Stronger Answer</p>
                  <p className="text-white/70 text-sm leading-relaxed">{feedback.betterAnswer}</p>
                </div>

                {/* Tips */}
                {feedback.tips?.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white/40 font-medium text-xs mb-2">🎯 Pro Tips</p>
                    {feedback.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-purple-400 text-xs mt-0.5">•</span>
                        <p className="text-white/60 text-xs">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={next}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2">
                  {current + 1 >= questions.length ? "See Final Results 🏆" : <>Next Question <ChevronRight size={16} /></>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
