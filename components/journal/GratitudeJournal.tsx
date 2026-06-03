"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Sparkles, Save, Heart } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface GratitudeEntry {
  id: string;
  prompt: string;
  response: string;
  mood: string;
  date: string;
}

const MOODS = ["😊", "😌", "🥰", "🤩", "😔", "😤", "😴"];
const STORAGE_KEY = "life-os-gratitude";

function getEntries(): GratitudeEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export default function GratitudeJournal() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [mood, setMood] = useState("😊");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { gratitudeSaved } = usePlanetEnergy();

  useEffect(() => { setEntries(getEntries()); generatePrompts(); }, []);

  async function generatePrompts() {
    setLoading(true);
    try {
      const recent = getEntries().slice(0, 3).map((e) => e.prompt).join(", ");
      const res = await fetch("/api/ai/gratitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, previousEntries: recent }),
      });
      const data = await res.json();
      if (data.prompts) { setPrompts(data.prompts); setSelectedPrompt(data.prompts[0]); }
    } catch { /* use fallback */ }
    setLoading(false);
  }

  function saveEntry() {
    if (!selectedPrompt || !response.trim()) return;
    const entry: GratitudeEntry = { id: uuidv4(), prompt: selectedPrompt, response, mood, date: new Date().toISOString() };
    const updated = [entry, ...entries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
    setResponse(""); setSaved(true); gratitudeSaved();
    setTimeout(() => setSaved(false), 2000);
  }

  const streak = (() => {
    if (entries.length === 0) return 0;
    let count = 0;
    const today = new Date().toDateString();
    const dates = [...new Set(entries.map((e) => new Date(e.date).toDateString()))];
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (dates.includes(d.toDateString())) count++;
      else break;
    }
    return count;
  })();

  return (
    <div className="space-y-5">
      {/* Streak */}
      <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-3xl">🔥</div>
        <div>
          <p className="text-white font-bold">{streak} day streak</p>
          <p className="text-white/40 text-xs">{entries.length} total entries · Keep going!</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-orange-300 text-sm font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</p>
          <p className="text-white/30 text-xs">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Mood */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Today's Mood</p>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${mood === m ? "bg-purple-600 scale-110" : "bg-white/5 hover:bg-white/10"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/40 text-xs uppercase tracking-wider">Today's Prompts</p>
          <button onClick={generatePrompts} disabled={loading}
            className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-colors disabled:opacity-40">
            <Sparkles size={12} /> {loading ? "Loading..." : "New Prompts"}
          </button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-white/30 text-sm py-2">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Generating prompts...
            </div>
          ) : prompts.map((p, i) => (
            <button key={i} onClick={() => setSelectedPrompt(p)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                selectedPrompt === p ? "bg-purple-600/20 border-purple-500/40 text-white" : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Response */}
      {selectedPrompt && (
        <div className="space-y-3">
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-3">
            <p className="text-purple-300 text-sm">{selectedPrompt}</p>
          </div>
          <textarea value={response} onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none text-sm" />
          <button onClick={saveEntry} disabled={!response.trim()}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              saved ? "bg-green-600 text-white" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 disabled:opacity-40"
            }`}>
            {saved ? <><Heart size={16} /> Saved!</> : <><Save size={16} /> Save Entry</>}
          </button>
        </div>
      )}

      {/* Past entries */}
      {entries.length > 0 && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Past Entries</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/30 text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="text-sm">{entry.mood}</span>
                </div>
                <p className="text-white/40 text-xs italic mb-1">"{entry.prompt}"</p>
                <p className="text-white/60 text-xs line-clamp-2">{entry.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
