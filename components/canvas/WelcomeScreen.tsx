"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/canvas-store";
import { DEFAULT_CANVAS_TEMPLATES } from "@/lib/default-canvas";
import { ArrowRight, Sparkles } from "lucide-react";
import StarBackground from "@/components/ui/StarBackground";

interface Props {
  username: string;
  onDone: () => void;
}

export default function WelcomeScreen({ username, onDone }: Props) {
  const [step, setStep] = useState<"welcome" | "pick">("welcome");
  const [selected, setSelected] = useState("cosmic");
  const { loadTheme } = useCanvasStore();

  function applyAndContinue() {
    const template = DEFAULT_CANVAS_TEMPLATES.find((t) => t.id === selected);
    if (template) loadTheme(template.theme);
    localStorage.setItem("life-os-canvas-setup", "done");
    onDone();
  }

  function skipSetup() {
    localStorage.setItem("life-os-canvas-setup", "done");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#0f0f1a] flex items-center justify-center">
      {/* Stars bg */}
      <StarBackground count={60} />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="relative z-10 text-center max-w-lg px-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-7xl mb-6 inline-block">🪐</motion.div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{username}</span>!
            </h1>
            <p className="text-white/50 text-lg mb-10 leading-relaxed">
              Your personal creative universe is ready.<br />
              Let's set up your canvas space.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep("pick")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3.5 rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-lg">
                <Sparkles size={18} /> Set Up My Canvas
              </button>
              <button onClick={skipSetup}
                className="bg-white/10 border border-white/20 text-white/60 hover:text-white px-6 py-3.5 rounded-2xl font-medium hover:bg-white/20 transition-all text-lg">
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {step === "pick" && (
          <motion.div key="pick"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="relative z-10 w-full max-w-2xl px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Pick your vibe 🎨</h2>
              <p className="text-white/40">Choose a starting canvas — you can change it anytime</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {DEFAULT_CANVAS_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                    selected === t.id
                      ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                  <div className="text-3xl mb-3">{t.emoji}</div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-white/40 text-sm mt-1">{t.desc}</p>
                  {selected === t.id && (
                    <div className="mt-2 flex items-center gap-1 text-purple-400 text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep("welcome")}
                className="bg-white/10 border border-white/10 text-white/50 hover:text-white px-5 py-3 rounded-xl transition-all">
                ← Back
              </button>
              <button onClick={applyAndContinue}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 flex-1 justify-center">
                Launch My Canvas <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
