"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import StarBackground from "@/components/ui/StarBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      <StarBackground count={80} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-7xl mb-6 inline-block"
        >
          🪐
        </motion.div>

        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Your Personal<br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Creative Universe
          </span>
        </h1>

        <p className="text-white/50 text-lg mb-10 leading-relaxed">
          Study, plan, create & remember — all in one place.<br />
          Build your own UI. Grow your planet. Live your OS.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3.5 rounded-2xl font-medium hover:opacity-90 transition-opacity text-lg">
              Start Your Journey 🚀
            </button>
          </Link>
          <Link href="/canvas">
            <button className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-white/20 transition-all text-lg">
              Try Canvas
            </button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-10">
          {["🎨 Custom Canvas", "🎭 Sticker Bundles", "📝 AI Notes", "⏱️ Focus Timer", "📊 Task Tracker", "🪐 Planet System"].map((f) => (
            <span key={f} className="bg-white/5 border border-white/10 text-white/50 text-sm px-3 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
