"use client";
import { useState, useRef, useEffect } from "react";
import { STICKER_BUNDLES } from "@/lib/sticker-bundles";
import { useCanvasStore } from "@/store/canvas-store";
import { PlacedSticker } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

let placedCount = 0;

export default function StickerPanel() {
  const [open, setOpen] = useState(false);
  const [activeBundle, setActiveBundle] = useState(STICKER_BUNDLES[0].id);
  const { addSticker } = useCanvasStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const bundle = STICKER_BUNDLES.find((b) => b.id === activeBundle)!;

  // Close on outside click
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

  function placeSticker(url: string) {
    placedCount++;
    const offset = (placedCount % 10) * 30;
    const sticker: PlacedSticker = {
      id: uuidv4(),
      stickerUrl: url,
      x: 120 + offset,
      y: 120 + offset,
      width: 80,
      height: 80,
      rotation: 0,
    };
    addSticker(sticker);
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all"
      >
        🎭 Stickers
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-12 left-0 z-[100] bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 w-80 shadow-2xl"
          >
            <p className="text-white font-medium mb-3 text-sm">Sticker Bundles</p>

            {/* Bundle selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {STICKER_BUNDLES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBundle(b.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeBundle === b.id
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{b.emoji}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>

            {/* Stickers grid */}
            <div className="grid grid-cols-4 gap-3">
              {bundle.stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => placeSticker(sticker.url)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-purple-600/30 transition-all hover:scale-110 group"
                  title={sticker.name}
                >
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://em-content.zobj.net/source/twitter/376/star_2b50.png"; }}
                  />
                  <span className="text-white/40 text-xs group-hover:text-white/70 transition-colors truncate w-full text-center">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-white/30 text-xs mt-3 text-center">
              Click a sticker to place it on canvas
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
