"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import DraggableSticker from "@/components/canvas/DraggableSticker";
import DraggableWidget from "@/components/widgets/DraggableWidget";
import Toolbar from "@/components/canvas/Toolbar";
import FloatingDock from "@/components/canvas/FloatingDock";
import SidePanel from "@/components/canvas/SidePanel";
import { useSearchParams, useRouter } from "next/navigation";
import { localGetUser } from "@/lib/local-auth";
import dynamic from "next/dynamic";

const WelcomeScreen = dynamic(() => import("@/components/canvas/WelcomeScreen"), { ssr: false });
const ArtifactNotification = dynamic(() => import("@/components/planet/ArtifactNotification"), { ssr: false });

function CanvasInner() {
  const { bgColor, bgGradient, placedStickers, widgets, setSelectedWidget, loadTheme } = useCanvasStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState("Explorer");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Auth check
    const user = localGetUser();
    if (!user) { router.push("/auth"); return; }
    setUsername(user.username || user.email?.split("@")[0] || "Explorer");

    // Load shared theme from URL
    const themeParam = searchParams.get("theme");
    if (themeParam) {
      try {
        const json = decodeURIComponent(escape(atob(themeParam)));
        loadTheme(JSON.parse(json));
        localStorage.setItem("life-os-canvas-setup", "done");
        return;
      } catch { /* invalid */ }
    }

    // First time setup
    const setupDone = localStorage.getItem("life-os-canvas-setup");
    if (!setupDone) setShowWelcome(true);
    else setShowWelcome(false);
  }, [searchParams, loadTheme, router]);

  if (!mounted) return <div className="w-screen h-screen bg-[#0f0f1a]" />;

  return (
    <>
      {/* Welcome screen for first time users */}
      {showWelcome && (
        <WelcomeScreen username={username} onDone={() => setShowWelcome(false)} />
      )}

      {/* Main canvas */}
      <div
        ref={canvasRef}
        className="w-screen h-screen overflow-hidden relative"
        style={{ background: bgGradient || bgColor }}
        onClick={(e) => { if (e.target === canvasRef.current) setSelectedWidget(null); }}
      >
        {/* Top toolbar */}
        <Toolbar />

        {/* Left floating dock */}
        <FloatingDock />

        {/* Stickers */}
        {placedStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} />
        ))}

        {/* Widgets */}
        {widgets.map((widget) => (
          <DraggableWidget key={widget.id} widget={widget} />
        ))}

        {/* Empty hint */}
        {placedStickers.length === 0 && widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-white/20 text-2xl font-light">Your canvas is empty</p>
              <p className="text-white/10 text-sm mt-2">
                Add stickers & widgets from the toolbar · Open modes from the left dock
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Side panel — slides over canvas */}
      <SidePanel />

      {/* Artifact unlock notifications */}
      <ArtifactNotification />
    </>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0f0f1a]" />}>
      <CanvasInner />
    </Suspense>
  );
}
