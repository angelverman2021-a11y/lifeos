"use client";
import { useState } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { CanvasTheme } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Save, FolderOpen, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "life-os-themes";

function getThemes(): CanvasTheme[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // normalize old format where theme data was nested under .data
    return raw.map((t: CanvasTheme & { data?: Partial<CanvasTheme> }) => ({
      id: t.id || "",
      name: t.name || "Untitled",
      bgColor: t.bgColor || t.data?.bgColor || "#0f0f1a",
      bgGradient: t.bgGradient || t.data?.bgGradient || "",
      placedStickers: t.placedStickers || t.data?.placedStickers || [],
      widgets: t.widgets || t.data?.widgets || [],
      isPublic: t.isPublic || false,
    }));
  } catch { return []; }
}

function saveThemes(themes: CanvasTheme[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

export default function ThemeManager() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"save" | "load">("save");
  const [themeName, setThemeName] = useState("");
  const [themes, setThemes] = useState<CanvasTheme[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { getThemeSnapshot, loadTheme } = useCanvasStore();

  function refreshThemes() {
    setThemes(getThemes());
  }

  function saveTheme() {
    if (!themeName.trim()) return;
    const snapshot = getThemeSnapshot();
    const newTheme: CanvasTheme = {
      id: uuidv4(),
      name: themeName.trim(),
      bgColor: snapshot.bgColor || "#0f0f1a",
      bgGradient: snapshot.bgGradient,
      placedStickers: snapshot.placedStickers || [],
      widgets: snapshot.widgets || [],
      isPublic: false,
    };
    const updated = [newTheme, ...getThemes()];
    saveThemes(updated);
    setThemes(updated);
    setThemeName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function loadSavedTheme(theme: CanvasTheme) {
    loadTheme(theme);
    setOpen(false);
  }

  function deleteTheme(id: string) {
    const updated = themes.filter((t) => t.id !== id);
    saveThemes(updated);
    setThemes(updated);
  }

  function shareTheme(theme: CanvasTheme) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(theme))));
    const url = `${window.location.origin}/canvas?theme=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(theme.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => { if (!o) refreshThemes(); return !o; }); }}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl px-3 py-2 text-white text-sm transition-all"
      >
        <Save size={14} />
        Themes
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-12 right-0 z-[100] bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 w-80 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-medium text-sm">Theme Manager</p>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
              <button onClick={() => setTab("save")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "save" ? "bg-purple-600 text-white" : "text-white/40 hover:text-white"}`}>
                <Save size={12} /> Save
              </button>
              <button onClick={() => setTab("load")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "load" ? "bg-purple-600 text-white" : "text-white/40 hover:text-white"}`}>
                <FolderOpen size={12} /> Load ({themes.length})
              </button>
            </div>

            {tab === "save" && (
              <div className="space-y-3">
                <input
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveTheme()}
                  placeholder="Theme name (e.g. My Study Space)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button onClick={saveTheme} disabled={!themeName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Save size={14} />
                  {saved ? "Saved! ✨" : "Save Current Theme"}
                </button>
                <p className="text-white/20 text-xs text-center">Saves background, stickers & widget positions</p>
              </div>
            )}

            {tab === "load" && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {themes.length === 0 ? (
                  <p className="text-white/20 text-xs text-center py-6">No saved themes yet. Save one first!</p>
                ) : (
                  themes.map((theme) => (
                    <div key={theme.id}
                      className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                      {/* Color preview */}
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/10"
                        style={{ background: theme.bgGradient || theme.bgColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{theme.name}</p>
                        <p className="text-white/30 text-xs">{(theme.placedStickers ?? []).length} stickers · {(theme.widgets ?? []).length} widgets</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => shareTheme(theme)}
                          className={`text-xs px-2 py-1 rounded-lg transition-all ${
                            copied === theme.id
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-white/5 hover:bg-blue-500/20 text-white/50 hover:text-blue-300"
                          }`}
                          title="Copy share link">
                          {copied === theme.id ? "Copied!" : "🔗"}
                        </button>
                        <button onClick={() => loadSavedTheme(theme)}
                          className="bg-white/5 hover:bg-green-500/20 text-white/50 hover:text-green-300 transition-all text-xs px-2 py-1 rounded-lg">
                          Load
                        </button>
                        <button onClick={() => deleteTheme(theme.id)}
                          className="bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all p-1 rounded-lg">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
