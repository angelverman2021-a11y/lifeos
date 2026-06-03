"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Upload, Sparkles, Save, Trash2, ChevronLeft, BookOpen, X } from "lucide-react";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

interface JournalEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  tone: string;
  photos: string[];
  date: string;
  mood: string;
  tags: string[];
}

const TONES = [
  { id: "deep", label: "Deep", emoji: "🌊", desc: "Reflective & emotional" },
  { id: "aesthetic", label: "Aesthetic", emoji: "🌸", desc: "Poetic & dreamy" },
  { id: "funny", label: "Funny", emoji: "😂", desc: "Witty & lighthearted" },
  { id: "minimal", label: "Minimal", emoji: "✨", desc: "Clean & honest" },
];

const MOODS = ["😊 Happy", "😔 Sad", "😤 Frustrated", "🥰 Loved", "😌 Peaceful", "🤩 Excited", "😴 Tired", "🤔 Thoughtful"];

const STORAGE_KEY = "life-os-journal";

function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function MemoryJournal() {
  const [view, setView] = useState<"list" | "create" | "read">("list");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("deep");
  const [mood, setMood] = useState("😊 Happy");
  const [photos, setPhotos] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { memoryCreated } = usePlanetEnergy();

  useEffect(() => { setEntries(getEntries()); }, []);

  function handlePhotos(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotos((p) => [...p, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  async function generateEntry() {
    if (!description.trim()) return;
    setLoading(true); setContent("");
    try {
      const res = await fetch("/api/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tone }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else setContent(data.entry);
    } catch { alert("Failed to connect to AI."); }
    setLoading(false);
  }

  function saveEntry() {
    if (!title.trim() || !content.trim()) return;
    const entry: JournalEntry = {
      id: uuidv4(), title, description, content, tone, photos,
      date: new Date().toISOString(), mood,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const updated = [entry, ...entries];
    saveEntries(updated); setEntries(updated);
    memoryCreated();
    setView("list");
    setTitle(""); setDescription(""); setContent(""); setPhotos([]); setTags("");
  }

  function deleteEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    saveEntries(updated); setEntries(updated);
    if (selected?.id === id) { setSelected(null); setView("list"); }
  }

  function openEntry(entry: JournalEntry) {
    setSelected(entry); setView("read");
  }

  const toneConfig = TONES.find((t) => t.id === tone)!;

  // Read view
  if (view === "read" && selected) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView("list")} className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-white font-bold">{selected.title}</h2>
          <p className="text-white/30 text-xs">{new Date(selected.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {selected.mood}</p>
        </div>
        <button onClick={() => deleteEntry(selected.id)} className="text-white/20 hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Photos */}
      {selected.photos.length > 0 && (
        <div className={`grid gap-2 ${selected.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {selected.photos.map((p, i) => (
            <img key={i} src={p} alt="" className="w-full rounded-2xl object-cover max-h-48" />
          ))}
        </div>
      )}

      {/* Tone badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
          {TONES.find((t) => t.id === selected.tone)?.emoji} {selected.tone}
        </span>
        {selected.tags.map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">#{tag}</span>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</p>
      </div>
    </motion.div>
  );

  // Create view
  if (view === "create") return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView("list")} className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-bold">New Memory</h2>
      </div>

      {/* Title */}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give this memory a title..."
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 font-medium" />

      {/* Mood */}
      <div>
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                mood === m ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
              }`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Add Photos</p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <X size={8} className="text-white" />
              </button>
            </div>
          ))}
          <button onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400/50 flex items-center justify-center text-white/30 hover:text-purple-400 transition-all">
            <Upload size={18} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotos(e.target.files)} />
        </div>
      </div>

      {/* Description */}
      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="What happened? Describe the memory, moment, or feeling you want to capture..."
        rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none text-sm" />

      {/* Tone selector */}
      <div>
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Writing Tone</p>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((t) => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                tone === t.id ? "bg-purple-600/20 border-purple-500/40 scale-[1.02]" : "bg-white/5 border-white/10 hover:border-white/20"
              }`}>
              <span className="text-lg">{t.emoji}</span>
              <p className="text-white text-xs font-medium mt-1">{t.label}</p>
              <p className="text-white/30 text-xs">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button onClick={generateEntry} disabled={loading || !description.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
        <Sparkles size={16} />
        {loading ? "AI is writing your memory..." : `Write in ${toneConfig.emoji} ${toneConfig.label} tone`}
      </button>

      {/* Generated content */}
      <AnimatePresence>
        {(loading || content) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {loading ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3 text-white/50">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Crafting your memory...
              </div>
            ) : (
              <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-purple-300 text-xs font-medium">{toneConfig.emoji} {toneConfig.label} tone</span>
                  <button onClick={generateEntry} className="text-white/30 hover:text-white text-xs transition-colors">🔄 Regenerate</button>
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent text-white/80 text-sm leading-relaxed resize-none focus:outline-none min-h-[120px]" />
              </div>
            )}

            {content && (
              <>
                <input value={tags} onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (comma separated): travel, family, milestone..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
                <button onClick={saveEntry} disabled={!title.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
                  <Save size={16} /> Save Memory
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold flex items-center gap-2"><BookOpen size={18} className="text-purple-400" /> Memory Journal</h2>
        <button onClick={() => setView("create")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
          + New Memory
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-white/40 font-medium">No memories yet</p>
          <p className="text-white/20 text-sm mt-1">Start capturing your life moments</p>
          <button onClick={() => setView("create")}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">
            Create First Memory
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <motion.div key={entry.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => openEntry(entry)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl p-4 cursor-pointer transition-all group">
              <div className="flex gap-3">
                {entry.photos[0] && (
                  <img src={entry.photos[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium text-sm truncate">{entry.title}</p>
                    <span className="text-white/20 text-xs flex-shrink-0">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{entry.mood}</p>
                  <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed">{entry.content.slice(0, 100)}...</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs">{TONES.find((t) => t.id === entry.tone)?.emoji}</span>
                    {entry.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-white/20 text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
