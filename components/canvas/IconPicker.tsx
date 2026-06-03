"use client";
import { useState } from "react";
import { STICKER_BUNDLES } from "@/lib/sticker-bundles";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function IconPicker({ onSelect, onClose }: Props) {
  const [activeBundle, setActiveBundle] = useState(STICKER_BUNDLES[0].id);
  const bundle = STICKER_BUNDLES.find((b) => b.id === activeBundle)!;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-80 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold text-sm">Pick Widget Icon</p>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Bundle tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
          {STICKER_BUNDLES.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBundle(b.id)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                activeBundle === b.id ? "bg-purple-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {b.emoji} {b.name}
            </button>
          ))}
        </div>

        {/* Stickers grid */}
        <div className="grid grid-cols-5 gap-2">
          {bundle.stickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onSelect(sticker.url)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-purple-600/30 transition-all hover:scale-110"
              title={sticker.name}
            >
              <img src={sticker.url} alt={sticker.name} className="w-8 h-8 object-contain" />
            </button>
          ))}
        </div>

        <p className="text-white/20 text-xs text-center mt-3">Click any sticker to set as widget icon</p>
      </motion.div>
    </div>
  );
}
