"use client";
import { useState, useRef } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { Widget } from "@/types";
import { v4 as uuidv4 } from "uuid";
import BackgroundPicker from "@/components/canvas/BackgroundPicker";
import StickerPanel from "@/components/canvas/StickerPanel";
import CustomStickerUploader from "@/components/canvas/CustomStickerUploader";
import ThemeManager from "@/components/canvas/ThemeManager";
import { FileText, Timer, LayoutList, LayoutTemplate, X } from "lucide-react";
import { DEFAULT_CANVAS_TEMPLATES } from "@/lib/default-canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function Toolbar() {
  const { addWidget, loadTheme } = useCanvasStore();
  const widgetCount = useRef(0);
  const [showTemplates, setShowTemplates] = useState(false);

  function addWidgetOfType(type: Widget["type"]) {
    widgetCount.current += 1;
    const offset = (widgetCount.current % 8) * 40;
    const widget: Widget = {
      id: uuidv4(),
      type,
      x: 80 + offset,
      y: 80 + offset,
      width: type === "timer" ? 240 : 280,
      height: type === "timer" ? 260 : 220,
      title: type === "notes" ? "My Notes" : type === "timer" ? "Focus Timer" : "Task Tracker",
      content: type === "tracker" ? "[]" : "",
    };
    addWidget(widget);
  }

  function applyTemplate(id: string) {
    const template = DEFAULT_CANVAS_TEMPLATES.find((t) => t.id === id);
    if (template) loadTheme(template.theme);
    setShowTemplates(false);
  }

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Logo */}
      <span className="text-lg mr-1">🪐</span>

      <div className="w-px h-6 bg-white/10" />

      {/* Background + Stickers */}
      <BackgroundPicker />
      <StickerPanel />
      <CustomStickerUploader />

      {/* Templates button */}
      <div className="relative">
        <button
          onClick={() => setShowTemplates((o) => !o)}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all"
        >
          <LayoutTemplate size={14} /> Templates
        </button>

        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-12 left-0 z-[100] bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 w-72 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium text-sm">Canvas Templates</p>
                <button onClick={() => setShowTemplates(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CANVAS_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-left transition-all hover:scale-[1.02]"
                  >
                    <div className="text-2xl mb-1.5">{t.emoji}</div>
                    <p className="text-white text-xs font-semibold">{t.name}</p>
                    <p className="text-white/30 text-xs mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-white/20 text-xs text-center mt-3">
                ⚠️ Applying a template replaces current canvas
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Widgets */}
      <button onClick={() => addWidgetOfType("notes")}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all">
        <FileText size={14} /> Notes
      </button>
      <button onClick={() => addWidgetOfType("timer")}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all">
        <Timer size={14} /> Timer
      </button>
      <button onClick={() => addWidgetOfType("tracker")}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all">
        <LayoutList size={14} /> Tracker
      </button>

      <div className="w-px h-6 bg-white/10" />

      {/* Theme manager */}
      <ThemeManager />
    </div>
  );
}
