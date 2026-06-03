"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ExternalLink, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Job {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected" | "Saved";
  date: string;
  link?: string;
  notes?: string;
  salary?: string;
}

const STATUS_CONFIG = {
  Saved:     { color: "bg-white/10 text-white/50",        dot: "bg-white/30" },
  Applied:   { color: "bg-blue-500/20 text-blue-300",     dot: "bg-blue-400" },
  Interview: { color: "bg-yellow-500/20 text-yellow-300", dot: "bg-yellow-400" },
  Offer:     { color: "bg-green-500/20 text-green-300",   dot: "bg-green-400" },
  Rejected:  { color: "bg-red-500/20 text-red-300",       dot: "bg-red-400" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as Job["status"][];
const STORAGE_KEY = "life-os-jobs";

function getJobs(): Job[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveJobs(jobs: Job[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<Job["status"] | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ company: "", role: "", status: "Applied" as Job["status"], link: "", salary: "", notes: "" });

  useEffect(() => { setJobs(getJobs()); }, []);

  function addJob() {
    if (!form.company.trim() || !form.role.trim()) return;
    const newJob: Job = { id: uuidv4(), ...form, date: new Date().toISOString().split("T")[0] };
    const updated = [newJob, ...jobs];
    saveJobs(updated); setJobs(updated);
    setForm({ company: "", role: "", status: "Applied", link: "", salary: "", notes: "" });
    setShowAdd(false);
  }

  function updateStatus(id: string, status: Job["status"]) {
    const updated = jobs.map((j) => j.id === id ? { ...j, status } : j);
    saveJobs(updated); setJobs(updated);
  }

  function deleteJob(id: string) {
    const updated = jobs.filter((j) => j.id !== id);
    saveJobs(updated); setJobs(updated);
  }

  const filtered = filter === "All" ? jobs : jobs.filter((j) => j.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.status === s).length }), {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-5 gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "All" : s)}
            className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.02] ${
              filter === s ? STATUS_CONFIG[s].color + " border-current/30" : "bg-white/5 border-white/10"
            }`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${STATUS_CONFIG[s].dot}`} />
            <p className="text-white font-bold text-lg">{counts[s] || 0}</p>
            <p className="text-white/40 text-xs">{s}</p>
          </button>
        ))}
      </div>

      {/* Add job form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Add New Application</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name *" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Job role *" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
              <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="Salary (optional)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="Job link (optional)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500" />
            </div>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-1.5 rounded-xl text-xs transition-all border ${
                    form.status === s ? STATUS_CONFIG[s].color : "bg-white/5 border-white/10 text-white/30"
                  }`}>{s}</button>
              ))}
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)" rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 py-2.5 rounded-xl text-sm transition-all">Cancel</button>
              <button onClick={addJob} disabled={!form.company || !form.role}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all">
                Add Application
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add button */}
      {!showAdd && (
        <button onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-2xl py-3 text-white/40 hover:text-white transition-all">
          <Plus size={16} /> Add Job Application
        </button>
      )}

      {/* Job list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-white/20 text-sm text-center py-8">No applications yet. Start tracking! 💼</p>
        )}
        {filtered.map((job) => (
          <motion.div key={job.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all">
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[job.status].dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{job.role}</p>
                <p className="text-white/40 text-xs">{job.company} · {job.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_CONFIG[job.status].color}`}>{job.status}</span>
                <ChevronDown size={14} className={`text-white/30 transition-transform ${expandedId === job.id ? "rotate-180" : ""}`} />
              </div>
            </div>

            <AnimatePresence>
              {expandedId === job.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/5">
                  <div className="p-4 space-y-3">
                    {job.salary && <p className="text-white/50 text-xs">💰 {job.salary}</p>}
                    {job.notes && <p className="text-white/50 text-xs bg-white/5 rounded-lg p-2">{job.notes}</p>}

                    {/* Status update */}
                    <div>
                      <p className="text-white/30 text-xs mb-2">Update Status</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUSES.map((s) => (
                          <button key={s} onClick={() => updateStatus(job.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                              job.status === s ? STATUS_CONFIG[s].color : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                            }`}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {job.link && (
                        <a href={job.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-xs transition-all">
                          <ExternalLink size={12} /> View Job
                        </a>
                      )}
                      <button onClick={() => deleteJob(job.id)}
                        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs transition-all ml-auto">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
