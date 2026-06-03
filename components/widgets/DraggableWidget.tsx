"use client";
import { useRef, useState } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { Widget } from "@/types";
import { X, GripVertical } from "lucide-react";
import NotesWidget from "./NotesWidget";
import TimerWidget from "./TimerWidget";
import TrackerWidget from "./TrackerWidget";
import IconPicker from "@/components/canvas/IconPicker";

const MIN_W = 200;
const MIN_H = 150;

export default function DraggableWidget({ widget }: { widget: Widget }) {
  const { updateWidget, removeWidget, setSelectedWidget, selectedWidgetId } = useCanvasStore();
  const dragStart = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);
  const resizeStart = useRef<{ mx: number; my: number; ww: number; wh: number } | null>(null);
  const isSelected = selectedWidgetId === widget.id;
  const [hovered, setHovered] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Drag to move
  function onDragMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedWidget(widget.id);
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: widget.x, wy: widget.y };
    function onMove(ev: MouseEvent) {
      if (!dragStart.current) return;
      updateWidget(widget.id, {
        x: dragStart.current.wx + ev.clientX - dragStart.current.mx,
        y: dragStart.current.wy + ev.clientY - dragStart.current.my,
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

  // Resize from bottom-right corner
  function onResizeMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    resizeStart.current = { mx: e.clientX, my: e.clientY, ww: widget.width, wh: widget.height };
    function onMove(ev: MouseEvent) {
      if (!resizeStart.current) return;
      updateWidget(widget.id, {
        width: Math.max(MIN_W, resizeStart.current.ww + ev.clientX - resizeStart.current.mx),
        height: Math.max(MIN_H, resizeStart.current.wh + ev.clientY - resizeStart.current.my),
      });
    }
    function onUp() {
      resizeStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className={`absolute rounded-2xl border transition-colors bg-black/30 backdrop-blur-md ${
        isSelected ? "border-purple-400/60 shadow-lg shadow-purple-500/10" : "border-white/10"
      }`}
      style={{ left: widget.x, top: widget.y, width: widget.width, height: widget.height, minWidth: MIN_W, minHeight: MIN_H }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setSelectedWidget(widget.id); }}
    >
      {/* Drag handle bar */}
      <div
        onMouseDown={onDragMouseDown}
        className="absolute top-0 left-0 right-0 h-9 cursor-grab active:cursor-grabbing flex items-center justify-between px-3 bg-white/5 rounded-t-2xl z-10 select-none"
      >
        <div className="flex items-center gap-2">
          {/* Icon — click to change */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowIconPicker(true); }}
            className="hover:scale-110 transition-transform"
            title="Change icon"
          >
            {widget.icon ? (
              <img src={widget.icon} alt="icon" className="w-5 h-5 object-contain" />
            ) : (
              <span className="text-base">
                {widget.type === "notes" ? "📝" : widget.type === "timer" ? "⏱️" : "📊"}
              </span>
            )}
          </button>
          <span className="text-white/60 text-xs font-medium">{widget.title}</span>
        </div>

        <div className="flex items-center gap-1">
          <GripVertical size={12} className="text-white/20" />
          {hovered && (
            <button
              onMouseDown={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
              className="text-white/30 hover:text-red-400 transition-colors ml-1"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Widget content */}
      <div className="pt-9 h-full overflow-hidden">
        {widget.type === "notes" && <NotesWidget widget={widget} />}
        {widget.type === "timer" && <TimerWidget widget={widget} />}
        {widget.type === "tracker" && <TrackerWidget widget={widget} />}
      </div>

      {/* Resize handle — bottom right */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-20"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "3px 3px" }}
      />

      {/* Icon picker modal */}
      {showIconPicker && (
        <IconPicker
          onSelect={(url) => { updateWidget(widget.id, { icon: url }); setShowIconPicker(false); }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
