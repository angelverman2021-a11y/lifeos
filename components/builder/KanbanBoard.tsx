"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Bug, Zap, Star, GripVertical } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

type Status = "backlog" | "in-progress" | "review" | "done";
type Type = "bug" | "feature" | "task";
type Priority = "low" | "medium" | "high";

interface Card {
  id: string;
  title: string;
  type: Type;
  priority: Priority;
  status: Status;
  notes: string;
  createdAt: string;
}

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-white/40" },
  { id: "in-progress", label: "In Progress", color: "text-blue-400" },
  { id: "review", label: "Review", color: "text-yellow-400" },
  { id: "done", label: "Done", color: "text-green-400" },
];

const TYPE_ICONS: Record<Type, React.ReactNode> = {
  bug: <Bug size={12} className="text-red-400" />,
  feature: <Zap size={12} className="text-blue-400" />,
  task: <Star size={12} className="text-yellow-400" />,
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-white/10 text-white/40",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-red-500/20 text-red-400",
};

const STORAGE_KEY = "life-os-kanban";

export default function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [adding, setAdding] = useState<Status | null>(null);
  const [form, setForm] = useState({ title: "", type: "task" as Type, priority: "medium" as Priority, notes: "" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const { taskCompleted } = usePlanetEnergy();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCards(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function save(updated: Card[]) {
    setCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addCard(status: Status) {
    if (!form.title.trim()) return;
    save([...cards, { id: Date.now().toString(), ...form, status, createdAt: new Date().toISOString() }]);
    setForm({ title: "", type: "task", priority: "medium", notes: "" });
    setAdding(null);
  }

  function moveCard(id: string, status: Status) {
    const card = cards.find((c) => c.id === id);
    if (card && status === "done" && card.status !== "done") taskCompleted();
    save(cards.map((c) => c.id === id ? { ...c, status } : c));
  }

  function removeCard(id: string) {
    save(cards.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {COLUMNS.map((col) => (
          <div key={col.id} className="bg-black/20 rounded-xl p-2 text-center">
            <p className={`text-lg font-bold ${col.color}`}>{cards.filter((c) => c.status === col.id).length}</p>
            <p className="text-white/30 text-xs">{col.label}</p>
          </div>
        ))}
      </div>

      {/* Columns */}
      <div className="space-y-4">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.status === col.id);
          return (
            <div key={col.id} className="bg-black/20 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-medium ${col.color}`}>{col.label} <span className="text-white/20">({colCards.length})</span></p>
                <button onClick={() => setAdding(adding === col.id ? null : col.id)}
                  className="text-white/20 hover:text-white/60 transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              {/* Add form */}
              {adding === col.id && (
                <div className="bg-black/30 rounded-xl p-3 mb-3 space-y-2">
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Card title..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
                  <div className="flex gap-2">
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Type }))}
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                      <option value="task">Task</option>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                    </select>
                    <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Notes (optional)..." rows={2}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setAdding(null)}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 text-xs transition-all">Cancel</button>
                    <button onClick={() => addCard(col.id)}
                      className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs transition-all">Add</button>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="space-y-2">
                {colCards.map((card) => (
                  <div key={card.id} className="bg-black/30 border border-white/5 rounded-xl p-3 group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {TYPE_ICONS[card.type]}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[card.priority]}`}>
                            {card.priority}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm">{card.title}</p>
                        {card.notes && expanded === card.id && (
                          <p className="text-white/40 text-xs mt-1">{card.notes}</p>
                        )}
                      </div>
                      <button onClick={() => removeCard(card.id)}
                        className="text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <button key={c.id} onClick={() => moveCard(card.id, c.id)}
                          className={`flex-1 py-1 rounded-lg text-xs transition-all bg-white/5 hover:bg-white/10 ${c.color}`}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colCards.length === 0 && (
                  <p className="text-white/10 text-xs text-center py-3">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
