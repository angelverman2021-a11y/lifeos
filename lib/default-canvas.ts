import { CanvasTheme } from "@/types";

export const DEFAULT_CANVAS_TEMPLATES: { id: string; name: string; emoji: string; desc: string; theme: CanvasTheme }[] = [
  {
    id: "cosmic",
    name: "Cosmic Dark",
    emoji: "🌌",
    desc: "Deep space vibes with purple tones",
    theme: {
      id: "default-cosmic",
      name: "Cosmic Dark",
      bgGradient: "linear-gradient(135deg, #0f0f1a, #1a0533, #0d1b2a)",
      bgColor: "#0f0f1a",
      placedStickers: [
        { id: "ds1", stickerUrl: "https://em-content.zobj.net/source/twitter/376/star_2b50.png", x: 80, y: 120, width: 60, height: 60, rotation: 15 },
        { id: "ds2", stickerUrl: "https://em-content.zobj.net/source/twitter/376/ringed-planet_1fa90.png", x: 700, y: 80, width: 80, height: 80, rotation: -10 },
        { id: "ds3", stickerUrl: "https://em-content.zobj.net/source/twitter/376/shooting-star_1f320.png", x: 600, y: 400, width: 55, height: 55, rotation: 20 },
        { id: "ds4", stickerUrl: "https://em-content.zobj.net/source/twitter/376/full-moon_1f315.png", x: 150, y: 380, width: 50, height: 50, rotation: 0 },
      ],
      widgets: [
        { id: "dw1", type: "notes", x: 220, y: 100, width: 280, height: 200, title: "My Notes", content: "Welcome to your cosmic canvas! ✨\n\nStart writing your thoughts here..." },
        { id: "dw2", type: "timer", x: 550, y: 200, width: 240, height: 260, title: "Focus Timer" },
      ],
    },
  },
  {
    id: "aesthetic",
    name: "Soft Aesthetic",
    emoji: "🌸",
    desc: "Pastel pink & flower vibes",
    theme: {
      id: "default-aesthetic",
      name: "Soft Aesthetic",
      bgGradient: "linear-gradient(135deg, #2d1b3d, #1a1035, #2d1b2e)",
      bgColor: "#2d1b3d",
      placedStickers: [
        { id: "as1", stickerUrl: "https://em-content.zobj.net/source/twitter/376/cherry-blossom_1f338.png", x: 60, y: 80, width: 70, height: 70, rotation: -15 },
        { id: "as2", stickerUrl: "https://em-content.zobj.net/source/twitter/376/sparkling-heart_1f496.png", x: 720, y: 100, width: 60, height: 60, rotation: 10 },
        { id: "as3", stickerUrl: "https://em-content.zobj.net/source/twitter/376/butterfly_1f98b.png", x: 650, y: 380, width: 65, height: 65, rotation: -5 },
        { id: "as4", stickerUrl: "https://em-content.zobj.net/source/twitter/376/sunflower_1f33b.png", x: 100, y: 380, width: 55, height: 55, rotation: 8 },
      ],
      widgets: [
        { id: "aw1", type: "notes", x: 200, y: 90, width: 300, height: 220, title: "My Notes 🌸", content: "Hello beautiful! 🌸\n\nThis is your aesthetic space..." },
        { id: "aw2", type: "tracker", x: 540, y: 150, width: 260, height: 220, title: "My Tasks", content: "[]" },
      ],
    },
  },
  {
    id: "minimal",
    name: "Clean Minimal",
    emoji: "⬜",
    desc: "Clean white & minimal layout",
    theme: {
      id: "default-minimal",
      name: "Clean Minimal",
      bgColor: "#f8f9fa",
      bgGradient: "",
      placedStickers: [],
      widgets: [
        { id: "mw1", type: "notes", x: 100, y: 100, width: 320, height: 250, title: "Notes", content: "" },
        { id: "mw2", type: "tracker", x: 460, y: 100, width: 280, height: 250, title: "Tasks", content: "[]" },
        { id: "mw3", type: "timer", x: 780, y: 100, width: 220, height: 260, title: "Timer" },
      ],
    },
  },
  {
    id: "blank",
    name: "Blank Canvas",
    emoji: "🎨",
    desc: "Start fresh — completely empty",
    theme: {
      id: "default-blank",
      name: "Blank Canvas",
      bgColor: "#0f0f1a",
      bgGradient: "",
      placedStickers: [],
      widgets: [],
    },
  },
];
