export type WidgetType = "notes" | "timer" | "tracker";

export interface NotePage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  date: string; // YYYY-MM-DD
  category: string;
  completedAt?: string;
}

export interface TimetableSlot {
  id: string;
  day: string; // Mon, Tue...
  time: string; // e.g. "09:00"
  subject: string;
  color: string;
}

export interface TrackerData {
  tasks: Task[];
  timetable: TimetableSlot[];
}

export interface Widget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  icon?: string;
  title: string;
  content?: string;
  pages?: NotePage[];
  activePageId?: string;
  trackerData?: TrackerData;
}

export interface StickerItem {
  id: string;
  url: string;
  name: string;
  bundle: string;
}

export interface StickerBundle {
  id: string;
  name: string;
  emoji: string;
  stickers: StickerItem[];
}

export interface CanvasTheme {
  id: string;
  name: string;
  bgColor: string;
  bgGradient?: string;
  bgImage?: string;
  pattern?: string;
  placedStickers: PlacedSticker[];
  widgets: Widget[];
  createdBy?: string;
  isPublic?: boolean;
}

export interface PlacedSticker {
  id: string;
  stickerUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
