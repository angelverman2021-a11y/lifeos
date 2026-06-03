"use client";
import { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { Widget, NotePage } from "@/types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { v4 as uuidv4 } from "uuid";
import {
  Bold, Italic, UnderlineIcon, Highlighter,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Plus, Trash2,
  Pencil, Type, Download
} from "lucide-react";

const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];
const TEXT_COLORS = ["#ffffff", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function createPage(title = "New Note"): NotePage {
  return { id: uuidv4(), title, content: "", createdAt: new Date().toISOString() };
}

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={title}
      className={`p-1 rounded-md transition-all ${active ? "bg-purple-500/40 text-purple-300" : "text-white/40 hover:text-white hover:bg-white/10"}`}>
      {children}
    </button>
  );
}

export default function NotesWidget({ widget }: { widget: Widget }) {
  const { updateWidget } = useCanvasStore();

  // ALL hooks must be declared before any conditional return
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"write" | "draw">("write");
  const [showColors, setShowColors] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [drawColor, setDrawColor] = useState("#a855f7");
  const [drawSize, setDrawSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Compute pages — safe for SSR (no uuidv4/Date during render)
  const existingPages = widget.pages?.length ? widget.pages : null;
  const activePageId = widget.activePageId || existingPages?.[0]?.id || "";
  const activePage = existingPages?.find((p) => p.id === activePageId) || existingPages?.[0];

  // Tiptap — always called, content may be empty initially
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: activePage?.content || "",
    onUpdate: ({ editor }) => {
      if (!activePage) return;
      const updated = (widget.pages || []).map((p) =>
        p.id === activePageId ? { ...p, content: editor.getHTML() } : p
      );
      updateWidget(widget.id, { pages: updated });
    },
    editorProps: {
      attributes: {
        class: "outline-none text-white/80 text-sm leading-relaxed min-h-full prose prose-invert max-w-none",
      },
    },
  });

  // Mount effect — create default page if none exists
  useEffect(() => {
    setMounted(true);
    if (!widget.pages?.length) {
      const newPage = createPage("My Note");
      updateWidget(widget.id, { pages: [newPage], activePageId: newPage.id });
    }
  }, []);

  // Sync editor when switching pages
  useEffect(() => {
    if (editor && activePage && activePage.content !== editor.getHTML()) {
      editor.commands.setContent(activePage.content || "");
    }
  }, [activePageId]);

  // NOW safe to return early after all hooks
  if (!mounted || !activePage) return <div className="h-full bg-transparent" />;

  const pages = widget.pages!;

  function savePages(updated: NotePage[], newActiveId?: string) {
    updateWidget(widget.id, { pages: updated, activePageId: newActiveId ?? activePageId });
  }

  function addPage() {
    const newPage = createPage(`Note ${pages.length + 1}`);
    savePages([...pages, newPage], newPage.id);
  }

  function deletePage(id: string) {
    if (pages.length === 1) return;
    const updated = pages.filter((p) => p.id !== id);
    savePages(updated, updated[0].id);
  }

  function renamePage(id: string, title: string) {
    savePages(pages.map((p) => p.id === id ? { ...p, title } : p));
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current || !canvasRef.current || !lastPos.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = { x, y };
  }

  function stopDraw() { drawing.current = false; lastPos.current = null; }

  function clearCanvas() {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d")!.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  function exportNote() {
    const content = `# ${activePage?.title || "Note"}\n\n${editor?.getText() || ""}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activePage?.title || "note"}.txt`;
    a.click();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>

      {/* Pages tabs */}
      <div className="flex items-center gap-1 px-2 pt-1 overflow-x-auto border-b border-white/5 flex-shrink-0">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => savePages(pages, page.id)}
              className={`px-2.5 py-1 rounded-t-lg text-xs transition-all max-w-[80px] truncate ${
                page.id === activePageId ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
              }`}>
              {page.title}
            </button>
            {pages.length > 1 && page.id === activePageId && (
              <button onClick={() => deletePage(page.id)} className="text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={9} />
              </button>
            )}
          </div>
        ))}
        <button onClick={addPage} className="text-white/20 hover:text-purple-400 transition-colors flex-shrink-0 ml-1">
          <Plus size={12} />
        </button>
      </div>

      {/* Page title */}
      <input value={activePage?.title || ""} onChange={(e) => renamePage(activePageId, e.target.value)}
        className="bg-transparent text-white/70 text-xs font-medium px-3 py-1.5 focus:outline-none border-b border-white/5 flex-shrink-0"
        placeholder="Note title..." />

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/5 flex-shrink-0 flex-wrap">
        <div className="flex bg-white/5 rounded-lg p-0.5 mr-1">
          <button onClick={() => setMode("write")}
            className={`p-1 rounded-md transition-all ${mode === "write" ? "bg-purple-500/40 text-purple-300" : "text-white/30 hover:text-white"}`}>
            <Type size={11} />
          </button>
          <button onClick={() => setMode("draw")}
            className={`p-1 rounded-md transition-all ${mode === "draw" ? "bg-purple-500/40 text-purple-300" : "text-white/30 hover:text-white"}`}>
            <Pencil size={11} />
          </button>
        </div>

        {mode === "write" && editor && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={11} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={11} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon size={11} /></ToolBtn>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <div className="relative">
              <ToolBtn onClick={() => setShowHighlights(!showHighlights)} active={showHighlights} title="Highlight"><Highlighter size={11} /></ToolBtn>
              {showHighlights && (
                <div className="absolute top-7 left-0 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 flex gap-1.5 shadow-xl">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button key={c} onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlights(false); }}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-125 transition-transform" style={{ background: c }} />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <ToolBtn onClick={() => setShowColors(!showColors)} title="Text Color">
                <div className="w-3 h-3 rounded-full border border-white/30" style={{ background: "#a855f7" }} />
              </ToolBtn>
              {showColors && (
                <div className="absolute top-7 left-0 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 flex gap-1.5 shadow-xl">
                  {TEXT_COLORS.map((c) => (
                    <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-125 transition-transform" style={{ background: c }} />
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left"><AlignLeft size={11} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center"><AlignCenter size={11} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right"><AlignRight size={11} /></ToolBtn>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List size={11} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List"><ListOrdered size={11} /></ToolBtn>
          </>
        )}

        {mode === "draw" && (
          <>
            {["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ffffff"].map((c) => (
              <button key={c} onClick={() => setDrawColor(c)}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${drawColor === c ? "border-white" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            {[2, 4, 8].map((s) => (
              <button key={s} onClick={() => setDrawSize(s)}
                className={`flex items-center justify-center w-5 h-5 rounded-md transition-all ${drawSize === s ? "bg-purple-500/40" : "hover:bg-white/10"}`}>
                <div className="rounded-full bg-white" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
            <button onClick={clearCanvas} className="text-white/30 hover:text-red-400 transition-colors ml-1 text-xs">Clear</button>
          </>
        )}

        <button onClick={exportNote} className="ml-auto text-white/20 hover:text-white/60 transition-colors" title="Export note">
          <Download size={11} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {mode === "write" ? (
          <div className="h-full overflow-y-auto px-3 py-2">
            <EditorContent editor={editor} className="h-full" />
          </div>
        ) : (
          <canvas ref={canvasRef} width={widget.width - 4} height={widget.height - 120}
            className="w-full h-full cursor-crosshair" style={{ background: "transparent" }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
        )}
      </div>
    </div>
  );
}
