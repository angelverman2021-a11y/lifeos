"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Mail, MessageSquare } from "lucide-react";

const TONES = [
  { id: "professional", label: "Professional", emoji: "👔" },
  { id: "friendly", label: "Friendly", emoji: "😊" },
  { id: "bold", label: "Bold", emoji: "🔥" },
];

export default function ColdEmail() {
  const [type, setType] = useState<"email" | "dm">("email");
  const [yourName, setYourName] = useState("");
  const [yourRole, setYourRole] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("professional");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!yourName.trim() || !yourRole.trim() || !purpose.trim()) return;
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, yourName, yourRole, targetName, targetCompany, purpose, tone }),
      });
      const data = await res.json();
      if (data.error) setMessage("❌ " + data.error);
      else setMessage(data.message);
    } catch { setMessage("❌ Failed to connect to AI."); }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">✉️ Cold Email / DM Generator</h2>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setType("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all border ${
              type === "email" ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
            }`}>
            <Mail size={14} /> Cold Email
          </button>
          <button onClick={() => setType("dm")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all border ${
              type === "dm" ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
            }`}>
            <MessageSquare size={14} /> LinkedIn DM
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={yourName} onChange={(e) => setYourName(e.target.value)}
            placeholder="Your name *" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
          <input value={yourRole} onChange={(e) => setYourRole(e.target.value)}
            placeholder="Your role *" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
          <input value={targetName} onChange={(e) => setTargetName(e.target.value)}
            placeholder="Recipient name" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
          <input value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="Company name" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
        </div>

        <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose (e.g. asking for a referral, requesting a coffee chat, applying for internship...)"
          rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none text-sm mb-3" />

        {/* Tone */}
        <div className="flex gap-2 mb-4">
          {TONES.map((t) => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm transition-all border ${
                tone === t.id ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
              }`}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={loading || !yourName.trim() || !yourRole.trim() || !purpose.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
          <Sparkles size={16} />
          {loading ? "Writing your message..." : "Generate Message"}
        </button>
      </div>

      <AnimatePresence>
        {(loading || message) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            {loading ? (
              <div className="flex items-center gap-3 text-white/50">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Crafting your perfect message...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium text-sm">✨ Your {type === "email" ? "Email" : "DM"}</p>
                  <button onClick={copy}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                      copied ? "bg-green-500/20 text-green-300" : "bg-white/10 hover:bg-white/20 text-white/60"
                    }`}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/3 rounded-xl p-3">{message}</p>
                <button onClick={generate}
                  className="mt-3 text-purple-400 hover:text-purple-300 text-xs transition-colors">
                  🔄 Regenerate
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
