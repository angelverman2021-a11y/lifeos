"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import StarBackground from "@/components/ui/StarBackground";
import { supabase } from "@/lib/supabase";
import { localGetUser, localSignOut, LocalUser } from "@/lib/local-auth";

const MODES = [
  { id: "canvas", emoji: "🎨", title: "Creative Canvas", desc: "Build your own UI with stickers & widgets", color: "from-purple-600 to-pink-600", href: "/canvas" },
  { id: "study", emoji: "📚", title: "Study Mode", desc: "AI notes, flashcards & focus timer", color: "from-blue-600 to-cyan-600", href: "/study" },
  { id: "job", emoji: "💼", title: "Job Mode", desc: "Track applications & prep interviews", color: "from-green-600 to-emerald-600", href: "/canvas" },
  { id: "journal", emoji: "📖", title: "Memory Journal", desc: "Photos, memories & AI storytelling", color: "from-orange-600 to-yellow-600", href: "/canvas" },
];

interface DisplayUser { email?: string; username?: string; }

export default function DashboardPage() {
  const [user, setUser] = useState<DisplayUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) router.push("/auth");
        else setUser({ email: data.user.email, username: data.user.user_metadata?.username });
      });
    } else {
      const localUser: LocalUser | null = localGetUser();
      if (!localUser) router.push("/auth");
      else setUser({ email: localUser.email, username: localUser.username });
    }
  }, [router]);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    else localSignOut();
    router.push("/auth");
  }

  if (!mounted || !user) return <div className="min-h-screen bg-[#0f0f1a]" />;

  const username = user.username || user.email?.split("@")[0] || "Explorer";

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative overflow-hidden">
      <StarBackground count={60} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white">Hey, {username} 👋</h1>
            <p className="text-white/40 mt-1">Welcome to your personal universe</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
              <p className="text-2xl">🪐</p>
              <p className="text-white/40 text-xs mt-1">Your Planet</p>
            </div>
            <button onClick={signOut} className="text-white/40 hover:text-white text-sm transition-colors">
              Sign out
            </button>
          </div>
        </div>

        {/* Planet teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-3xl p-6 mb-10 flex items-center gap-6"
        >
          <div className="text-6xl">🌑</div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">Your planet is just born</h2>
            <p className="text-white/50 text-sm mt-1">
              Start using Life OS to bring it to life. Add notes, complete tasks, build your canvas — watch your world grow. 🌱
            </p>
          </div>
          <div className="text-right">
            <p className="text-purple-300 text-sm font-medium">Stage 1</p>
            <p className="text-white/30 text-xs">Barren Rock</p>
          </div>
        </motion.div>

        {/* Mode cards */}
        <p className="text-white/40 text-sm mb-4 uppercase tracking-wider">Choose your mode</p>
        <div className="grid grid-cols-2 gap-4">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={mode.href}>
                <div className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02]">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-2xl mb-4`}>
                    {mode.emoji}
                  </div>
                  <h3 className="text-white font-semibold">{mode.title}</h3>
                  <p className="text-white/40 text-sm mt-1">{mode.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
