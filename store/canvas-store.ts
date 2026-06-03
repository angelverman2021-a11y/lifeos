import { create } from "zustand";
import { CanvasTheme, PlacedSticker, Widget } from "@/types";

interface CanvasStore {
  bgColor: string;
  bgGradient: string;
  placedStickers: PlacedSticker[];
  widgets: Widget[];
  selectedWidgetId: string | null;
  activePanel: "none" | "study" | "job" | "journal" | "vector" | "founder" | "builder" | "settings";
  setBgColor: (color: string) => void;
  setBgGradient: (gradient: string) => void;
  addSticker: (sticker: PlacedSticker) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  setSelectedWidget: (id: string | null) => void;
  setActivePanel: (panel: CanvasStore["activePanel"]) => void;
  loadTheme: (theme: CanvasTheme) => void;
  getThemeSnapshot: () => Partial<CanvasTheme>;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  bgColor: "#0f0f1a",
  bgGradient: "",
  placedStickers: [],
  widgets: [],
  selectedWidgetId: null,
  activePanel: "none",

  setBgColor: (color) => set({ bgColor: color, bgGradient: "" }),
  setBgGradient: (gradient) => set({ bgGradient: gradient, bgColor: "" }),

  addSticker: (sticker) =>
    set((s) => ({ placedStickers: [...s.placedStickers, sticker] })),

  updateSticker: (id, updates) =>
    set((s) => ({
      placedStickers: s.placedStickers.map((st) =>
        st.id === id ? { ...st, ...updates } : st
      ),
    })),

  removeSticker: (id) =>
    set((s) => ({
      placedStickers: s.placedStickers.filter((st) => st.id !== id),
    })),

  addWidget: (widget) =>
    set((s) => ({ widgets: [...s.widgets, widget] })),

  updateWidget: (id, updates) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  removeWidget: (id) =>
    set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

  setSelectedWidget: (id) => set({ selectedWidgetId: id }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  loadTheme: (theme) =>
    set({
      bgColor: theme.bgColor || "#0f0f1a",
      bgGradient: theme.bgGradient || "",
      placedStickers: theme.placedStickers || [],
      widgets: theme.widgets || [],
    }),

  getThemeSnapshot: () => {
    const { bgColor, bgGradient, placedStickers, widgets } = get();
    return { bgColor, bgGradient, placedStickers, widgets };
  },
}));
