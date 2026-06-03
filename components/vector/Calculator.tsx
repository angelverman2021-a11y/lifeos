"use client";
import { useState } from "react";
import { Delete } from "lucide-react";

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [expr, setExpr] = useState("");

  function handleBtn(val: string) {
    if (val === "C") { setDisplay("0"); setExpr(""); return; }
    if (val === "⌫") {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
      setExpr((e) => e.slice(0, -1));
      return;
    }
    if (val === "±") { setDisplay((d) => String(-parseFloat(d))); return; }
    if (val === "=") {
      try {
        const raw = expr
          .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
        // eslint-disable-next-line no-eval
        const result = String(eval(raw));
        setHistory((h) => [`${expr} = ${result}`, ...h.slice(0, 9)]);
        setDisplay(result);
        setExpr(result);
      } catch {
        setDisplay("Error");
        setExpr("");
      }
      return;
    }
    if (val === "%") {
      try {
        const result = String(parseFloat(display) / 100);
        setDisplay(result);
        setExpr(result);
      } catch { /* ignore */ }
      return;
    }
    const newExpr = expr === "0" || display === "0" && !"0123456789.".includes(val)
      ? val : expr + val;
    setExpr(newExpr);
    setDisplay(val);
  }

  const isOp = (v: string) => ["÷", "×", "−", "+"].includes(v);
  const isSpecial = (v: string) => ["C", "="].includes(v);

  return (
    <div className="space-y-4">
      {/* Display */}
      <div className="bg-black/30 rounded-2xl p-4 text-right">
        <p className="text-white/30 text-sm h-5 truncate">{expr || " "}</p>
        <p className="text-white text-4xl font-light truncate">{display}</p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.flat().map((btn, i) => (
          <button key={i} onClick={() => handleBtn(btn)}
            className={`h-14 rounded-2xl text-lg font-medium transition-all active:scale-95 ${
              isSpecial(btn) ? "bg-purple-600 hover:bg-purple-500 text-white" :
              isOp(btn) ? "bg-orange-500/80 hover:bg-orange-500 text-white" :
              btn === "0" ? "col-span-1 bg-white/10 hover:bg-white/20 text-white" :
              "bg-white/10 hover:bg-white/20 text-white"
            }`}>
            {btn === "⌫" ? <Delete size={18} className="mx-auto" /> : btn}
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-black/20 rounded-2xl p-3 space-y-1">
          <p className="text-white/30 text-xs mb-2">History</p>
          {history.map((h, i) => (
            <p key={i} className="text-white/50 text-sm font-mono">{h}</p>
          ))}
        </div>
      )}
    </div>
  );
}
