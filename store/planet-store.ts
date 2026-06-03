import { create } from "zustand";

export interface Artifact {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt: string;
}

export interface PlanetState {
  name: string;
  stage: number; // 1-5
  mindEnergy: number;
  hustleEnergy: number;
  creativeEnergy: number;
  memoryEnergy: number;
  streakFire: number;
  totalActions: number;
  artifacts: Artifact[];
  lastActive: string;
  streakDays: number;
}

interface PlanetStore extends PlanetState {
  setPlanetName: (name: string) => void;
  addEnergy: (type: "mind" | "hustle" | "creative" | "memory" | "streak", amount: number) => void;
  checkAndUnlockArtifacts: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "life-os-planet";

const ARTIFACTS: Omit<Artifact, "unlockedAt">[] = [
  { id: "first_note", name: "Ancient Scroll", emoji: "📜", description: "Wrote your first note" },
  { id: "notes_10", name: "Library Tower", emoji: "🏛️", description: "Created 10 notes" },
  { id: "first_task", name: "Iron Hammer", emoji: "🔨", description: "Completed your first task" },
  { id: "tasks_20", name: "Golden Trophy", emoji: "🏆", description: "Completed 20 tasks" },
  { id: "first_quiz", name: "Crystal Ball", emoji: "🔮", description: "Completed your first quiz" },
  { id: "streak_3", name: "Flame Torch", emoji: "🔥", description: "3 day streak" },
  { id: "streak_7", name: "Solar Crown", emoji: "👑", description: "7 day streak" },
  { id: "first_job", name: "Briefcase", emoji: "💼", description: "Added first job application" },
  { id: "first_memory", name: "Memory Crystal", emoji: "💎", description: "Created first memory" },
  { id: "stage_3", name: "Living World", emoji: "🌍", description: "Reached Stage 3" },
  { id: "stage_5", name: "Legendary Universe", emoji: "🌌", description: "Reached Stage 5" },
  { id: "total_100", name: "Century Stone", emoji: "💯", description: "100 total actions" },
];

function getStage(total: number): number {
  if (total >= 500) return 5;
  if (total >= 200) return 4;
  if (total >= 75) return 3;
  if (total >= 20) return 2;
  return 1;
}

const DEFAULT_STATE: PlanetState = {
  name: "My Planet",
  stage: 1,
  mindEnergy: 0,
  hustleEnergy: 0,
  creativeEnergy: 0,
  memoryEnergy: 0,
  streakFire: 0,
  totalActions: 0,
  artifacts: [],
  lastActive: "",
  streakDays: 0,
};

export const usePlanetStore = create<PlanetStore>((set, get) => ({
  ...DEFAULT_STATE,

  setPlanetName: (name) => {
    set({ name });
    get().saveToStorage();
  },

  addEnergy: (type, amount) => {
    const state = get();
    const updates: Partial<PlanetState> = {
      totalActions: state.totalActions + amount,
    };

    if (type === "mind") updates.mindEnergy = state.mindEnergy + amount;
    else if (type === "hustle") updates.hustleEnergy = state.hustleEnergy + amount;
    else if (type === "creative") updates.creativeEnergy = state.creativeEnergy + amount;
    else if (type === "memory") updates.memoryEnergy = state.memoryEnergy + amount;
    else if (type === "streak") updates.streakFire = state.streakFire + amount;

    // Update stage
    const newTotal = state.totalActions + amount;
    updates.stage = getStage(newTotal);

    // Update streak
    const today = new Date().toDateString();
    if (state.lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = state.lastActive === yesterday.toDateString();
      updates.streakDays = wasYesterday ? state.streakDays + 1 : 1;
      updates.lastActive = today;
    }

    set(updates);
    get().checkAndUnlockArtifacts();
    get().saveToStorage();
  },

  checkAndUnlockArtifacts: () => {
    const state = get();
    const unlockedIds = state.artifacts.map((a) => a.id);
    const newArtifacts: Artifact[] = [];

    const checks: { id: string; condition: boolean }[] = [
      { id: "first_note", condition: state.mindEnergy >= 1 },
      { id: "notes_10", condition: state.mindEnergy >= 100 },
      { id: "first_task", condition: state.hustleEnergy >= 1 },
      { id: "tasks_20", condition: state.hustleEnergy >= 200 },
      { id: "first_quiz", condition: state.mindEnergy >= 25 },
      { id: "streak_3", condition: state.streakDays >= 3 },
      { id: "streak_7", condition: state.streakDays >= 7 },
      { id: "first_job", condition: state.hustleEnergy >= 20 },
      { id: "first_memory", condition: state.memoryEnergy >= 1 },
      { id: "stage_3", condition: state.stage >= 3 },
      { id: "stage_5", condition: state.stage >= 5 },
      { id: "total_100", condition: state.totalActions >= 100 },
    ];

    checks.forEach(({ id, condition }) => {
      if (condition && !unlockedIds.includes(id)) {
        const artifact = ARTIFACTS.find((a) => a.id === id);
        if (artifact) {
          newArtifacts.push({ ...artifact, unlockedAt: new Date().toISOString() });
        }
      }
    });

    if (newArtifacts.length > 0) {
      set({ artifacts: [...state.artifacts, ...newArtifacts] });
      get().saveToStorage();
    }
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) set({ ...DEFAULT_STATE, ...JSON.parse(saved) });
    } catch { /* ignore */ }
  },

  saveToStorage: () => {
    if (typeof window === "undefined") return;
    const { setPlanetName, addEnergy, checkAndUnlockArtifacts, loadFromStorage, saveToStorage, ...state } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
}));

export { getStage };
