"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const MODES = [
  { label: "Focus", seconds: 25 * 60 },
  { label: "Short Break", seconds: 5 * 60 },
  { label: "Long Break", seconds: 15 * 60 },
];

export default function TimerWidget(_: { widget: import("@/types").Widget }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].seconds);
  const [running, setRunning] = useState(false);
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(MODES[modeIdx].seconds);
    setRunning(false);
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [running]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const progress = 1 - timeLeft / MODES[modeIdx].seconds;
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-3 pb-3">
      {/* Mode tabs */}
      <div className="flex gap-1 w-full">
        {MODES.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setModeIdx(i)}
            className={`flex-1 py-1 rounded-lg text-xs transition-all ${
              modeIdx === i ? "bg-purple-600 text-white" : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="relative flex items-center justify-center">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="#a855f7" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute text-white font-bold text-lg">{mins}:{secs}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!running)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-1.5 flex items-center gap-1.5 text-sm transition-colors"
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setRunning(false); setTimeLeft(MODES[modeIdx].seconds); }}
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
