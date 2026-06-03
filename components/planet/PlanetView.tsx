"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanetStore } from "@/store/planet-store";
import { X, Edit2, Check } from "lucide-react";

const STAGE_CONFIG = [
  { stage: 1, name: "Barren Rock", emoji: "🌑", bg: "from-gray-900 to-gray-800", desc: "Just born", minActions: 0 },
  { stage: 2, name: "First Spark", emoji: "🌒", bg: "from-gray-800 to-purple-900", desc: "Life is stirring", minActions: 20 },
  { stage: 3, name: "Living World", emoji: "🌍", bg: "from-purple-900 to-blue-900", desc: "Thriving!", minActions: 75 },
  { stage: 4, name: "Thriving City", emoji: "🌟", bg: "from-blue-900 to-cyan-900", desc: "Legendary", minActions: 200 },
  { stage: 5, name: "Legendary Universe", emoji: "🌌", bg: "from-cyan-900 to-purple-900", desc: "Maximum power!", minActions: 500 },
];

const ENERGY_BARS = [
  { key: "mindEnergy", label: "Mind", emoji: "🧠", color: "bg-purple-500" },
  { key: "hustleEnergy", label: "Hustle", emoji: "💼", color: "bg-blue-500" },
  { key: "creativeEnergy", label: "Creative", emoji: "🎨", color: "bg-pink-500" },
  { key: "memoryEnergy", label: "Memory", emoji: "💫", color: "bg-yellow-500" },
];

interface Props {
  onClose: () => void;
}

export default function PlanetView({ onClose }: Props) {
  const planet = usePlanetStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(planet.name);
  const [newArtifact, setNewArtifact] = useState<string | null>(null);

  useEffect(() => {
    planet.loadFromStorage();
  }, []);

  const stageConfig = STAGE_CONFIG[planet.stage - 1] || STAGE_CONFIG[0];
  const nextStage = STAGE_CONFIG[planet.stage] || null;
  const progressToNext = nextStage
    ? Math.min(100, ((planet.totalActions - stageConfig.minActions) / (nextStage.minActions - stageConfig.minActions)) * 100)
    : 100;

  const maxEnergy = Math.max(planet.mindEnergy, planet.hustleEnergy, planet.creativeEnergy, planet.memoryEnergy, 1);

  function saveName() {
    if (nameInput.trim()) planet.setPlanetName(nameInput.trim());
    setEditingName(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md mx-4 bg-[#0f0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Planet header */}
        <div className={`bg-gradient-to-br ${stageConfig.bg} p-8 text-center relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>

          {/* Planet emoji with animation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-3 inline-block"
          >
            {stageConfig.emoji}
          </motion.div>

          {/* Planet name */}
          <div className="flex items-center justify-center gap-2 mb-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-lg font-bold text-center focus:outline-none w-40"
                  autoFocus />
                <button onClick={saveName} className="text-green-400 hover:text-green-300">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-white font-bold text-xl">{planet.name}</h2>
                <button onClick={() => setEditingName(true)} className="text-white/30 hover:text-white transition-colors">
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>

          <p className="text-white/60 text-sm">{stageConfig.name} · Stage {planet.stage}</p>
          <p className="text-white/40 text-xs mt-1">{stageConfig.desc}</p>

          {/* Stage progress */}
          {nextStage && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Stage {planet.stage}</span>
                <span>{planet.totalActions} / {nextStage.minActions} actions</span>
                <span>Stage {planet.stage + 1}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Streak */}
          <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-white font-semibold">{planet.streakDays} day streak</p>
              <p className="text-white/40 text-xs">{planet.totalActions} total actions</p>
            </div>
          </div>

          {/* Energy bars */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Planet Energy</p>
            <div className="space-y-2.5">
              {ENERGY_BARS.map((bar) => {
                const value = planet[bar.key as keyof typeof planet] as number;
                const pct = Math.min(100, (value / maxEnergy) * 100);
                return (
                  <div key={bar.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60 text-xs flex items-center gap-1">{bar.emoji} {bar.label}</span>
                      <span className="text-white/40 text-xs">{value}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full ${bar.color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Artifacts */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Artifacts ({planet.artifacts.length})
            </p>
            {planet.artifacts.length === 0 ? (
              <p className="text-white/20 text-xs">Complete actions to unlock artifacts...</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {planet.artifacts.map((artifact) => (
                  <div key={artifact.id} title={`${artifact.name}: ${artifact.description}`}
                    className="bg-white/5 border border-white/10 rounded-xl p-2 text-center hover:border-purple-500/40 transition-all cursor-default">
                    <div className="text-2xl mb-1">{artifact.emoji}</div>
                    <p className="text-white/40 text-xs truncate">{artifact.name}</p>
                  </div>
                ))}
                {/* Locked slots */}
                {Array.from({ length: Math.max(0, 8 - planet.artifacts.length) }).map((_, i) => (
                  <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-2 text-center">
                    <div className="text-2xl mb-1 opacity-20">🔒</div>
                    <p className="text-white/10 text-xs">Locked</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next stage hint */}
          {nextStage && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-white/40 text-xs">Next: <span className="text-white/70">{nextStage.emoji} {nextStage.name}</span></p>
              <p className="text-white/20 text-xs mt-0.5">Need {nextStage.minActions - planet.totalActions} more actions</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
