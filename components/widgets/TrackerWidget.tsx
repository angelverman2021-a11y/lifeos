"use client";
import { useState, useEffect } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { Widget, Task, TimetableSlot, TrackerData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Plus, Check, Trash2, Calendar, LayoutGrid, Clock, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const SLOT_COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
const CATEGORIES = ["Study", "Work", "Personal", "Health", "Other"];
const PRIORITY_COLORS = { low: "text-green-400 border-green-500/40", medium: "text-yellow-400 border-yellow-500/40", high: "text-red-400 border-red-500/40" };

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type TabType = "tasks" | "calendar" | "timetable" | "stats";

export default function TrackerWidget({ widget }: { widget: Widget }) {
  const { updateWidget } = useCanvasStore();
  const { taskCompleted } = usePlanetEnergy();
  const [tab, setTab] = useState<TabType>("tasks");
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [category, setCategory] = useState("Study");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotDay, setSlotDay] = useState("Mon");
  const [slotTime, setSlotTime] = useState("09:00");
  const [slotSubject, setSlotSubject] = useState("");
  const [slotColor, setSlotColor] = useState(SLOT_COLORS[0]);

  useEffect(() => { setMounted(true); }, []);

  const data: TrackerData = widget.trackerData || { tasks: [], timetable: [] };

  function save(updated: TrackerData) {
    updateWidget(widget.id, { trackerData: updated });
  }

  // Tasks
  function addTask() {
    if (!input.trim()) return;
    const task: Task = { id: uuidv4(), text: input.trim(), done: false, priority, date: selectedDate, category };
    save({ ...data, tasks: [...data.tasks, task] });
    setInput(""); setShowAddTask(false);
  }

  function toggleTask(id: string) {
    const task = data.tasks.find((t) => t.id === id);
    if (task && !task.done) taskCompleted();
    save({
      ...data,
      tasks: data.tasks.map((t) => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } : t),
    });
  }

  function deleteTask(id: string) {
    save({ ...data, tasks: data.tasks.filter((t) => t.id !== id) });
  }

  // Timetable
  function addSlot() {
    if (!slotSubject.trim()) return;
    const slot: TimetableSlot = { id: uuidv4(), day: slotDay, time: slotTime, subject: slotSubject.trim(), color: slotColor };
    save({ ...data, timetable: [...data.timetable, slot] });
    setSlotSubject(""); setShowAddSlot(false);
  }

  function deleteSlot(id: string) {
    save({ ...data, timetable: data.timetable.filter((s) => s.id !== id) });
  }

  // Stats
  const todayTasks = data.tasks.filter((t) => t.date === selectedDate);
  const doneTasks = todayTasks.filter((t) => t.done);
  const productivity = todayTasks.length ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;
  const allDone = data.tasks.filter((t) => t.done).length;
  const allTotal = data.tasks.length;

  if (!mounted) return <div className="h-full" />;

  const TABS: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "tasks", icon: <Check size={11} />, label: "Tasks" },
    { id: "calendar", icon: <Calendar size={11} />, label: "Calendar" },
    { id: "timetable", icon: <LayoutGrid size={11} />, label: "Timetable" },
    { id: "stats", icon: <BarChart2 size={11} />, label: "Stats" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>

      {/* Tab bar */}
      <div className="flex border-b border-white/5 flex-shrink-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs transition-all border-b-2 ${
              tab === t.id ? "border-purple-500 text-white" : "border-transparent text-white/30 hover:text-white/60"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">

        {/* ── TASKS TAB ── */}
        {tab === "tasks" && (
          <div className="flex flex-col h-full">
            {/* Date nav */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 flex-shrink-0">
              <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="text-white/30 hover:text-white transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="text-white/60 text-xs font-medium">{formatDate(selectedDate)}</span>
              <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="text-white/30 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Progress */}
            {todayTasks.length > 0 && (
              <div className="px-3 py-1.5 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/30 text-xs">{doneTasks.length}/{todayTasks.length} done</span>
                  <span className="text-purple-400 text-xs font-medium">{productivity}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${productivity}%` }} />
                </div>
              </div>
            )}

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
              {todayTasks.length === 0 && (
                <p className="text-white/20 text-xs text-center py-4">No tasks for this day</p>
              )}
              <AnimatePresence>
                {todayTasks.map((task) => (
                  <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 group">
                    <button onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                        task.done ? "bg-purple-500 border-purple-500" : `border-white/30 hover:border-purple-400 ${PRIORITY_COLORS[task.priority].split(" ")[1]}`
                      }`}>
                      {task.done && <Check size={9} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs transition-all ${task.done ? "line-through text-white/25" : "text-white/70"}`}>
                        {task.text}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-xs ${PRIORITY_COLORS[task.priority].split(" ")[0]}`}>{task.priority}</span>
                        <span className="text-white/20 text-xs">· {task.category}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                      <Trash2 size={10} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add task */}
            <div className="px-3 pb-2 flex-shrink-0">
              <AnimatePresence>
                {showAddTask && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mb-2 space-y-1.5 overflow-hidden">
                    <input value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      placeholder="Task description..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-purple-500" />
                    <div className="flex gap-1.5">
                      {(["low", "medium", "high"] as Task["priority"][]).map((p) => (
                        <button key={p} onClick={() => setPriority(p)}
                          className={`flex-1 py-1 rounded-lg text-xs capitalize transition-all border ${
                            priority === p ? PRIORITY_COLORS[p] + " bg-white/5" : "border-white/10 text-white/30"
                          }`}>{p}</button>
                      ))}
                    </div>
                    <div className="flex gap-1 overflow-x-auto">
                      {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCategory(c)}
                          className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-xs transition-all ${
                            category === c ? "bg-purple-600 text-white" : "bg-white/5 text-white/30 hover:bg-white/10"
                          }`}>{c}</button>
                      ))}
                    </div>
                    <button onClick={addTask}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg text-xs transition-colors">
                      Add Task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setShowAddTask(!showAddTask)}
                className="w-full flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 text-white/40 hover:text-white text-xs transition-all">
                <Plus size={12} /> {showAddTask ? "Cancel" : "Add Task"}
              </button>
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === "calendar" && (
          <div className="flex flex-col h-full overflow-y-auto px-3 py-2">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">All Tasks by Date</p>
            {(() => {
              const byDate: Record<string, Task[]> = {};
              data.tasks.forEach((t) => {
                if (!byDate[t.date]) byDate[t.date] = [];
                byDate[t.date].push(t);
              });
              const dates = Object.keys(byDate).sort().reverse();
              if (dates.length === 0) return <p className="text-white/20 text-xs text-center py-6">No tasks yet</p>;
              return dates.map((date) => {
                const tasks = byDate[date];
                const done = tasks.filter((t) => t.done).length;
                const pct = Math.round((done / tasks.length) * 100);
                return (
                  <div key={date} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-xs font-medium">{formatDate(date)}</span>
                      <span className={`text-xs font-medium ${pct === 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {pct}% {pct === 100 ? "🎉" : pct >= 50 ? "👍" : "💪"}
                      </span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: pct === 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-1.5 py-0.5">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${t.done ? "bg-green-500" : "bg-white/10"}`}>
                          {t.done && <Check size={8} className="text-white" />}
                        </div>
                        <span className={`text-xs ${t.done ? "line-through text-white/25" : "text-white/60"}`}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── TIMETABLE TAB ── */}
        {tab === "timetable" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto px-2 py-2">
              {/* Grid */}
              <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${DAYS.length}, 1fr)` }}>
                <div />
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-white/40 text-xs py-1 font-medium">{d}</div>
                ))}
                {TIMES.map((time) => (
                  <>
                    <div key={time} className="text-white/20 text-xs flex items-center justify-end pr-1">{time}</div>
                    {DAYS.map((day) => {
                      const slot = data.timetable.find((s) => s.day === day && s.time === time);
                      return (
                        <div key={day}
                          className={`rounded-lg min-h-[28px] flex items-center justify-center text-xs transition-all ${
                            slot ? "text-white font-medium" : "bg-white/3 hover:bg-white/5"
                          }`}
                          style={slot ? { background: slot.color + "33", border: `1px solid ${slot.color}66` } : {}}>
                          {slot ? (
                            <div className="flex items-center gap-1 px-1 w-full justify-between">
                              <span className="truncate text-xs">{slot.subject}</span>
                              <button onClick={() => deleteSlot(slot.id)} className="text-white/30 hover:text-red-400 flex-shrink-0">
                                <Trash2 size={8} />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            {/* Add slot */}
            <div className="px-3 pb-2 flex-shrink-0 border-t border-white/5 pt-2">
              <AnimatePresence>
                {showAddSlot && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mb-2 space-y-1.5 overflow-hidden">
                    <input value={slotSubject} onChange={(e) => setSlotSubject(e.target.value)}
                      placeholder="Subject name..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-purple-500" />
                    <div className="flex gap-1.5">
                      <select value={slotDay} onChange={(e) => setSlotDay(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                        {DAYS.map((d) => <option key={d} value={d} className="bg-[#1a1a2e]">{d}</option>)}
                      </select>
                      <select value={slotTime} onChange={(e) => setSlotTime(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                        {TIMES.map((t) => <option key={t} value={t} className="bg-[#1a1a2e]">{t}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      {SLOT_COLORS.map((c) => (
                        <button key={c} onClick={() => setSlotColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${slotColor === c ? "border-white scale-125" : "border-transparent"}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                    <button onClick={addSlot}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg text-xs transition-colors">
                      Add to Timetable
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setShowAddSlot(!showAddSlot)}
                className="w-full flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 text-white/40 hover:text-white text-xs transition-all">
                <Plus size={12} /> {showAddSlot ? "Cancel" : "Add Class/Slot"}
              </button>
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div className="overflow-y-auto h-full px-3 py-3 space-y-4">
            {/* Overall */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Overall Progress</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/50 text-xs">Total Tasks</span>
                    <span className="text-white text-xs font-bold">{allDone}/{allTotal}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: allTotal ? `${(allDone / allTotal) * 100}%` : "0%" }} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {allTotal ? Math.round((allDone / allTotal) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Today */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Today — {formatDate(getToday())}</p>
              <div className="flex items-center gap-2">
                <div className={`text-3xl font-bold ${productivity === 100 ? "text-green-400" : productivity >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {productivity}%
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {productivity === 100 ? "Perfect day! 🏆" : productivity >= 75 ? "Great work! 🔥" : productivity >= 50 ? "Good progress 👍" : productivity > 0 ? "Keep going 💪" : "Start your day! 🌅"}
                  </p>
                  <p className="text-white/30 text-xs">{doneTasks.length} of {todayTasks.length} tasks done</p>
                </div>
              </div>
            </div>

            {/* By category */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">By Category</p>
              {CATEGORIES.map((cat) => {
                const catTasks = data.tasks.filter((t) => t.category === cat);
                const catDone = catTasks.filter((t) => t.done).length;
                if (catTasks.length === 0) return null;
                return (
                  <div key={cat} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-white/50 text-xs">{cat}</span>
                      <span className="text-white/50 text-xs">{catDone}/{catTasks.length}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(catDone / catTasks.length) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Pending Tasks</p>
              {data.tasks.filter((t) => !t.done).length === 0
                ? <p className="text-green-400 text-xs">All tasks completed! 🎉</p>
                : data.tasks.filter((t) => !t.done).slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 py-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      t.priority === "high" ? "bg-red-400" : t.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`} />
                    <span className="text-white/60 text-xs truncate">{t.text}</span>
                    <span className="text-white/20 text-xs flex-shrink-0">{formatDate(t.date)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
