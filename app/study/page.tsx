"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { localGetUser } from "@/lib/local-auth";
import AINotes from "@/components/study/AINotes";
import BrainDump from "@/components/study/BrainDump";
import Flashcards from "@/components/study/Flashcards";
import QuizMode from "@/components/study/QuizMode";
import MindMap from "@/components/study/MindMap";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { id: "notes", label: "AI Notes", emoji: "📝" },
  { id: "braindump", label: "Brain Dump", emoji: "🧠" },
  { id: "flashcards", label: "Flashcards", emoji: "🃏" },
  { id: "quiz", label: "Quiz", emoji: "🏆" },
  { id: "mindmap", label: "Mind Map", emoji: "🗺️" },
];

export default function StudyPage() {
  const [tab, setTab] = useState("notes");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const user = localGetUser();
    if (!user) router.push("/auth");
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#0f0f1a]" />;

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <button className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-white font-bold flex items-center gap-2">📚 Study Mode</h1>
            <p className="text-white/30 text-xs">AI-powered learning tools</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                tab === t.id
                  ? "border-purple-500 text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "notes" && <AINotes />}
          {tab === "braindump" && <BrainDump />}
          {tab === "flashcards" && <Flashcards />}
          {tab === "quiz" && <QuizMode />}
          {tab === "mindmap" && <MindMap />}
        </motion.div>
      </div>
    </div>
  );
}
