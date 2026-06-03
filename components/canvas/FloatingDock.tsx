"use client";
import { useCanvasStore } from "@/store/canvas-store";
import { usePlanetStore } from "@/store/planet-store";
import { localGetUser, localSignOut } from "@/lib/local-auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePlanetEnergy } from "@/lib/use-planet-energy";

const PlanetView = dynamic(() => import("@/components/planet/PlanetView"), { ssr: false });

const MODES = [
  { id: "study", emoji: "📚", label: "Study" },
  { id: "job", emoji: "💼", label: "Job" },
  { id: "journal", emoji: "📖", label: "Journal" },
  { id: "vector", emoji: "📐", label: "Vector" },
  { id: "founder", emoji: "🚀", label: "Founder" },
  { id: "builder", emoji: "🛠️", label: "Builder" },
] as const;

const STAGE_EMOJIS = ["🌑", "🌒", "🌍", "🌟", "🌌"];

export default function FloatingDock() {
  const { activePanel, setActivePanel } = useCanvasStore();
  const { stage, streakDays, totalActions, loadFromStorage } = usePlanetStore();
  const { dailyLogin } = usePlanetEnergy();
  const [showUser, setShowUser] = useState(false);
  const [showPlanet, setShowPlanet] = useState(false);
  const router = useRouter();
  const user = localGetUser();
  const username = user?.username || user?.email?.split("@")[0] || "Explorer";

  useEffect(() => {
    loadFromStorage();
    // Daily login energy
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem("life-os-last-login");
    if (lastLogin !== today) {
      dailyLogin();
      localStorage.setItem("life-os-last-login", today);
    }
  }, []);

  function signOut() {
    localSignOut();
    router.push("/auth");
  }

  return (
    <>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-2">
        {/* Planet button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPlanet(true)}
          className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-purple-500/30 mb-2 relative"
          title="Your Planet"
        >
          {STAGE_EMOJIS[stage - 1] || "🌑"}
          {streakDays >= 1 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-xs">
              🔥
            </div>
          )}
        </motion.button>

        {/* Mode buttons */}
        {MODES.map((mode) => (
          <motion.button key={mode.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActivePanel(activePanel === mode.id ? "none" : mode.id)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all shadow-lg ${
              activePanel === mode.id
                ? "bg-purple-600 shadow-purple-500/30"
                : "bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10"
            }`}
            title={mode.label}>
            {mode.emoji}
          </motion.button>
        ))}

        <div className="w-6 h-px bg-white/10 mx-auto my-1" />

        {/* User button */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.05 }}
            onClick={() => setShowUser(!showUser)}
            className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
            title={username}>
            <User size={16} className="text-white/60" />
          </motion.button>

          <AnimatePresence>
            {showUser && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="absolute left-12 top-0 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 w-52 shadow-2xl z-10">
                <p className="text-white font-medium text-sm truncate">{username}</p>
                <p className="text-white/30 text-xs truncate mb-2">{user?.email}</p>
                {/* Planet mini stats */}
                <div className="bg-white/5 rounded-xl p-2 mb-3 flex items-center gap-2">
                  <span className="text-lg">{STAGE_EMOJIS[stage - 1]}</span>
                  <div>
                    <p className="text-white/60 text-xs">Stage {stage} · {totalActions} actions</p>
                    <p className="text-orange-400 text-xs">🔥 {streakDays} day streak</p>
                  </div>
                </div>
                <button onClick={signOut}
                  className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors bg-red-500/10 hover:bg-red-500/20 rounded-xl px-3 py-2">
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Planet view modal */}
      <AnimatePresence>
        {showPlanet && <PlanetView onClose={() => setShowPlanet(false)} />}
      </AnimatePresence>
    </>
  );
}
