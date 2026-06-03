"use client";
import { useRef, useState } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { PlacedSticker } from "@/types";
import { X, RotateCw } from "lucide-react";

const MIN_SIZE = 30;

type ResizeHandle = "nw" | "ne" | "sw" | "se";

export default function DraggableSticker({ sticker }: { sticker: PlacedSticker }) {
  const { updateSticker, removeSticker } = useCanvasStore();
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; sx: number; sy: number } | null>(null);

  // --- Drag to move ---
  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).dataset.handle) return;
    e.stopPropagation();
    setSelected(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, sx: sticker.x, sy: sticker.y };

    function onMove(ev: MouseEvent) {
      if (!dragStart.current) return;
      updateSticker(sticker.id, {
        x: dragStart.current.sx + ev.clientX - dragStart.current.mx,
        y: dragStart.current.sy + ev.clientY - dragStart.current.my,
      });
    }
    function onUp() {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // --- Resize from corner ---
  function onResizeMouseDown(e: React.MouseEvent, handle: ResizeHandle) {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = sticker.width;
    const startH = sticker.height;
    const startLeft = sticker.x;
    const startTop = sticker.y;

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startLeft;
      let newY = startTop;

      if (handle === "se") {
        newW = Math.max(MIN_SIZE, startW + dx);
        newH = Math.max(MIN_SIZE, startH + dy);
      } else if (handle === "sw") {
        newW = Math.max(MIN_SIZE, startW - dx);
        newH = Math.max(MIN_SIZE, startH + dy);
        newX = startLeft + startW - newW;
      } else if (handle === "ne") {
        newW = Math.max(MIN_SIZE, startW + dx);
        newH = Math.max(MIN_SIZE, startH - dy);
        newY = startTop + startH - newH;
      } else if (handle === "nw") {
        newW = Math.max(MIN_SIZE, startW - dx);
        newH = Math.max(MIN_SIZE, startH - dy);
        newX = startLeft + startW - newW;
        newY = startTop + startH - newH;
      }

      updateSticker(sticker.id, { width: newW, height: newH, x: newX, y: newY });
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function rotate() {
    updateSticker(sticker.id, { rotation: (sticker.rotation + 15) % 360 });
  }

  const showControls = hovered || selected;

  return (
    <div
      className="absolute select-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        width: sticker.width,
        height: sticker.height,
        transform: `rotate(${sticker.rotation}deg)`,
        cursor: "grab",
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setSelected(true); }}
    >
      {/* Sticker image */}
      <img
        src={sticker.stickerUrl}
        alt="sticker"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Selection border */}
      {showControls && (
        <div className="absolute inset-0 border-2 border-dashed border-purple-400/60 rounded-lg pointer-events-none" />
      )}

      {/* Action buttons */}
      {showControls && (
        <>
          {/* Delete */}
          <button
            data-handle="delete"
            onMouseDown={(e) => { e.stopPropagation(); removeSticker(sticker.id); }}
            className="absolute -top-3 -left-3 bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors z-20"
          >
            <X size={10} className="text-white pointer-events-none" />
          </button>

          {/* Rotate */}
          <button
            data-handle="rotate"
            onMouseDown={(e) => { e.stopPropagation(); rotate(); }}
            className="absolute -top-3 -right-3 bg-purple-500 hover:bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors z-20"
          >
            <RotateCw size={10} className="text-white pointer-events-none" />
          </button>

          {/* Resize handles — 4 corners */}
          {(["nw", "ne", "sw", "se"] as ResizeHandle[]).map((handle) => (
            <div
              key={handle}
              data-handle={handle}
              onMouseDown={(e) => onResizeMouseDown(e, handle)}
              className="absolute w-3 h-3 bg-white border-2 border-purple-400 rounded-sm z-20 hover:bg-purple-200 transition-colors"
              style={{
                cursor: `${handle}-resize`,
                top: handle.startsWith("n") ? -6 : undefined,
                bottom: handle.startsWith("s") ? -6 : undefined,
                left: handle.endsWith("w") ? -6 : undefined,
                right: handle.endsWith("e") ? -6 : undefined,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
