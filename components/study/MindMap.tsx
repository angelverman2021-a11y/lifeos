"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, X, BookOpen, Expand } from "lucide-react";

interface Branch { label: string; color: string; nodes: string[]; }
interface MindMap { center: string; branches: Branch[]; }
interface ExpandedNodes { [key: string]: string[]; }
interface LoadingNodes { [key: string]: boolean; }

interface PopupState {
  node: string;
  branchLabel: string;
  color: string;
  x: number;
  y: number;
}

interface NodeProps {
  node: string;
  branch: Branch;
  centerTopic: string;
  expandedNodes: ExpandedNodes;
  loadingNodes: LoadingNodes;
  onNodeClick: (node: string, branch: Branch, e: React.MouseEvent) => void;
  depth?: number;
}

function NodeItem({ node, branch, centerTopic, expandedNodes, loadingNodes, onNodeClick, depth = 0 }: NodeProps) {
  const key = `${branch.label}::${node}`;
  const isExpanded = !!expandedNodes[key];
  const isLoading = !!loadingNodes[key];

  return (
    <div className={`${depth > 0 ? "ml-4 border-l-2 pl-3" : ""}`}
      style={{ borderColor: depth > 0 ? branch.color + "40" : "transparent" }}>
      <button
        onClick={(e) => onNodeClick(node, branch, e)}
        className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all hover:scale-[1.02] flex items-center justify-between gap-2 group mb-1"
        style={{ background: branch.color + "15", border: `1px solid ${branch.color}30` }}
      >
        <span className="text-white/80 group-hover:text-white transition-colors">{node}</span>
        {isLoading
          ? <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          : <span className="text-white/20 group-hover:text-white/50 text-xs flex-shrink-0">+</span>
        }
      </button>

      {/* Expanded sub-nodes */}
      <AnimatePresence>
        {isExpanded && expandedNodes[key] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-1"
          >
            {expandedNodes[key].map((subNode, i) => (
              <NodeItem
                key={i}
                node={subNode}
                branch={branch}
                centerTopic={centerTopic}
                expandedNodes={expandedNodes}
                loadingNodes={loadingNodes}
                onNodeClick={onNodeClick}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MindMap() {
  const [topic, setTopic] = useState("");
  const [mindmap, setMindmap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});
  const [loadingNodes, setLoadingNodes] = useState<LoadingNodes>({});
  const [definition, setDefinition] = useState<string>("");
  const [defLoading, setDefLoading] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setExpandedNodes({});
    setPopup(null);
    try {
      const res = await fetch("/api/ai/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.error) { alert("AI Error: " + data.error); setLoading(false); return; }
      setMindmap(data.mindmap);
    } catch {
      alert("Failed to connect to AI.");
    }
    setLoading(false);
  }

  function onNodeClick(node: string, branch: Branch, e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ node, branchLabel: branch.label, color: branch.color, x: rect.left, y: rect.bottom + 8 });
    setDefinition("");
  }

  async function getDefinition() {
    if (!popup || !mindmap) return;
    setDefLoading(true);
    try {
      const res = await fetch("/api/ai/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node: popup.node, parentTopic: mindmap.center }),
      });
      const data = await res.json();
      setDefinition(data.definition || data.error);
    } catch {
      setDefinition("Failed to load definition.");
    }
    setDefLoading(false);
  }

  async function expandNode() {
    if (!popup || !mindmap) return;
    const key = `${popup.branchLabel}::${popup.node}`;
    setPopup(null);

    // Toggle collapse if already expanded
    if (expandedNodes[key]) {
      setExpandedNodes((prev) => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }

    setLoadingNodes((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/ai/mindmap-expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node: popup.node, parentTopic: mindmap.center }),
      });
      const data = await res.json();
      if (data.nodes) setExpandedNodes((prev) => ({ ...prev, [key]: data.nodes }));
    } catch {
      alert("Failed to expand node.");
    }
    setLoadingNodes((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  return (
    <div className="space-y-6" onClick={() => setPopup(null)}>
      {/* Input */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
          <GitBranch size={18} className="text-green-400" /> Mind Map Generator
        </h2>
        <p className="text-white/40 text-sm mb-4">
          Enter a topic → click any node to define or expand it further.
        </p>
        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. Machine Learning, French Revolution, JavaScript..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
          />
          <button onClick={generate} disabled={loading || !topic.trim()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-2 text-sm">
            <GitBranch size={14} />
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-white/40 gap-3">
          <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          Building your mind map...
        </div>
      )}

      {/* Mind Map */}
      {mindmap && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">

          {/* Center topic */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl px-6 py-3 text-white font-bold text-base shadow-lg shadow-purple-500/30">
              {mindmap.center}
            </div>
          </div>

          {/* Branches grid */}
          <div className="grid grid-cols-2 gap-4">
            {mindmap.branches.map((branch, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-4"
                style={{ background: branch.color + "10", border: `1px solid ${branch.color}30` }}
              >
                {/* Branch header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: branch.color }} />
                  <span className="text-white font-semibold text-sm">{branch.label}</span>
                </div>

                {/* Nodes */}
                <div className="space-y-1">
                  {branch.nodes.map((node, j) => (
                    <NodeItem
                      key={j}
                      node={node}
                      branch={branch}
                      centerTopic={mindmap.center}
                      expandedNodes={expandedNodes}
                      loadingNodes={loadingNodes}
                      onNodeClick={onNodeClick}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Popup */}
          <AnimatePresence>
            {popup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-50 bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 shadow-2xl w-72"
                style={{ top: Math.min(popup.y, window.innerHeight - 280), left: Math.min(popup.x, window.innerWidth - 300) }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold text-sm truncate">{popup.node}</span>
                  <button onClick={() => { setPopup(null); setDefinition(""); }}
                    className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-3">
                  <button onClick={getDefinition}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-white/70 hover:text-white text-xs transition-all">
                    <BookOpen size={12} /> Define
                  </button>
                  <button onClick={expandNode}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-white text-xs transition-all"
                    style={{ background: popup.color + "30", border: `1px solid ${popup.color}50` }}>
                    <Expand size={12} />
                    {expandedNodes[`${popup.branchLabel}::${popup.node}`] ? "Collapse" : "Expand"}
                  </button>
                </div>

                {/* Definition result */}
                <AnimatePresence>
                  {(defLoading || definition) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white/5 rounded-xl p-3">
                      {defLoading
                        ? <div className="flex items-center gap-2 text-white/40 text-xs">
                            <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
                            Loading definition...
                          </div>
                        : <p className="text-white/70 text-xs leading-relaxed">{definition}</p>
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
