"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Target } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface Goal {
  id: string;
  text: string;
  category: "product" | "marketing" | "revenue" | "team" | "other";
  done: boolean;
  week: string; // YYYY-WW
}

const CATEGORIES = {
  product: { label: "Product", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  marketing: { label: "Marketing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  revenue: { label: "Revenue", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  team: { label: "Team", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  other: { label: "Other", color: "bg-white/10 text-white/50 border-white/10" },
};

function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

const STORAGE_KEY = "life-os-weekly-goals";

export default function WeeklyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("product");
  const { taskCompleted } = usePlanetEnergy();
  const week = getWeekKey();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGoals(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function save(updated: Goal[]) {
    setGoals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addGoal() {
    if (!text.trim()) return;
    save([...goals, { id: Date.now().toString(), text, category, done: false, week }]);
    setText("");
  }

  function toggle(id: string) {
    const updated = goals.map((g) => g.id === id ? { ...g, done: !g.done } : g);
    const goal = goals.find((g) => g.id === id);
    if (goal && !goal.done) taskCompleted();
    save(updated);
  }

  function remove(id: string) {
    save(goals.filter((g) => g.id !== id));
  }

  const thisWeek = goals.filter((g) => g.week === week);
  const older = goals.filter((g) => g.week !== week);
  const done = thisWeek.filter((g) => g.done).length;
  const progress = thisWeek.length ? Math.round((done / thisWeek.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      {thisWeek.length > 0 && (
        <div className="bg-black/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm font-medium">This Week</p>
            <p className="text-white font-bold">{done}/{thisWeek.length}</p>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/30 text-xs mt-1">{progress}% complete</p>
        </div>
      )}

      {/* Add goal */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORIES) as Goal["category"][]).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                category === cat ? CATEGORIES[cat].color : "bg-white/5 text-white/30 border-white/5"
              }`}>
              {CATEGORIES[cat].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="Add a weekly goal..."
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
          <button onClick={addGoal}
            className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-all">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* This week goals */}
      {thisWeek.length > 0 && (
        <div className="space-y-2">
          {thisWeek.map((goal) => (
            <div key={goal.id} className="flex items-start gap-3 group bg-black/20 rounded-xl p-3">
              <button onClick={() => toggle(goal.id)} className="mt-0.5 flex-shrink-0">
                {goal.done
                  ? <CheckCircle2 size={18} className="text-green-400" />
                  : <Circle size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm transition-all ${goal.done ? "text-white/30 line-through" : "text-white/80"}`}>
                  {goal.text}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-md border mt-1 inline-block ${CATEGORIES[goal.category].color}`}>
                  {CATEGORIES[goal.category].label}
                </span>
              </div>
              <button onClick={() => remove(goal.id)}
                className="text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {thisWeek.length === 0 && (
        <div className="text-center py-8">
          <Target size={32} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/30 text-sm">No goals this week yet</p>
        </div>
      )}

      {/* Older goals summary */}
      {older.length > 0 && (
        <div className="bg-black/10 rounded-xl p-3">
          <p className="text-white/20 text-xs mb-2">Previous weeks ({older.filter((g) => g.done).length}/{older.length} done)</p>
          <div className="w-full h-1 bg-white/5 rounded-full">
            <div className="h-full bg-white/20 rounded-full"
              style={{ width: `${older.length ? Math.round((older.filter((g) => g.done).length / older.length) * 100) : 0}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
