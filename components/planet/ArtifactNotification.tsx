"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanetStore, Artifact } from "@/store/planet-store";

export default function ArtifactNotification() {
  const { artifacts } = usePlanetStore();
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState<Artifact | null>(null);

  useEffect(() => {
    const newArtifact = artifacts.find((a) => !shown.includes(a.id));
    if (newArtifact) {
      setCurrent(newArtifact);
      setShown((s) => [...s, newArtifact.id]);
      setTimeout(() => setCurrent(null), 4000);
    }
  }, [artifacts]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500/40 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4"
        >
          <div className="text-4xl">{current.emoji}</div>
          <div>
            <p className="text-yellow-300 text-xs font-medium uppercase tracking-wider">Artifact Unlocked!</p>
            <p className="text-white font-bold">{current.name}</p>
            <p className="text-white/50 text-xs">{current.description}</p>
          </div>
          <div className="text-2xl">🪐</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
