"use client";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { useCanvasStore } from "@/store/canvas-store";
import { motion, AnimatePresence } from "framer-motion";

const GRADIENTS = [
  { name: "Cosmic", value: "linear-gradient(135deg, #0f0f1a, #1a0533, #0d1b2a)" },
  { name: "Sunset", value: "linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)" },
  { name: "Ocean", value: "linear-gradient(135deg, #0abde3, #48dbfb, #006266)" },
  { name: "Forest", value: "linear-gradient(135deg, #1dd1a1, #10ac84, #0a3d2e)" },
  { name: "Candy", value: "linear-gradient(135deg, #fd79a8, #a29bfe, #74b9ff)" },
  { name: "Dark", value: "linear-gradient(135deg, #2d3436, #636e72, #1a1a2e)" },
  { name: "Aurora", value: "linear-gradient(135deg, #6c5ce7, #00cec9, #55efc4)" },
  { name: "Fire", value: "linear-gradient(135deg, #e17055, #d63031, #fdcb6e)" },
];

const SOLID_COLORS = [
  "#0f0f1a", "#1a0533", "#0d1b2a", "#1a1a2e",
  "#ffffff", "#f8f9fa", "#ffeaa7", "#fd79a8",
  "#74b9ff", "#55efc4", "#a29bfe", "#fdcb6e",
];

export default function BackgroundPicker() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"solid" | "gradient" | "custom">("solid");
  const { bgColor, setBgColor, setBgGradient } = useCanvasStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all"
      >
        <div
          className="w-5 h-5 rounded-full border border-white/30"
          style={{ background: bgColor || "linear-gradient(135deg,#0f0f1a,#1a0533)" }}
        />
        Background
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-12 left-0 z-[100] bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 w-72 shadow-2xl"
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
              {(["solid", "gradient", "custom"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    tab === t ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "solid" && (
              <div className="grid grid-cols-6 gap-2">
                {SOLID_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                      bgColor === color ? "border-purple-400" : "border-transparent"
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            )}

            {tab === "gradient" && (
              <div className="grid grid-cols-2 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => setBgGradient(g.value)}
                    className="h-12 rounded-xl text-white text-xs font-medium hover:scale-105 transition-all border border-white/10"
                    style={{ background: g.value }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            {tab === "custom" && (
              <div className="flex flex-col items-center gap-3">
                <HexColorPicker color={bgColor} onChange={setBgColor} style={{ width: "100%" }} />
                <p className="text-white/50 text-xs">{bgColor}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
