"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Plus, Trash2 } from "lucide-react";

const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

interface PlotLine {
  id: string;
  expr: string;
  color: string;
}

function evalFn(expr: string, x: number): number | null {
  try {
    const safe = expr
      .replace(/\^/g, "**")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/abs/g, "Math.abs")
      .replace(/log/g, "Math.log10")
      .replace(/ln/g, "Math.log")
      .replace(/pi/g, "Math.PI")
      .replace(/e(?![a-zA-Z])/g, "Math.E");
    // eslint-disable-next-line no-new-func
    const y = new Function("x", `return ${safe}`)(x);
    return isFinite(y) ? y : null;
  } catch {
    return null;
  }
}

export default function GraphVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<PlotLine[]>([{ id: "1", expr: "x^2", color: COLORS[0] }]);
  const [newExpr, setNewExpr] = useState("");
  const [xRange, setXRange] = useState([-10, 10]);

  useEffect(() => { draw(); }, [lines, xRange]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const [xMin, xMax] = xRange;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    const toCanvas = (x: number, y: number) => ({
      cx: ((x - xMin) / (xMax - xMin)) * W,
      cy: H / 2 - (y / ((xMax - xMin) / 2)) * (H / 2),
    });

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(xMin); gx <= xMax; gx++) {
      const { cx } = toCanvas(gx, 0);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    }
    for (let gy = -10; gy <= 10; gy++) {
      const { cy } = toCanvas(0, gy);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    const { cx: ox } = toCanvas(0, 0);
    const { cy: oy } = toCanvas(0, 0);
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();

    // Axis labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    for (let gx = Math.ceil(xMin); gx <= xMax; gx += 2) {
      if (gx === 0) continue;
      const { cx } = toCanvas(gx, 0);
      ctx.fillText(String(gx), cx - 6, oy + 14);
    }

    // Plot lines
    lines.forEach((line) => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      const steps = W * 2;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const y = evalFn(line.expr, x);
        if (y === null) { started = false; continue; }
        const { cx, cy } = toCanvas(x, y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    });
  }

  function addLine() {
    if (!newExpr.trim()) return;
    setLines((l) => [...l, { id: Date.now().toString(), expr: newExpr, color: COLORS[l.length % COLORS.length] }]);
    setNewExpr("");
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={420} height={280}
        className="w-full rounded-2xl border border-white/10" />

      {/* Lines */}
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={line.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: line.color }} />
            <span className="text-white/70 text-sm font-mono flex-1">y = {line.expr}</span>
            <button onClick={() => setLines((l) => l.filter((x) => x.id !== line.id))}
              className="text-white/20 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add line */}
      <div className="flex gap-2">
        <input value={newExpr} onChange={(e) => setNewExpr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLine()}
          placeholder="e.g. sin(x), x^3 - 2x"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
        <button onClick={addLine}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-all">
          <Plus size={16} />
        </button>
      </div>

      {/* Zoom */}
      <div className="flex gap-2">
        {[[-5,5],[-10,10],[-20,20]].map(([a,b]) => (
          <button key={a} onClick={() => setXRange([a, b])}
            className={`flex-1 py-1.5 rounded-xl text-xs transition-all ${
              xRange[0] === a ? "bg-purple-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}>
            [{a}, {b}]
          </button>
        ))}
      </div>

      <p className="text-white/20 text-xs">Supports: sin, cos, tan, sqrt, abs, log, ln, pi, e, ^ for power</p>
    </div>
  );
}
