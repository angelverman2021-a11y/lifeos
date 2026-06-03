"use client";
import { useRef, useState, useEffect } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { PlacedSticker } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSticker { id: string; url: string; name: string; }

const STORAGE_KEY = "life-os-custom-stickers";

function getCustomStickers(): CustomSticker[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveCustomStickers(stickers: CustomSticker[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers));
}

let uploadCount = 0;

export default function CustomStickerUploader() {
  const [open, setOpen] = useState(false);
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addSticker } = useCanvasStore();

  useEffect(() => {
    if (open) setCustomStickers(getCustomStickers());
  }, [open]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newSticker: CustomSticker = { id: uuidv4(), url, name: file.name.replace(/\.[^.]+$/, "") };
        const updated = [newSticker, ...getCustomStickers()];
        saveCustomStickers(updated);
        setCustomStickers(updated);
      };
      reader.readAsDataURL(file);
    });
  }

  function placeSticker(url: string) {
    uploadCount++;
    const offset = (uploadCount % 8) * 30;
    const sticker: PlacedSticker = {
      id: uuidv4(), stickerUrl: url,
      x: 150 + offset, y: 150 + offset,
      width: 80, height: 80, rotation: 0,
    };
    addSticker(sticker);
    setOpen(false);
  }

  function deleteCustomSticker(id: string) {
    const updated = customStickers.filter((s) => s.id !== id);
    saveCustomStickers(updated);
    setCustomStickers(updated);
  }

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-white text-sm transition-all"
      >
        <Upload size={14} /> My Stickers
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
            <p className="text-white font-medium text-sm mb-3">My Custom Stickers</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-4 ${
                dragging ? "border-purple-400 bg-purple-500/10" : "border-white/10 hover:border-purple-400/50 hover:bg-white/5"
              }`}
            >
              <Upload size={20} className="text-white/30 mx-auto mb-2" />
              <p className="text-white/50 text-xs">Drop images here or click to upload</p>
              <p className="text-white/20 text-xs mt-1">PNG, JPG, GIF, WebP supported</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {/* Custom stickers grid */}
            {customStickers.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-4">No custom stickers yet. Upload some!</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {customStickers.map((sticker) => (
                  <div key={sticker.id} className="relative group">
                    <button
                      onClick={() => placeSticker(sticker.url)}
                      className="w-full aspect-square p-2 rounded-xl bg-white/5 hover:bg-purple-600/30 transition-all hover:scale-105"
                      title={sticker.name}
                    >
                      <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomSticker(sticker.id); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex"
                    >
                      <X size={8} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
