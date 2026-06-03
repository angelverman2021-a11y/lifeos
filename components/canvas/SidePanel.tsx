"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/canvas-store";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

const AINotes = dynamic(() => import("@/components/study/AINotes"), { ssr: false });
const BrainDump = dynamic(() => import("@/components/study/BrainDump"), { ssr: false });
const Flashcards = dynamic(() => import("@/components/study/Flashcards"), { ssr: false });
const QuizMode = dynamic(() => import("@/components/study/QuizMode"), { ssr: false });
const MindMap = dynamic(() => import("@/components/study/MindMap"), { ssr: false });
const JobTracker = dynamic(() => import("@/components/job/JobTracker"), { ssr: false });
const ResumeBuilder = dynamic(() => import("@/components/job/ResumeBuilder"), { ssr: false });
const InterviewPrep = dynamic(() => import("@/components/job/InterviewPrep"), { ssr: false });
const SkillGap = dynamic(() => import("@/components/job/SkillGap"), { ssr: false });
const ColdEmail = dynamic(() => import("@/components/job/ColdEmail"), { ssr: false });
const MemoryJournal = dynamic(() => import("@/components/journal/MemoryJournal"), { ssr: false });
const LifeTimeline = dynamic(() => import("@/components/journal/LifeTimeline"), { ssr: false });
const GratitudeJournal = dynamic(() => import("@/components/journal/GratitudeJournal"), { ssr: false });
const Calculator = dynamic(() => import("@/components/vector/Calculator"), { ssr: false });
const EquationSolver = dynamic(() => import("@/components/vector/EquationSolver"), { ssr: false });
const GraphVisualizer = dynamic(() => import("@/components/vector/GraphVisualizer"), { ssr: false });
const PracticeMode = dynamic(() => import("@/components/vector/PracticeMode"), { ssr: false });
const IdeaValidator = dynamic(() => import("@/components/founder/IdeaValidator"), { ssr: false });
const PitchBuilder = dynamic(() => import("@/components/founder/PitchBuilder"), { ssr: false });
const Roadmap = dynamic(() => import("@/components/founder/Roadmap"), { ssr: false });
const WeeklyGoals = dynamic(() => import("@/components/founder/WeeklyGoals"), { ssr: false });
const KanbanBoard = dynamic(() => import("@/components/builder/KanbanBoard"), { ssr: false });

const PANEL_TABS: Record<string, { label: string; emoji: string }[]> = {
  study: [
    { label: "AI Notes", emoji: "📝" },
    { label: "Brain Dump", emoji: "🧠" },
    { label: "Flashcards", emoji: "🃏" },
    { label: "Quiz", emoji: "🏆" },
    { label: "Mind Map", emoji: "🗺️" },
  ],
  job: [
    { label: "Job Tracker", emoji: "💼" },
    { label: "Resume", emoji: "📄" },
    { label: "Interview", emoji: "🎤" },
    { label: "Skill Gap", emoji: "🎯" },
    { label: "Cold Email", emoji: "✉️" },
  ],
  journal: [
    { label: "Memories", emoji: "📸" },
    { label: "Timeline", emoji: "🗓️" },
    { label: "Gratitude", emoji: "🙏" },
  ],
  vector: [
    { label: "Calculator", emoji: "🖩" },
    { label: "Solver", emoji: "∑" },
    { label: "Graph", emoji: "📈" },
    { label: "Practice", emoji: "🎯" },
  ],
  founder: [
    { label: "Validate", emoji: "📊" },
    { label: "Pitch", emoji: "🎯" },
    { label: "Roadmap", emoji: "🗺️" },
    { label: "Goals", emoji: "✅" },
  ],
  builder: [
    { label: "Kanban", emoji: "🛠️" },
  ],
};

const PANEL_TITLES: Record<string, string> = {
  study: "📚 Study Mode",
  job: "💼 Job Mode",
  journal: "📖 Memory Journal",
  vector: "📐 Vector Mode",
  founder: "🚀 Founder Mode",
  builder: "🛠️ Builder Mode",
};

export default function SidePanel() {
  const { activePanel, setActivePanel } = useCanvasStore();
  const [activeTab, setActiveTab] = useState(0);
  const isOpen = activePanel !== "none";
  const tabs = PANEL_TABS[activePanel] || [];

  useEffect(() => {
    setActiveTab(0);
  }, [activePanel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px]"
            onClick={() => setActivePanel("none")}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-[480px] bg-[#0f0f1a]/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
              <h2 className="text-white font-bold">{PANEL_TITLES[activePanel]}</h2>
              <button onClick={() => setActivePanel("none")}
                className="text-white/30 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            {tabs.length > 1 && (
              <div className="flex border-b border-white/5 px-2 overflow-x-auto flex-shrink-0">
                {tabs.map((tab, i) => (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                      activeTab === i
                        ? "border-purple-500 text-white"
                        : "border-transparent text-white/40 hover:text-white/70"
                    }`}>
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activePanel === "study" && (
                <>
                  {activeTab === 0 && <AINotes />}
                  {activeTab === 1 && <BrainDump />}
                  {activeTab === 2 && <Flashcards />}
                  {activeTab === 3 && <QuizMode />}
                  {activeTab === 4 && <MindMap />}
                </>
              )}
              {activePanel === "job" && (
                <>
                  {activeTab === 0 && <JobTracker />}
                  {activeTab === 1 && <ResumeBuilder />}
                  {activeTab === 2 && <InterviewPrep />}
                  {activeTab === 3 && <SkillGap />}
                  {activeTab === 4 && <ColdEmail />}
                </>
              )}
              {activePanel === "journal" && (
                <>
                  {activeTab === 0 && <MemoryJournal />}
                  {activeTab === 1 && <LifeTimeline />}
                  {activeTab === 2 && <GratitudeJournal />}
                </>
              )}
              {activePanel === "vector" && (
                <>
                  {activeTab === 0 && <Calculator />}
                  {activeTab === 1 && <EquationSolver />}
                  {activeTab === 2 && <GraphVisualizer />}
                  {activeTab === 3 && <PracticeMode />}
                </>
              )}
              {activePanel === "founder" && (
                <>
                  {activeTab === 0 && <IdeaValidator />}
                  {activeTab === 1 && <PitchBuilder />}
                  {activeTab === 2 && <Roadmap />}
                  {activeTab === 3 && <WeeklyGoals />}
                </>
              )}
              {activePanel === "builder" && (
                <>
                  {activeTab === 0 && <KanbanBoard />}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
