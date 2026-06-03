"use client";
import { useMemo } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function StarBackground({ count = 60 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        width: seededRandom(i * 3) * 2 + 1,
        height: seededRandom(i * 3 + 1) * 2 + 1,
        opacity: seededRandom(i * 3 + 2) * 0.35 + 0.05,
        top: seededRandom(i * 7) * 100,
        left: seededRandom(i * 7 + 1) * 100,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: s.width + "px",
            height: s.height + "px",
            opacity: s.opacity,
            top: s.top + "%",
            left: s.left + "%",
          }}
        />
      ))}
    </div>
  );
}
